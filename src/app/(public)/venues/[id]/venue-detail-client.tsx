"use client";

import Link from "next/link";
import { MapPin, Star } from "lucide-react";

import { CourtCard } from "@/components/shared/court-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ApiListResponse } from "@/types/api.type";
import type { Court } from "@/types/court.type";
import type { Review } from "@/types/review.type";
import type { Venue } from "@/types/venue.type";

interface VenueDetailClientProps {
  venue: Venue;
  courts: ApiListResponse<Court>;
  reviews: ApiListResponse<Review>;
}

export function VenueDetailClient({ venue, courts, reviews }: VenueDetailClientProps) {
  return (
    <div className="space-y-8">
      <PageHeader title={venue.name} description={venue.description} />

      <div className="grid gap-4 md:grid-cols-3">
        {venue.imageUrl ? (
          <img
            src={venue.imageUrl}
            alt={venue.name}
            className="h-52 w-full rounded-2xl object-cover md:col-span-2"
          />
        ) : (
          <div className="h-52 rounded-2xl bg-muted md:col-span-2" />
        )}
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
              <div className="grid h-56 place-items-center rounded-xl bg-muted text-sm text-muted-foreground">
                Map placeholder
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Courts</h2>
            {courts.items.length === 0 ? (
              <EmptyState title="No courts available in this venue" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {courts.items.map((court) => (
                  <CourtCard key={court.id} court={court} />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Reviews</h2>
            {reviews.items.length === 0 ? (
              <EmptyState title="No reviews yet" />
            ) : (
              <div className="space-y-3">
                {reviews.items.map((review) => (
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
