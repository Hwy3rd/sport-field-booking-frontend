"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OccupancyRate } from "@/types/statistic.type";

interface OccupancyRadialCardProps {
  data?: OccupancyRate;
  isLoading?: boolean;
}

export function OccupancyRadialCard({ data, isLoading }: OccupancyRadialCardProps) {
  if (isLoading) {
    return (
      <Card className="surface-card">
        <CardContent className="flex h-56 items-center justify-center">
          <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  const rate = data?.occupancyRate ?? 0;

  // Mock radial payload. 100 is the background track, `rate` is the fill value
  const chartData = [{ name: "Rate", value: rate, fill: "#10b981" }];

  return (
    <Card className="surface-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold tracking-tight">Utilization Rate</CardTitle>
        <CardDescription>Active slots booked for the next 30 days</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-row items-center gap-4 pt-2">
        <div className="relative h-32 w-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="80%"
              outerRadius="100%"
              barSize={10}
              data={chartData}
              startAngle={90}
              endAngle={450}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              {/* Background Track */}
              <RadialBar
                background={{ fill: "#f1f5f9" }}
                dataKey="value"
                cornerRadius={5}
                angleAxisId={0}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-emerald-600">
            {rate}%
          </div>
        </div>

        <div className="flex flex-col justify-center gap-1.5">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Summary</div>
          <div className="text-sm font-semibold">
            {data?.bookedSlots.toLocaleString() ?? 0}{" "}
            <span className="text-muted-foreground font-normal">Slots reserved</span>
          </div>
          <div className="text-xs text-muted-foreground">
            out of {data?.totalSlots.toLocaleString() ?? 0} generated slots total.
          </div>
          <div className="mt-1 inline-flex w-fit rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
            {rate > 50 ? "High Demand" : "Optimal capacity"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
