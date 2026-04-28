"use client";

import { useMemo } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookingHistory } from "@/hooks/useBooking";
import { useCourts } from "@/hooks/useCourt";
import { useMe } from "@/hooks/useUser";
import { useVenues } from "@/hooks/useVenue";

export default function OwnerDashboardPage() {
  const meQuery = useMe();
  const ownerId = meQuery.data?.id;

  const venuesQuery = useVenues({
    current: 1,
    limit: 50,
    filter: { ownerId },
  });
  const courtsQuery = useCourts({ current: 1, limit: 200 });
  const bookingHistoryQuery = useBookingHistory({ current: 1, limit: 20 });

  const ownerVenueIds = useMemo(
    () => new Set((venuesQuery.data?.items ?? []).map((item) => item.id)),
    [venuesQuery.data?.items],
  );
  const ownerCourts = useMemo(
    () =>
      (courtsQuery.data?.items ?? []).filter((court) =>
        ownerVenueIds.has(court.venueId),
      ),
    [courtsQuery.data?.items, ownerVenueIds],
  );

  const isLoading = meQuery.isLoading || venuesQuery.isLoading || courtsQuery.isLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Owner dashboard"
        description="Overview of your venues, courts, and recent bookings"
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="My venues" value={venuesQuery.data?.items?.length ?? 0} />
          <StatCard label="My courts" value={ownerCourts.length} />
          <StatCard label="My booking history" value={bookingHistoryQuery.data?.total ?? 0} />
        </div>
      )}

      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Recent booking activity</CardTitle>
        </CardHeader>
        <CardContent>
          {(bookingHistoryQuery.data?.items?.length ?? 0) === 0 ? (
            <EmptyState title="No booking history yet" />
          ) : (
            <div className="space-y-2">
              {(bookingHistoryQuery.data?.items ?? []).slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-xl border bg-background p-3 text-sm"
                >
                  Booking #{booking.id.slice(0, 8)} • {booking.status} •{" "}
                  {booking.totalPrice.toLocaleString()} VND
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
