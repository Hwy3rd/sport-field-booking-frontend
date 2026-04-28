import api from "@/lib/api/axios";
import { ApiListResponse, ApiResponse } from "@/types/api.type";
import {
  CreateVenueRequest,
  SearchVenuesRequest,
  UpdateVenueRequest,
  Venue,
} from "@/types/venue.type";

export const VenueService = {
  searchVenues: async (filter: SearchVenuesRequest): Promise<ApiListResponse<Venue>> => {
    const { data } = await api.post<ApiResponse<ApiListResponse<Venue>>>(
      "/venue/search",
      filter,
    );
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch venues");
    }

    return data.data;
  },

  getVenueById: async (venueId: string): Promise<Venue> => {
    const { data } = await api.get<ApiResponse<Venue>>(`/venue/${venueId}`);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch venue");
    }

    return data.data;
  },

  createVenue: async (venueData: CreateVenueRequest): Promise<Venue> => {
    const { data } = await api.post<ApiResponse<Venue>>("/venue", venueData);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to create venue");
    }

    return data.data;
  },

  updateVenue: async (venueId: string, venueData: UpdateVenueRequest): Promise<Venue> => {
    const { data } = await api.patch<ApiResponse<Venue>>(`/venue/${venueId}`, venueData);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to update venue");
    }

    return data.data;
  },

  deleteVenue: async (venueId: string): Promise<unknown> => {
    const { data } = await api.delete<ApiResponse<unknown>>(`/venue/${venueId}`);
    if (!data.success) {
      throw new Error(data.message || "Failed to delete venue");
    }

    return data.data;
  },

  deleteMultipleVenues: async (venueIds: string[]): Promise<unknown> => {
    const { data } = await api.post<ApiResponse<unknown>>("/venue/bulk-delete", {
      ids: venueIds,
    });
    if (!data.success) {
      throw new Error(data.message || "Failed to delete venues");
    }

    return data.data;
  },
};
