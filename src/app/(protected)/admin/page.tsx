"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminBookingsList } from "@/hooks/useBooking";
import { useCourts } from "@/hooks/useCourt";
import { useSportsList } from "@/hooks/useSport";
import { useUsersList } from "@/hooks/useUser";
import { useVenues } from "@/hooks/useVenue";

export default function AdminDashboardPage() {
  const usersQuery = useUsersList({ current: 1, limit: 10 });
  const venuesQuery = useVenues({ current: 1, limit: 10 });
  const courtsQuery = useCourts({ current: 1, limit: 10 });
  const bookingsQuery = useAdminBookingsList({ current: 1, limit: 10, filter: {} });
  const sportsQuery = useSportsList({ current: 1, limit: 50 });

  const isLoading =
    usersQuery.isLoading ||
    venuesQuery.isLoading ||
    courtsQuery.isLoading ||
    bookingsQuery.isLoading ||
    sportsQuery.isLoading;

  return (
    <div className="space-y-6">
      <PageHeader title="Admin dashboard" description="Global overview of platform operations" />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Users" value={usersQuery.data?.total ?? 0} />
          <StatCard label="Venues" value={venuesQuery.data?.total ?? 0} />
          <StatCard label="Courts" value={courtsQuery.data?.total ?? 0} />
          <StatCard label="Bookings" value={bookingsQuery.data?.total ?? 0} />
          <StatCard label="Sports" value={sportsQuery.data?.total ?? 0} />
        </div>
      )}

      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Analytics snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/40 text-muted-foreground grid h-64 place-items-center rounded-xl border text-sm">
            Chart placeholder (traffic / bookings / revenue)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
