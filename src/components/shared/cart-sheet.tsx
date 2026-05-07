"use client";

import Link from "next/link";
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

export function CartSheet() {
  const items = useCartStore((state) => state.items);
  const removeCourt = useCartStore((state) => state.removeCourt);
  const removeTimeSlot = useCartStore((state) => state.removeTimeSlot);
  const pruneExpiredItems = useCartStore((state) => state.pruneExpiredItems);
  const clearCart = useCartStore((state) => state.clearCart);
  const [nowTick, setNowTick] = useState(Date.now());

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
                <div key={item.court.id} className="bg-card rounded-xl border p-3 shadow-sm">
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
                            useCartStore
                              .getState()
                              .saveCourtBooking(item.court, selectedDate, timeSlots);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeCourt(item.court.id)}
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
                              onClick={() => removeTimeSlot(item.court.id, slot.id)}
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

              <div className="flex items-center gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={clearCart}>
                  Clear cart
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/search">Continue booking</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
