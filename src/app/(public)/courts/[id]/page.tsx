"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourt } from "@/hooks/useCourt";
import { TimeSlotService } from "@/services/time-slot.service";
import { useCartStore } from "@/stores/cart.store";

export default function CourtDetailPage() {
  const params = useParams<{ id: string }>();
  const courtId = params.id;

  const courtQuery = useCourt(courtId);
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const timeSlotsQuery = useQuery({
    queryKey: ["court", courtId, "time-slots", today],
    queryFn: () =>
      TimeSlotService.getAllTimeSlots({
        courtId,
        date: today,
        current: 1,
        limit: 8,
      }),
    enabled: !!courtId,
  });

  const court = courtQuery.data;
  const addCourt = useCartStore((state) => state.addCourt);

  const handleAddToCart = () => {
    if (!court) return;
    const result = addCourt(court);
    if (!result.added) {
      toast.info("Court is already in cart");
      return;
    }
    toast.success("Court added to cart");
  };

  if (courtQuery.isLoading) return <Skeleton className="h-96 rounded-2xl" />;
  if (!court) return <EmptyState title="Court not found" />;

  return (
    <div className="space-y-8">
      <PageHeader title={court.name} description={`Court detail for ${court.name}`} />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="h-72 rounded-2xl bg-muted" />

          <Card className="rounded-2xl">
            <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Price: </span>
                <span className="font-medium">{court.pricePerHour.toLocaleString()} VND / hour</span>
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
              <h2 className="text-lg font-semibold">Available today</h2>
              {timeSlotsQuery.isLoading ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-14 rounded-xl" />
                  ))}
                </div>
              ) : (timeSlotsQuery.data?.items?.length ?? 0) === 0 ? (
                <EmptyState title="No available slots today" />
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {(timeSlotsQuery.data?.items ?? []).map((slot) => (
                    <div
                      key={slot.id}
                      className="rounded-xl border bg-background p-3 text-sm flex items-center justify-between"
                    >
                      <span>
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <Badge variant={slot.status === "available" ? "success" : "outline"}>
                        {slot.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit rounded-2xl">
          <CardContent className="space-y-4 pt-6">
            <h3 className="text-lg font-semibold">Booking CTA</h3>
            <p className="text-sm text-muted-foreground">
              Continue to search and select your preferred time slots for this court.
            </p>
            <Button variant="outline" className="w-full" onClick={handleAddToCart}>
              Add to cart
            </Button>
            <Button asChild className="w-full">
              <Link href={`/search?keyword=${encodeURIComponent(court.name)}`}>Book this court</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
