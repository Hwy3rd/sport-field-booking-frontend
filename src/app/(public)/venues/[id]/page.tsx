import { notFound } from "next/navigation";

import { serverGet } from "@/lib/api/server-api";
import type { ApiListResponse } from "@/types/api.type";
import type { Court } from "@/types/court.type";
import type { Review } from "@/types/review.type";
import type { Venue } from "@/types/venue.type";
import { VenueDetailClient } from "./venue-detail-client";

interface VenueDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function VenueDetailPage({ params }: VenueDetailPageProps) {
  const { id } = await params;

  try {
    const [venue, courts, reviews] = await Promise.all([
      serverGet<Venue>(`/venue/${id}`, {}, { next: { revalidate: 120 } }),
      serverGet<ApiListResponse<Court>>(
        "/court",
        { current: 1, limit: 6, venueId: id },
        { next: { revalidate: 120 } },
      ),
      serverGet<ApiListResponse<Review>>(
        "/review",
        { venueId: id, current: 1, limit: 5 },
        { next: { revalidate: 120 } },
      ),
    ]);

    return <VenueDetailClient venue={venue} courts={courts} reviews={reviews} />;
  } catch {
    notFound();
  }
}
