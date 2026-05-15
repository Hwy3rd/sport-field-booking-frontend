"use client";

import { OccupancyRadialCard } from "@/components/dashboard/occupancy-radial-card";
import { RevenueAreaChart } from "@/components/dashboard/revenue-area-chart";
import { SportSplitPieChart } from "@/components/dashboard/sport-split-pie-chart";
import { TopVenuesBarChart } from "@/components/dashboard/top-venues-bar-chart";
import { UserGrowthLineChart } from "@/components/dashboard/user-growth-line-chart";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useOccupancyRate,
  useRevenueChart,
  useSportSplit,
  useSummaryStats,
  useTopVenues,
  useUserGrowth,
} from "@/hooks/useStatistic";

export default function AdminDashboardPage() {
  // Analytical metrics hooks
  const summaryQuery = useSummaryStats();
  const chartQuery = useRevenueChart();
  const sportQuery = useSportSplit();
  const occupancyQuery = useOccupancyRate();
  const topVenuesQuery = useTopVenues();
  const userGrowthQuery = useUserGrowth();

  const isLoading = summaryQuery.isLoading;
  const stats = summaryQuery.data;

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
      <PageHeader title="Admin dashboard" description="Real-time global overview of platform operations" />

      {/* KPI Row */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Platform Revenue" value={formatCurrency(stats?.totalRevenue)} />
          <StatCard label="Successful Bookings" value={(stats?.totalBookings ?? 0).toLocaleString()} />
          <StatCard label="Registered Users" value={(stats?.activeUsers ?? 0).toLocaleString()} />
          <StatCard label="Active Venues" value={(stats?.activeVenues ?? 0).toLocaleString()} />
        </div>
      )}

      {/* First Chart Row: Revenue vs Sport Categories */}
      <div className="grid gap-6 md:grid-cols-1 xl:grid-cols-3">
        <RevenueAreaChart data={chartQuery.data ?? []} isLoading={chartQuery.isLoading} />
        <SportSplitPieChart data={sportQuery.data ?? []} isLoading={sportQuery.isLoading} />
      </div>

      {/* Second Chart Row: User growth vs Top Venues */}
      <div className="grid gap-6 md:grid-cols-1 xl:grid-cols-3">
        <UserGrowthLineChart data={userGrowthQuery.data ?? []} isLoading={userGrowthQuery.isLoading} />
        <TopVenuesBarChart data={topVenuesQuery.data ?? []} isLoading={topVenuesQuery.isLoading} />
      </div>

      {/* Third Row: Future Resource Utilization */}
      <div className="grid gap-6 md:grid-cols-1 xl:grid-cols-3">
        <OccupancyRadialCard data={occupancyQuery.data} isLoading={occupancyQuery.isLoading} />
      </div>
    </div>
  );
}
