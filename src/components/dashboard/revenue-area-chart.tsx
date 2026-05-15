"use client";

import { format } from "date-fns";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChartItem } from "@/types/statistic.type";

interface RevenueAreaChartProps {
  data: RevenueChartItem[];
  isLoading?: boolean;
}

export function RevenueAreaChart({ data, isLoading }: RevenueAreaChartProps) {
  if (isLoading) {
    return (
      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Revenue overview</CardTitle>
          <CardDescription>Daily performance analysis</CardDescription>
        </CardHeader>
        <CardContent className="flex h-72 items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  // Format price to Vietnamese Dong
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
  };

  const formatCompactNumber = (number: number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + "M";
    }
    if (number >= 1000) {
      return (number / 1000).toFixed(0) + "k";
    }
    return number.toString();
  };

  return (
    <Card className="surface-card col-span-1 xl:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold tracking-tight">Revenue Trend</CardTitle>
          <CardDescription>Aggregated successful daily revenue (Last 30 Days)</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4 pb-2">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="revenueColor" x1="0" y1="0" x2="0" y2="1">
                  {/* Recharts natively parses CSS var() in hex/rgb/oklch if configured properly,
                      but using a hardcoded vibrant sport-booking indigo/violet hue ensures compatibility */}
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(str) => {
                  try {
                    return format(new Date(str), "dd MMM");
                  } catch {
                    return str;
                  }
                }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCompactNumber}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const row = payload[0].payload as RevenueChartItem;
                    return (
                      <div className="border-border/50 rounded-xl border bg-background p-3 shadow-lg shadow-slate-100">
                        <div className="text-muted-foreground text-xs mb-1">
                          {format(new Date(row.date), "EEEE, dd MMMM yyyy")}
                        </div>
                        <div className="text-primary text-sm font-bold">
                          {formatCurrency(row.revenue)}
                        </div>
                        <div className="text-foreground/80 mt-1 text-xs">
                          Bookings: <span className="font-semibold">{row.bookingCount}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueColor)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
