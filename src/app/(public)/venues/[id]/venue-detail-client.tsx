"use client";

import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { CourtCard } from "@/components/shared/court-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { courtKeys } from "@/lib/query-keys/court.keys";
import { ReviewService } from "@/services/review.service";
import { CourtService } from "@/services/court.service";
import { useAuth } from "@/hooks/useAuth";
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
  const { isAuthenticated, user } = useAuth();
  const [courtLimit, setCourtLimit] = useState(courts.limit);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState("5");
  const [editComment, setEditComment] = useState("");

  const courtFilter = useMemo(
    () => ({ current: 1, limit: courtLimit, venueId: venue.id }),
    [courtLimit, venue.id],
  );

  const courtsQuery = useQuery({
    queryKey: courtKeys.list(courtFilter),
    queryFn: () => CourtService.getAllCourts(courtFilter),
    initialData: courts,
    staleTime: 60_000,
  });

  const reviewsQuery = useQuery({
    queryKey: ["reviews", "venue", venue.id],
    queryFn: () => ReviewService.getVenueReviews({ venueId: venue.id, current: 1, limit: 5 }),
    initialData: reviews,
    staleTime: 60_000,
  });

  const createReviewMutation = useMutation({
    mutationFn: () =>
      ReviewService.createReview({
        venueId: venue.id,
        rating: Number(rating),
        comment: comment.trim() || undefined,
      }),
    onSuccess: () => {
      setComment("");
      setRating("5");
      reviewsQuery.refetch();
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: (payload: { reviewId: string; rating: number; comment?: string }) =>
      ReviewService.updateReview(payload.reviewId, {
        id: payload.reviewId,
        rating: payload.rating,
        comment: payload.comment,
      }),
    onSuccess: () => {
      setEditingReviewId(null);
      reviewsQuery.refetch();
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) => ReviewService.deleteReview(reviewId),
    onSuccess: () => {
      reviewsQuery.refetch();
    },
  });

  const courtsData = courtsQuery.data;
  const reviewsData = reviewsQuery.data;
  const averageRating = useMemo(() => {
    if (!reviewsData.items.length) return 0;
    const total = reviewsData.items.reduce((sum, item) => sum + item.rating, 0);
    return Math.round((total / reviewsData.items.length) * 10) / 10;
  }, [reviewsData.items]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="space-y-10">
      <PageHeader title={venue.name} description={venue.description} />

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        {venue.imageUrl ? (
          <img
            src={venue.imageUrl}
            alt={venue.name}
            className="h-60 w-full rounded-3xl object-cover"
          />
        ) : (
          <div className="bg-muted h-60 rounded-3xl" />
        )}
        <Card className="rounded-3xl">
          <CardContent className="space-y-4 pt-6">
            <div className="text-muted-foreground flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4" />
              <span>{venue.address}</span>
            </div>
            <div className="text-sm">
              Operating hours: {venue.operatingHours.startTime} - {venue.operatingHours.endTime}
            </div>
            <div className="text-sm">
              Contact: {venue.contactInfo.phone} • {venue.contactInfo.email}
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">{venue.status}</Badge>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-medium">
                  {averageRating ? `${averageRating}/5` : "No rating"}
                </span>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href={`/search?keyword=${encodeURIComponent(venue.name)}`}>Book now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Courts</h2>
            {courtsData.items.length === 0 ? (
              <EmptyState title="No courts available in this venue" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {courtsData.items.map((court) => (
                  <CourtCard key={court.id} court={court} />
                ))}
              </div>
            )}

            {courtsData.items.length < courtsData.total && (
              <div className="flex justify-center">
                <Button variant="outline" onClick={() => setCourtLimit((prev) => prev + 6)}>
                  View more courts
                </Button>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Reviews</h2>
            {reviewsData.items.length === 0 ? (
              <EmptyState title="No reviews yet" />
            ) : (
              <div className="space-y-3">
                {reviewsData.items.map((review) => {
                  const isOwner = isMounted && user?.id === review.userId;
                  const isEditing = editingReviewId === review.id;
                  const authorName =
                    review.user?.fullName ?? (isOwner ? (user?.fullName ?? "You") : "Anonymous");

                  return (
                    <Card key={review.id} className="rounded-2xl">
                      <CardContent className="space-y-2 pt-6">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-medium">{review.rating}/5</span>
                          </div>
                          <span className="text-muted-foreground text-xs">{authorName}</span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {review.comment ?? "No comment"}
                        </p>

                        {isOwner ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingReviewId(review.id);
                                setEditRating(String(review.rating));
                                setEditComment(review.comment ?? "");
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteReviewMutation.mutate(review.id)}
                              disabled={deleteReviewMutation.isPending}
                            >
                              {deleteReviewMutation.isPending ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        ) : null}

                        {isEditing ? (
                          <div className="space-y-3 rounded-xl border p-3">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Rating</label>
                              <Select value={editRating} onValueChange={setEditRating}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select rating" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 5 }).map((_, index) => {
                                    const value = String(5 - index);
                                    return (
                                      <SelectItem key={value} value={value}>
                                        {value} stars
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Comment</label>
                              <Textarea
                                value={editComment}
                                onChange={(event) => setEditComment(event.target.value)}
                                placeholder="Update your review"
                                className="min-h-[100px]"
                              />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateReviewMutation.mutate({
                                    reviewId: review.id,
                                    rating: Number(editRating),
                                    comment: editComment.trim() || undefined,
                                  })
                                }
                                disabled={updateReviewMutation.isPending}
                              >
                                {updateReviewMutation.isPending ? "Saving..." : "Save"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingReviewId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <Card className="h-fit rounded-3xl">
          <CardContent className="space-y-4 pt-6">
            <h3 className="text-lg font-semibold">Write a review</h3>
            <p className="text-muted-foreground text-sm">
              Share your experience to help others choose this venue.
            </p>
            {isMounted && isAuthenticated ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating</label>
                  <Select value={rating} onValueChange={setRating}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }).map((_, index) => {
                        const value = String(5 - index);
                        return (
                          <SelectItem key={value} value={value}>
                            {value} stars
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Comment</label>
                  <Textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Share what you liked about this venue"
                    className="min-h-[120px]"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => createReviewMutation.mutate()}
                  disabled={createReviewMutation.isPending}
                >
                  {createReviewMutation.isPending ? "Submitting..." : "Submit review"}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Please sign in to leave a review.</p>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/login">Go to login</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
