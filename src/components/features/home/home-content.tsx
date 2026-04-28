"use client";

import Link from "next/link";

import { CourtCard } from "@/components/shared/court-card";
import { EmptyState } from "@/components/shared/empty-state";
import { VenueCard } from "@/components/shared/venue-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourts } from "@/hooks/useCourt";
import { useVenues } from "@/hooks/useVenue";
import { ROUTES } from "@/lib/constants/routes.constant";

export function HomeContent() {
  const venuesQuery = useVenues({ current: 1, limit: 6 });
  const courtsQuery = useCourts({ current: 1, limit: 6 });

  const featuredVenues = venuesQuery.data?.items ?? [];
  const featuredCourts = courtsQuery.data?.items ?? [];

  return (
    <div className="space-y-12">
      <section className="surface-card relative overflow-hidden p-8 sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.16),transparent_42%)]" />
        <p className="text-sm font-medium text-primary">Book smarter. Play better.</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-5xl">
          Discover top sports venues and reserve your court in minutes
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Find available courts by location, sport type, and price. Manage your bookings
          with a modern and seamless experience.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild className="rounded-xl">
            <Link href={ROUTES.SEARCH}>Start booking</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl bg-card">
            <Link href={ROUTES.PROFILE_BOOKINGS}>View my bookings</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured venues</h2>
          <Button asChild variant="ghost">
            <Link href={ROUTES.SEARCH}>See all</Link>
          </Button>
        </div>
        {venuesQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : featuredVenues.length === 0 ? (
          <EmptyState title="No venues available" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Featured courts</h2>
        {courtsQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : featuredCourts.length === 0 ? (
          <EmptyState title="No courts available" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourts.map((court) => (
              <CourtCard key={court.id} court={court} />
            ))}
          </div>
        )}
      </section>

      <section className="surface-card p-6">
        <h3 className="text-xl font-semibold">Popular areas</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["District 1", "District 7", "Thu Duc", "Binh Thanh"].map((area) => (
            <div
              key={area}
              className="rounded-xl border bg-background p-4 text-sm font-medium transition-colors hover:bg-muted/60"
            >
              {area}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
