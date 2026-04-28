"use client";

import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { useParams } from "next/navigation";

import { CourtCard } from "@/components/shared/court-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourts } from "@/hooks/useCourt";
import { useVenueReviews } from "@/hooks/useReview";
import { useVenue } from "@/hooks/useVenue";

export default function VenueDetailPage() {
  const params = useParams<{ id: string }>();
  const venueId = params.id;

  const venueQuery = useVenue(venueId);
  const courtsQuery = useCourts({ current: 1, limit: 6, venueId });
  const reviewsQuery = useVenueReviews({ venueId, current: 1, limit: 5 });

  const venue = venueQuery.data;

  if (venueQuery.isLoading) {
    return <Skeleton className="h-96 rounded-2xl" />;
  }

  if (!venue) {
    return <EmptyState title="Venue not found" description="This venue may have been removed." />;
  }

  return (
    <div className="space-y-8">
      <PageHeader title={venue.name} description={venue.description} />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-52 rounded-2xl bg-muted md:col-span-2" />
        <div className="grid gap-4">
          <div className="h-24 rounded-2xl bg-muted" />
          <div className="h-24 rounded-2xl bg-muted" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card className="rounded-2xl">
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4" />
                <span>{venue.address}</span>
              </div>
              <div className="text-sm">
                Operating hours: {venue.operatingHours.startTime} - {venue.operatingHours.endTime}
              </div>
              <div className="text-sm">
                Contact: {venue.contactInfo.phone} • {venue.contactInfo.email}
              </div>
              <Badge variant="outline">{venue.status}</Badge>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="pt-6">
              <h2 className="mb-3 text-lg font-semibold">Map</h2>
              <div className="h-56 rounded-xl bg-muted text-sm text-muted-foreground grid place-items-center">
                Map placeholder
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Courts</h2>
            {courtsQuery.isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-64 rounded-2xl" />
                ))}
              </div>
            ) : (courtsQuery.data?.items?.length ?? 0) === 0 ? (
              <EmptyState title="No courts available in this venue" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {(courtsQuery.data?.items ?? []).map((court) => (
                  <CourtCard key={court.id} court={court} />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Reviews</h2>
            {(reviewsQuery.data?.items?.length ?? 0) === 0 ? (
              <EmptyState title="No reviews yet" />
            ) : (
              <div className="space-y-3">
                {(reviewsQuery.data?.items ?? []).map((review) => (
                  <Card key={review.id} className="rounded-2xl">
                    <CardContent className="space-y-2 pt-6">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">{review.rating}/5</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment ?? "No comment"}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <Card className="h-fit rounded-2xl">
          <CardContent className="space-y-4 pt-6">
            <h3 className="text-lg font-semibold">Ready to book?</h3>
            <p className="text-sm text-muted-foreground">
              Browse courts and choose your preferred timeslot.
            </p>
            <Button asChild className="w-full">
              <Link href={`/search?keyword=${encodeURIComponent(venue.name)}`}>Book now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
