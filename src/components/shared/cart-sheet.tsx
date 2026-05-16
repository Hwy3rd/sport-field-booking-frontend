"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Clock3, Pencil, ShoppingCart, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { CourtBookingDialog } from "@/components/shared/court-booking-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatBookingDate, formatHoldTime } from "@/lib/helper/date";
import { useCartStore } from "@/stores/cart.store";
import { ROUTES } from "@/lib/constants/routes.constant";
import { useUnlockTimeSlot, useLockTimeSlot } from "@/hooks/useTimeSlot";
import { toast } from "sonner";

export function CartSheet() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const removeCourt = useCartStore((state) => state.removeCourt);
  const removeTimeSlot = useCartStore((state) => state.removeTimeSlot);
  const pruneExpiredItems = useCartStore((state) => state.pruneExpiredItems);
  const clearCart = useCartStore((state) => state.clearCart);
  const saveCourtBooking = useCartStore((state) => state.saveCourtBooking);
  const [nowTick, setNowTick] = useState(Date.now());
  const unlockTimeSlotMutation = useUnlockTimeSlot();
  const lockTimeSlotMutation = useLockTimeSlot();
  const [editingCartLockId, setEditingCartLockId] = useState<string | null>(null);

  const handleEditCart = async (
    item: any,
    selectedDate: string,
    newTimeSlots: any[],
  ) => {
    setEditingCartLockId(item.court.id);
    try {
      const oldSlotIds = item.timeSlots.map((s: any) => s.id);
      const newSlotIds = newTimeSlots.map((s: any) => s.id);
      
      const toUnlock = oldSlotIds.filter((id: string) => !newSlotIds.includes(id));
      const toLock = newSlotIds.filter((id: string) => !oldSlotIds.includes(id));

      await Promise.all([
        ...toUnlock.map((id: string) => unlockTimeSlotMutation.mutateAsync(id)),
        ...toLock.map((id: string) => lockTimeSlotMutation.mutateAsync(id)),
      ]);

      if (item.selectedDate !== selectedDate) {
        removeCourt(item.court.id, item.selectedDate);
      }
      saveCourtBooking(item.court, selectedDate, newTimeSlots);
      toast.success("Cart updated successfully");
    } catch {
      toast.error("Failed to update cart. Some slots might be unavailable.");
    } finally {
      setEditingCartLockId(null);
    }
  };

  const handleUnlockAndRemoveCourt = async (
    courtId: string,
    selectedDate: string,
    timeSlots: { id: string }[],
  ) => {
    try {
      await Promise.all(timeSlots.map((slot) => unlockTimeSlotMutation.mutateAsync(slot.id)));
      removeCourt(courtId, selectedDate);
    } catch {
      toast.error("Failed to unlock some slots");
      removeCourt(courtId, selectedDate);
    }
  };

  const handleUnlockAndRemoveSlot = async (
    courtId: string,
    selectedDate: string,
    slotId: string,
  ) => {
    try {
      await unlockTimeSlotMutation.mutateAsync(slotId);
      removeTimeSlot(courtId, selectedDate, slotId);
    } catch {
      toast.error("Failed to unlock slot");
      removeTimeSlot(courtId, selectedDate, slotId);
    }
  };

  const handleClearCart = async () => {
    const allSlots = items.flatMap((item) => item.timeSlots);
    try {
      await Promise.all(allSlots.map((slot) => unlockTimeSlotMutation.mutateAsync(slot.id)));
      clearCart();
    } catch {
      clearCart();
    }
  };

  useEffect(() => {
    pruneExpiredItems();
    const timer = window.setInterval(() => setNowTick(Date.now()), 1000);
    const pruneTimer = window.setInterval(() => pruneExpiredItems(), 1000);
    return () => {
      window.clearInterval(timer);
      window.clearInterval(pruneTimer);
    };
  }, [pruneExpiredItems]);

  const cartTotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.timeSlots.reduce((slotSum, slot) => slotSum + slot.price, 0),
        0,
      ),
    [items],
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="bg-card relative h-11 w-11 rounded-xl">
          <ShoppingCart className="h-4 w-4" />
          {items.length > 0 ? (
            <span className="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 rounded-full px-1.5 text-[10px] font-semibold">
              {items.length}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full max-w-md p-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle>Selected courts</SheetTitle>
          <SheetDescription>Courts added to your cart before booking</SheetDescription>
        </SheetHeader>

        <div className="space-y-3 p-5">
          {items.length === 0 ? (
            <EmptyState
              title="Your cart is empty"
              description="Add a court, choose a date, and select time slots to start building your booking."
            />
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={`${item.court.id}-${item.selectedDate}`}
                  className="bg-card rounded-xl border p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <Link
                        href={`/courts/${item.court.id}`}
                        className="text-foreground hover:text-primary line-clamp-1 text-sm font-semibold"
                      >
                        {item.court.name}
                      </Link>
                      <div className="text-muted-foreground text-xs">
                        {item.court.venue?.name ?? "Unknown venue"}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                        <span>{item.court.pricePerHour.toLocaleString()} VND / hour</span>
                        <Badge variant="outline">{item.court.status}</Badge>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        Selected day: {formatBookingDate(item.selectedDate)}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        Hold: {formatHoldTime(item.createdAt, item.holdMinutes, nowTick)} left
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <CourtBookingDialog
                          court={item.court}
                          title="Edit time slots"
                          description="Change the selected date and time slots for this court."
                          confirmLabel="Save changes"
                          initialDate={item.selectedDate}
                          initialTimeSlots={item.timeSlots}
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          }
                          onConfirm={({ selectedDate, timeSlots }) => {
                            handleEditCart(item, selectedDate, timeSlots);
                          }}
                          isSubmitting={editingCartLockId === item.court.id}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleUnlockAndRemoveCourt(
                              item.court.id,
                              item.selectedDate,
                              item.timeSlots,
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                      Selected time slots
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.timeSlots.length === 0 ? (
                        <span className="text-muted-foreground text-sm">No slots selected yet</span>
                      ) : (
                        item.timeSlots.map((slot) => (
                          <Badge key={slot.id} variant="secondary" className="gap-1">
                            {slot.startTime} - {slot.endTime}
                            <button
                              type="button"
                              className="text-muted-foreground hover:bg-muted hover:text-foreground ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full transition-colors"
                              onClick={() =>
                                handleUnlockAndRemoveSlot(item.court.id, item.selectedDate, slot.id)
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Court total</span>
                      <span className="font-semibold">
                        {item.timeSlots.reduce((sum, slot) => sum + slot.price, 0).toLocaleString()}{" "}
                        VND
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-muted/20 rounded-xl border p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Cart total</span>
                  <span className="font-semibold">{cartTotal.toLocaleString()} VND</span>
                </div>
                <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
                  <Clock3 className="h-3.5 w-3.5" />
                  Hold countdown updates every second.
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <Button className="w-full" onClick={() => router.push(ROUTES.CHECKOUT)}>
                  Proceed to Checkout
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleClearCart}>
                    Clear cart
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={ROUTES.SEARCH}>Continue booking</Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
