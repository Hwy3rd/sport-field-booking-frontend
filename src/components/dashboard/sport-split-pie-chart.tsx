"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SportSplitItem } from "@/types/statistic.type";

interface SportSplitPieChartProps {
  data: SportSplitItem[];
  isLoading?: boolean;
}

const CHART_COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#0ea5e9", // Sky
  "#ec4899", // Pink
  "#8b5cf6", // Violet
];

export function SportSplitPieChart({ data, isLoading }: SportSplitPieChartProps) {
  if (isLoading) {
    return (
      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Sport Popularity</CardTitle>
          <CardDescription>Booking breakdown</CardDescription>
        </CardHeader>
        <CardContent className="flex h-72 items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  const totalCount = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="surface-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold tracking-tight">Sport Categories</CardTitle>
        <CardDescription>Distribution of bookings</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="relative flex h-56 items-center justify-center">
          {data.length === 0 ? (
            <div className="text-muted-foreground text-xs italic">No data available</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as SportSplitItem;
                        const percent = totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(0) : 0;
                        return (
                          <div className="border-border/50 rounded-xl border bg-background px-3 py-2 shadow-lg shadow-slate-100 text-xs">
                            <span className="font-semibold text-foreground">{item.sportName}</span>
                            <span className="text-muted-foreground ml-2 font-normal">
                              {item.count} orders ({percent}%)
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="sportName"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        style={{ outline: "none" }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text Over Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold">{totalCount}</span>
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
                  Total Orders
                </span>
              </div>
            </>
          )}
        </div>

        {/* Compact Legend Grid */}
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          {data.map((item, index) => (
            <div key={item.sportName} className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span className="text-muted-foreground font-medium truncate max-w-[80px]">
                {item.sportName}
              </span>
              <span className="text-foreground/70 font-semibold ml-auto">{item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
