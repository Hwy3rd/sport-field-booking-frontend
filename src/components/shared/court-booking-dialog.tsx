"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, MapPin, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useTimeSlots } from "@/hooks/useTimeSlot";
import {
  addDaysToLocalDateString,
  formatBookingDate,
  getLocalDateString,
  isDateWithinRange,
} from "@/lib/helper/date";
import type { Court } from "@/types/court.type";
import type { TimeSlot } from "@/types/time-slot.type";

const BOOKING_HOLD_MINUTES = 10;
const BOOKING_WINDOW_DAYS = 30;
const EMPTY_TIME_SLOTS: TimeSlot[] = [];

type CourtSummary = Pick<
  Court,
  "id" | "name" | "pricePerHour" | "status" | "venueId" | "imageUrl"
> & {
  venue?: Pick<NonNullable<Court["venue"]>, "id" | "name">;
};

type CourtTimeSlotPickerProps = {
  courtId: string;
  selectedDate: string;
  selectedTimeSlotIds: string[];
  onSelectedDateChange: (date: string) => void;
  onSelectedTimeSlotIdsChange: (timeSlotIds: string[]) => void;
  selectedSlots?: TimeSlot[];
  showSelectionSummary?: boolean;
};

export function CourtTimeSlotPicker({
  courtId,
  selectedDate,
  selectedTimeSlotIds,
  onSelectedDateChange,
  onSelectedTimeSlotIdsChange,
  selectedSlots = [],
  showSelectionSummary = true,
}: CourtTimeSlotPickerProps) {
  const today = getLocalDateString();
  const maxDate = addDaysToLocalDateString(today, BOOKING_WINDOW_DAYS);
  const slotsQuery = useTimeSlots({ courtId, date: selectedDate, current: 1, limit: 100 });

  const items = slotsQuery.data?.items ?? [];
  const displaySelectedIds = selectedTimeSlotIds;
  const hasSelectedSlots = showSelectionSummary && selectedSlots.length > 0;

  return (
    <div className="space-y-4">
      <div className="bg-muted/30 grid gap-4 rounded-2xl border p-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CalendarDays className="text-primary h-4 w-4" />
            Select date
          </div>
          <input
            type="date"
            min={today}
            max={maxDate}
            value={selectedDate}
            onChange={(event) => onSelectedDateChange(event.target.value)}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring h-11 w-full rounded-xl border px-3 text-sm shadow-sm outline-none focus-visible:ring-2"
          />
          <p className="text-muted-foreground text-xs">
            Available range: today to {BOOKING_WINDOW_DAYS} days ahead.
          </p>
        </div>

        <div className="bg-background rounded-xl border p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock3 className="text-primary h-4 w-4" />
            Hold timer
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            Selected slots are reserved for {BOOKING_HOLD_MINUTES} minutes in your cart.
          </p>
          <p className="text-muted-foreground mt-3 text-xs">
            This is ready for future slot blocking logic.
          </p>
        </div>
      </div>

      {slotsQuery.isLoading ? (
        <div className="bg-card text-muted-foreground rounded-2xl border p-4 text-sm">
          Loading time slots...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-card text-muted-foreground rounded-2xl border p-4 text-sm">
          No time slots found for {formatBookingDate(selectedDate)}.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((slot) => {
            const isSelected = displaySelectedIds.includes(slot.id);
            const isSelectable = slot.status === "available" || isSelected;

            return (
              <label
                key={slot.id}
                className="bg-card hover:border-primary/40 flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 text-sm shadow-sm transition-colors"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={!isSelectable}
                    onChange={(event) => {
                      if (event.target.checked) {
                        onSelectedTimeSlotIdsChange([...displaySelectedIds, slot.id]);
                        return;
                      }

                      onSelectedTimeSlotIdsChange(
                        displaySelectedIds.filter((id) => id !== slot.id),
                      );
                    }}
                    className="border-input text-primary focus:ring-primary h-4 w-4 rounded"
                  />
                  <div className="min-w-0">
                    <div className="text-foreground font-medium">
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {slot.price.toLocaleString()} VND / slot
                    </div>
                  </div>
                </div>
                <Badge variant={slot.status === "available" ? "success" : "outline"}>
                  {slot.status}
                </Badge>
              </label>
            );
          })}
        </div>
      )}

      {hasSelectedSlots ? (
        <div className="bg-muted/30 text-muted-foreground rounded-2xl border p-4 text-sm">
          Selected {selectedSlots.length} time slot{selectedSlots.length > 1 ? "s" : ""} for{" "}
          {formatBookingDate(selectedDate)}.
        </div>
      ) : null}
    </div>
  );
}

type CourtBookingDialogProps = {
  court: CourtSummary;
  trigger: React.ReactNode;
  title?: string;
  description?: string;
  confirmLabel?: string;
  initialDate?: string;
  initialTimeSlots?: TimeSlot[];
  onConfirm: (payload: { selectedDate: string; timeSlots: TimeSlot[] }) => void;
};

