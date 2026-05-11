"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CourtTimeSlotPicker, CourtVenueLink } from "@/components/shared/court-booking-dialog";
import { getLocalDateString } from "@/lib/helper/date";
import type { Court } from "@/types/court.type";
import type { TimeSlot } from "@/types/time-slot.type";
import { useTimeSlots } from "@/hooks/useTimeSlot";
import { useCartStore } from "@/stores/cart.store";
import { ROUTES } from "@/lib/constants/routes.constant";

interface CourtDetailClientProps {
  court: Court;
}

export function CourtDetailClient({ court }: CourtDetailClientProps) {
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [selectedSlotsByDate, setSelectedSlotsByDate] = useState<Record<string, TimeSlot[]>>({});

  const slotsQuery = useTimeSlots({ courtId: court.id, date: selectedDate, current: 1, limit: 100 });
  const allSlotsForDate = slotsQuery.data?.items ?? [];
  
  const selectedSlotsForCurrentDate = selectedSlotsByDate[selectedDate] ?? [];
  const selectedTimeSlotIds = selectedSlotsForCurrentDate.map((s) => s.id);

  const allSelectedSlots = Object.values(selectedSlotsByDate).flat();

  const { saveCourtBooking } = useCartStore();
  const router = useRouter();

  const handleAddToCart = () => {
    if (allSelectedSlots.length === 0) return;
    
    Object.entries(selectedSlotsByDate).forEach(([date, slots]) => {
      if (slots.length > 0) {
        saveCourtBooking(court, date, slots);
      }
    });

    toast.success("Added to cart");
    setSelectedSlotsByDate({}); // Clear after adding to cart
  };

  const handleBookNow = () => {
    if (allSelectedSlots.length === 0) return;
    
    Object.entries(selectedSlotsByDate).forEach(([date, slots]) => {
      if (slots.length > 0) {
        saveCourtBooking(court, date, slots);
      }
    });

    router.push(ROUTES.CHECKOUT);
  };

  return (
    <div className="space-y-8">
      <PageHeader title={court.name} description={`Court detail for ${court.name}`} />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {court.imageUrl ? (
            <img
              src={court.imageUrl}
              alt={court.name}
              className="h-72 w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="bg-muted h-72 rounded-2xl" />
          )}

          <Card className="rounded-2xl">
            <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Price: </span>
                <span className="font-medium">
                  {court.pricePerHour.toLocaleString()} VND / hour
                </span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Status: </span>
                <Badge variant="outline">{court.status}</Badge>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Sport: </span>
                {court.sport?.name ?? "-"}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Venue: </span>
                {court.venue?.name ?? "-"}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Time slots</h2>
                <Badge variant="outline">Select within 30 days</Badge>
              </div>
              <CourtTimeSlotPicker
                courtId={court.id}
                selectedDate={selectedDate}
                selectedTimeSlotIds={selectedTimeSlotIds}
                onSelectedDateChange={(date) => {
                  setSelectedDate(date);
                }}
                onSelectedTimeSlotIdsChange={(ids) => {
                  const nextSlots = allSlotsForDate.filter((slot) => ids.includes(slot.id));
                  setSelectedSlotsByDate((prev) => ({
                    ...prev,
                    [selectedDate]: nextSlots,
                  }));
                }}
                showSelectionSummary={false}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="h-fit rounded-2xl">
            <CardContent className="space-y-4 pt-6">
              <h3 className="text-lg font-semibold">Booking Summary</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected slots:</span>
                  <span className="font-medium">{allSelectedSlots.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total amount:</span>
                  <span className="font-medium">
                    {allSelectedSlots.reduce((sum, slot) => sum + slot.price, 0).toLocaleString()} VND
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  className="w-full" 
                  variant="secondary" 
                  onClick={handleAddToCart}
                  disabled={allSelectedSlots.length === 0}
                >
                  Add to cart
                </Button>
                <Button 
                  className="w-full" 
                  onClick={handleBookNow}
                  disabled={allSelectedSlots.length === 0}
                >
                  Book now
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit rounded-2xl">
            <CardContent className="space-y-4 pt-6">
              <h3 className="text-lg font-semibold">Venue</h3>
              <p className="text-muted-foreground text-sm">
                View the venue that owns this court and check other available courts.
              </p>
              <CourtVenueLink venueId={court.venueId} venueName={court.venue?.name} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
