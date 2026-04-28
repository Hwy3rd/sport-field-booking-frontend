"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/helper/get-message";
import { ReviewService } from "@/services/review.service";
import type {
  CreateReviewRequest,
  GetVenueReviewsRequest,
  UpdateReviewRequest,
} from "@/types/review.type";
import { venueKeys } from "./useVenue";

export const reviewKeys = {
  all: ["reviews"] as const,
  list: (filter: GetVenueReviewsRequest) => ["reviews", "list", filter] as const,
};

export const useVenueReviews = (filter: GetVenueReviewsRequest, enabled = true) =>
  useQuery({
    queryKey: reviewKeys.list(filter),
    queryFn: () => ReviewService.getVenueReviews(filter),
    enabled: enabled && !!filter.venueId,
    staleTime: 60_000,
  });

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewRequest) => ReviewService.createReview(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      queryClient.invalidateQueries({ queryKey: venueKeys.detail(variables.venueId) });
      toast.success("Review created successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create review"));
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: string; payload: UpdateReviewRequest }) =>
      ReviewService.updateReview(reviewId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      queryClient.invalidateQueries({ queryKey: venueKeys.all });
      toast.success("Review updated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update review"));
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => ReviewService.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      queryClient.invalidateQueries({ queryKey: venueKeys.all });
      toast.success("Review deleted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete review"));
    },
  });
};
