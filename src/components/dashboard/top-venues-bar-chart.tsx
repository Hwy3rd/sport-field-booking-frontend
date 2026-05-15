"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TopVenueItem } from "@/types/statistic.type";

interface TopVenuesBarChartProps {
  data: TopVenueItem[];
  isLoading?: boolean;
}

export function TopVenuesBarChart({ data, isLoading }: TopVenuesBarChartProps) {
  if (isLoading) {
    return (
      <Card className="surface-card h-[380px]">
        <CardHeader>
          <CardTitle>Top Venues</CardTitle>
          <CardDescription>Performance leaderboards</CardDescription>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
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
    <Card className="surface-card h-[380px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold tracking-tight">Top Performing Venues</CardTitle>
        <CardDescription>Top 5 venues by successful platform revenue</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {data.length === 0 ? (
          <div className="flex h-60 items-center justify-center text-sm text-muted-foreground italic">
            No venue data available
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{
                  top: 0,
                  right: 15,
                  left: -10,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCompactNumber}
                />
                <YAxis
                  dataKey="venueName"
                  type="category"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                  tickFormatter={(val) => (val.length > 12 ? `${val.substring(0, 12)}...` : val)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as TopVenueItem;
                      return (
                        <div className="border-border/50 rounded-xl border bg-background p-3 shadow-lg text-xs">
                          <div className="font-semibold text-foreground truncate max-w-[180px] mb-1">
                            {item.venueName}
                          </div>
                          <div className="text-primary font-bold text-sm">
                            {formatCurrency(item.revenue)}
                          </div>
                          <div className="text-muted-foreground mt-0.5">
                            Total orders: <span className="font-semibold text-foreground/70">{item.bookingsCount}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#4f46e5"
                  radius={[0, 8, 8, 0]} // Rounded right corners for horizontal bars
                  barSize={24}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
