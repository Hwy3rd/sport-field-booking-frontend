"use client";

import { useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CourtTimeSlotPicker, CourtVenueLink } from "@/components/shared/court-booking-dialog";
import { getLocalDateString } from "@/lib/helper/date";
import type { Court } from "@/types/court.type";

interface CourtDetailClientProps {
  court: Court;
}

export function CourtDetailClient({ court }: CourtDetailClientProps) {
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [selectedTimeSlotIds, setSelectedTimeSlotIds] = useState<string[]>([]);

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
                  setSelectedTimeSlotIds([]);
                }}
                onSelectedTimeSlotIdsChange={setSelectedTimeSlotIds}
                showSelectionSummary={false}
              />
            </CardContent>
          </Card>
        </div>

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
  );
}
