"use client";

import { useMemo } from "react";

import { OccupancyRadialCard } from "@/components/dashboard/occupancy-radial-card";
import { RevenueAreaChart } from "@/components/dashboard/revenue-area-chart";
import { SportSplitPieChart } from "@/components/dashboard/sport-split-pie-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCourts } from "@/hooks/useCourt";
import { TopVenuesBarChart } from "@/components/dashboard/top-venues-bar-chart";
import {
  useOccupancyRate,
  useRevenueChart,
  useSportSplit,
  useSummaryStats,
  useTopVenues,
} from "@/hooks/useStatistic";
import { useMe } from "@/hooks/useUser";
import { useVenues } from "@/hooks/useVenue";

export default function OwnerDashboardPage() {
  const meQuery = useMe();
  const ownerId = meQuery.data?.id;

  // Base structural metadata for listing
  const venuesQuery = useVenues({
    current: 1,
    limit: 50,
    ownerId,
  });
  const courtsQuery = useCourts({ current: 1, limit: 200 });

  // Core analytical analytical hooks
  const summaryQuery = useSummaryStats();
  const chartQuery = useRevenueChart();
  const sportQuery = useSportSplit();
  const occupancyQuery = useOccupancyRate();
  const topVenuesQuery = useTopVenues();

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

  const isLoading = meQuery.isLoading || summaryQuery.isLoading;

  const formatCurrency = (value?: number) => {
    if (value === undefined) return "0 VND";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Owner dashboard"
        description="Overview of business performance, charts, and live venue statistics"
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="My Revenue" value={formatCurrency(summaryQuery.data?.totalRevenue)} />
          <StatCard label="Paid Bookings" value={(summaryQuery.data?.totalBookings ?? 0).toLocaleString()} />
          <StatCard label="Managed Venues" value={(summaryQuery.data?.activeVenues ?? 0).toLocaleString()} />
          <StatCard label="Active Courts" value={(summaryQuery.data?.activeCourts ?? 0).toLocaleString()} />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-1 xl:grid-cols-3">
        <RevenueAreaChart data={chartQuery.data ?? []} isLoading={chartQuery.isLoading} />
        <SportSplitPieChart data={sportQuery.data ?? []} isLoading={sportQuery.isLoading} />
      </div>

      <div className="grid gap-6 md:grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TopVenuesBarChart data={topVenuesQuery.data ?? []} isLoading={topVenuesQuery.isLoading} />
        </div>
        <OccupancyRadialCard data={occupancyQuery.data} isLoading={occupancyQuery.isLoading} />
      </div>

      {/* Meta tables of owned items below analytics */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="surface-card">
          <CardHeader>
            <CardTitle className="text-base">My Venues</CardTitle>
          </CardHeader>
          <CardContent>
            {venuesQuery.isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (venuesQuery.data?.items?.length ?? 0) === 0 ? (
              <EmptyState title="No venues registered yet" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(venuesQuery.data?.items ?? []).slice(0, 5).map((venue) => (
                    <TableRow key={venue.id}>
                      <TableCell className="font-medium">{venue.name}</TableCell>
                      <TableCell className="max-w-[180px] truncate">{venue.address}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {venue.operatingHours?.startTime} - {venue.operatingHours?.endTime}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="surface-card">
          <CardHeader>
            <CardTitle className="text-base">My Courts</CardTitle>
          </CardHeader>
          <CardContent>
            {courtsQuery.isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : ownerCourts.length === 0 ? (
              <EmptyState title="No courts created yet" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ownerCourts.slice(0, 5).map((court) => (
                    <TableRow key={court.id}>
                      <TableCell className="font-medium">{court.name}</TableCell>
                      <TableCell className="text-xs truncate max-w-[150px]">
                        {court.venue?.name ?? court.venueId.slice(0, 8)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap text-xs font-semibold">
                        {court.pricePerHour.toLocaleString()} VND
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
