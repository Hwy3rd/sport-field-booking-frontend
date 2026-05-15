"use client";

import { format } from "date-fns";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserGrowthItem } from "@/types/statistic.type";

interface UserGrowthLineChartProps {
  data: UserGrowthItem[];
  isLoading?: boolean;
}

export function UserGrowthLineChart({ data, isLoading }: UserGrowthLineChartProps) {
  if (isLoading) {
    return (
      <Card className="surface-card h-[380px]">
        <CardHeader>
          <CardTitle>User growth</CardTitle>
          <CardDescription>Registration activity metrics</CardDescription>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  const totalNewUsers = data.reduce((sum, cur) => sum + cur.newUsers, 0);

  return (
    <Card className="surface-card col-span-1 xl:col-span-2 h-[380px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-semibold tracking-tight">User Sign-ups Growth</CardTitle>
          <CardDescription>New registered profiles (Last 30 Days)</CardDescription>
        </div>
        <div className="text-right flex flex-col items-end justify-center">
          <span className="text-xl font-bold text-emerald-600">+{totalNewUsers}</span>
          <span className="text-[10px] text-muted-foreground uppercase font-semibold">Total New</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: -20,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
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
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const row = payload[0].payload as UserGrowthItem;
                    return (
                      <div className="border-border/50 rounded-xl border bg-background p-3 shadow-lg text-xs">
                        <div className="text-muted-foreground mb-1">
                          {format(new Date(row.date), "EEEE, dd MMMM yyyy")}
                        </div>
                        <div className="text-emerald-600 font-bold text-sm flex items-center gap-1">
                          <span>+{row.newUsers}</span>
                          <span className="text-muted-foreground font-normal text-xs">new users registered</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="newUsers"
                stroke="#10b981" // Emerald Green
                strokeWidth={3}
                dot={{ fill: "#10b981", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
