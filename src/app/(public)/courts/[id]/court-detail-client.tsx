"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/stores/cart.store";
import type { ApiListResponse } from "@/types/api.type";
import type { Court } from "@/types/court.type";
import type { TimeSlot } from "@/types/time-slot.type";

interface CourtDetailClientProps {
  court: Court;
  timeSlots: ApiListResponse<TimeSlot>;
}

export function CourtDetailClient({ court, timeSlots }: CourtDetailClientProps) {
  const addCourt = useCartStore((state) => state.addCourt);
  const [selectedTimeSlotIds, setSelectedTimeSlotIds] = useState<string[]>([]);
  const selectedSlotParam = useMemo(
    () => selectedTimeSlotIds.join(","),
    [selectedTimeSlotIds],
  );

  const handleAddToCart = () => {
    const result = addCourt(court);
    if (!result.added) {
      toast.info("Court is already in cart");
      return;
    }
    toast.success("Court added to cart");
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
            <div className="h-72 rounded-2xl bg-muted" />
          )}

          <Card className="rounded-2xl">
            <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Price: </span>
                <span className="font-medium">{court.pricePerHour.toLocaleString()} VND / hour</span>
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
              <h2 className="text-lg font-semibold">Available today</h2>
              {timeSlots.items.length === 0 ? (
                <EmptyState title="No available slots today" />
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {timeSlots.items.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between rounded-xl border bg-background p-3 text-sm"
                    >
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedTimeSlotIds.includes(slot.id)}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setSelectedTimeSlotIds((prev) => [...prev, slot.id]);
                              return;
                            }
                            setSelectedTimeSlotIds((prev) => prev.filter((id) => id !== slot.id));
                          }}
                        />
                        <span>
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </label>
                      <Badge variant={slot.status === "available" ? "success" : "outline"}>{slot.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit rounded-2xl">
          <CardContent className="space-y-4 pt-6">
            <h3 className="text-lg font-semibold">Booking CTA</h3>
            <p className="text-sm text-muted-foreground">
              Continue to search and select your preferred time slots for this court.
            </p>
            <Button variant="outline" className="w-full" onClick={handleAddToCart}>
              Add to cart
            </Button>
            <Button asChild className="w-full" disabled={selectedTimeSlotIds.length === 0}>
              <Link href={`/owner/bookings?timeSlotIds=${encodeURIComponent(selectedSlotParam)}`}>
                Book selected slots
              </Link>
            </Button>
            <Button asChild className="w-full" variant="secondary">
              <Link href={`/search?keyword=${encodeURIComponent(court.name)}`}>Book this court</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