export function CourtBookingDialog({
  court,
  trigger,
  title = "Select time slots",
  description = "Choose a date and at least one available time slot before saving this court.",
  confirmLabel = "Add to cart",
  initialDate,
  initialTimeSlots = EMPTY_TIME_SLOTS,
  onConfirm,
}: CourtBookingDialogProps) {
  const [open, setOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const initialDateKey = initialDate ?? getLocalDateString();
  const [selectedDate, setSelectedDate] = useState(initialDateKey);
  const [selectedSlotsByDate, setSelectedSlotsByDate] = useState<Record<string, TimeSlot[]>>({
    [initialDateKey]: initialTimeSlots,
  });

  const selectedSlotsForDate = selectedSlotsByDate[selectedDate] ?? EMPTY_TIME_SLOTS;
  const selectedTimeSlotIds = selectedSlotsForDate.map((slot) => slot.id);

  useEffect(() => {
    if (!open) {
      return;
    }

    const nextDate = initialDateKey;

    setSelectedDate(nextDate);
    setSelectedSlotsByDate((prev) => {
      if (prev[nextDate]) {
        return prev;
      }

      return {
        ...prev,
        [nextDate]: initialTimeSlots,
      };
    });
  }, [initialDateKey, initialTimeSlots, open]);

  const selectedSlotsQuery = useTimeSlots(
    { courtId: court.id, date: selectedDate, current: 1, limit: 100 },
    { enabled: open },
  );

  const selectedSlots = useMemo(
    () => selectedSlotsByDate[selectedDate] ?? EMPTY_TIME_SLOTS,
    [selectedDate, selectedSlotsByDate],
  );

  const allSelectedSlots = useMemo(
    () => Object.values(selectedSlotsByDate).flat(),
    [selectedSlotsByDate],
  );

  const selectedTotal = allSelectedSlots.reduce((sum, slot) => sum + slot.price, 0);
  const canConfirm =
    allSelectedSlots.length > 0 &&
    isDateWithinRange(
      selectedDate,
      getLocalDateString(),
      addDaysToLocalDateString(getLocalDateString(), BOOKING_WINDOW_DAYS),
    );

  const selectedSlotCards = Object.entries(selectedSlotsByDate).flatMap(([date, slots]) =>
    slots.map((slot) => ({
      date,
      slot,
    })),
  );
  const loginHref = `/login?next=${encodeURIComponent(pathname ?? "/")}`;

  const handleConfirm = () => {
    if (!allSelectedSlots.length) {
      return;
    }

    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    onConfirm({ selectedDate, timeSlots: allSelectedSlots });
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-card rounded-2xl border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-foreground text-base font-semibold">{court.name}</span>
                <Badge variant="outline">{court.status}</Badge>
              </div>
              <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-4 text-sm">
                <span>{court.pricePerHour.toLocaleString()} VND / hour</span>
                <span>{court.venue?.name ?? "Unknown venue"}</span>
              </div>
            </div>

            <CourtTimeSlotPicker
              courtId={court.id}
              selectedDate={selectedDate}
              selectedTimeSlotIds={selectedTimeSlotIds}
              onSelectedDateChange={(date) => {
                setSelectedDate(date);
                setSelectedSlotsByDate((prev) => ({
                  ...prev,
                  [date]: prev[date] ?? EMPTY_TIME_SLOTS,
                }));
              }}
              onSelectedTimeSlotIdsChange={(timeSlotIds) => {
                const currentDateSlots = selectedSlotsQuery.data?.items ?? [];
                const nextSlots = currentDateSlots.filter((slot) => timeSlotIds.includes(slot.id));

                setSelectedSlotsByDate((prev) => ({
                  ...prev,
                  [selectedDate]: nextSlots,
                }));
              }}
              selectedSlots={selectedSlots}
            />

            {selectedSlotCards.length > 0 ? (
              <div className="bg-muted/20 space-y-3 rounded-2xl border p-4">
                <div className="text-foreground font-medium">Picked time slots</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {selectedSlotCards.map(({ date, slot }) => (
                    <div
                      key={`${date}-${slot.id}`}
                      className="bg-background rounded-xl border p-3 text-sm shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="text-foreground font-medium">
                            {formatBookingDate(date)}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {slot.startTime} - {slot.endTime}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {slot.price.toLocaleString()} VND
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => {
                            setSelectedSlotsByDate((prev) => {
                              const nextSlots = (prev[date] ?? EMPTY_TIME_SLOTS).filter(
                                (item) => item.id !== slot.id,
                              );

                              if (nextSlots.length === 0) {
                                const { [date]: _removed, ...rest } = prev;
                                return rest;
                              }

                              return {
                                ...prev,
                                [date]: nextSlots,
                              };
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-muted/20 rounded-2xl border p-4 text-sm">
                <div className="text-foreground font-medium">Saved selections by date</div>
                <div className="text-muted-foreground mt-2 space-y-1">
                  {Object.entries(selectedSlotsByDate)
                    .filter(([, slots]) => slots.length > 0)
                    .map(([date, slots]) => (
                      <div key={date}>
                        {formatBookingDate(date)}: {slots.length} selected slot
                        {slots.length > 1 ? "s" : ""}
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="bg-muted/30 rounded-2xl border p-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Selected total</span>
                <span className="text-foreground font-semibold">
                  {selectedTotal.toLocaleString()} VND
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Hold window</span>
                <span className="text-foreground font-medium">{BOOKING_HOLD_MINUTES} minutes</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={!canConfirm}
              onClick={handleConfirm}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Login required</DialogTitle>
            <DialogDescription>
              You need to log in before adding selected slots to your cart.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button asChild className="w-full sm:w-auto">
              <Link href={loginHref}>Login</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setShowLoginPrompt(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function CourtVenueLink({ venueId, venueName }: { venueId?: string; venueName?: string }) {
  if (!venueId) {
    return (
      <Button variant="outline" className="w-full" disabled>
        <MapPin className="mr-2 h-4 w-4" />
        Venue unavailable
      </Button>
    );
  }

  return (
    <Button asChild variant="outline" className="w-full">
      <Link href={`/venues/${venueId}`}>
        <MapPin className="mr-2 h-4 w-4" />
        View venue{venueName ? `: ${venueName}` : ""}
      </Link>
    </Button>
  );
}
