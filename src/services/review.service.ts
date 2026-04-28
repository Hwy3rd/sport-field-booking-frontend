import api from "@/lib/api/axios";
import { ApiListResponse, ApiResponse } from "@/types/api.type";
import {
  CreateReviewRequest,
  GetVenueReviewsRequest,
  Review,
  UpdateReviewRequest,
} from "@/types/review.type";

export const ReviewService = {
  getVenueReviews: async (
    filter: GetVenueReviewsRequest,
  ): Promise<ApiListResponse<Review>> => {
    const { data } = await api.get<ApiResponse<ApiListResponse<Review>>>("/review", {
      params: filter,
    });
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch reviews");
    }

    return data.data;
  },

  createReview: async (reviewData: CreateReviewRequest): Promise<Review> => {
    const { data } = await api.post<ApiResponse<Review>>("/review", reviewData);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to create review");
    }

    return data.data;
  },

  updateReview: async (reviewId: string, reviewData: UpdateReviewRequest): Promise<Review> => {
    const { data } = await api.patch<ApiResponse<Review>>(`/review/${reviewId}`, reviewData);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to update review");
    }

    return data.data;
  },

  deleteReview: async (reviewId: string): Promise<unknown> => {
    const { data } = await api.delete<ApiResponse<unknown>>(`/review/${reviewId}`);
    if (!data.success) {
      throw new Error(data.message || "Failed to delete review");
    }

    return data.data;
  },
};
