import api from "@/lib/api/axios";
import { ApiListResponse, ApiResponse } from "@/types/api.type";
import {
  Booking,
  CreateBookingRequest,
  GetBookingHistoryRequest,
  SearchBookingsRequest,
  UpdateBookingRequest,
} from "@/types/booking.type";

export const BookingService = {
  getBookingHistory: async (
    filter: GetBookingHistoryRequest,
  ): Promise<ApiListResponse<Booking>> => {
    const { data } = await api.get<ApiResponse<ApiListResponse<Booking>>>(
      "/booking/history",
      {
        params: filter,
      },
    );
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch booking history");
    }

    return data.data;
  },

  getBookingById: async (bookingId: string): Promise<Booking> => {
    const { data } = await api.get<ApiResponse<Booking>>(`/booking/${bookingId}`);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch booking");
    }

    return data.data;
  },

  createBooking: async (bookingData: CreateBookingRequest): Promise<Booking> => {
    const { data } = await api.post<ApiResponse<Booking>>("/booking", bookingData);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to create booking");
    }

    return data.data;
  },

  searchBookings: async (
    filter: SearchBookingsRequest,
  ): Promise<ApiListResponse<Booking>> => {
    const { data } = await api.post<ApiResponse<ApiListResponse<Booking>>>(
      "/booking/search",
      filter,
    );
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch bookings");
    }

    return data.data;
  },

  updateBooking: async (
    bookingId: string,
    bookingData: UpdateBookingRequest,
  ): Promise<Booking> => {
    const { data } = await api.patch<ApiResponse<Booking>>(
      `/booking/${bookingId}`,
      bookingData,
    );
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to update booking");
    }

    return data.data;
  },

  cancelBooking: async (bookingId: string): Promise<Booking> => {
    const { data } = await api.patch<ApiResponse<Booking>>(`/booking/${bookingId}/cancel`);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to cancel booking");
    }

    return data.data;
  },

  deleteBooking: async (bookingId: string): Promise<unknown> => {
    const { data } = await api.delete<ApiResponse<unknown>>(`/booking/${bookingId}`);
    if (!data.success) {
      throw new Error(data.message || "Failed to delete booking");
    }

    return data.data;
  },

  deleteMultipleBookings: async (bookingIds: string[]): Promise<unknown> => {
    const { data } = await api.post<ApiResponse<unknown>>("/booking/bulk-delete", {
      ids: bookingIds,
    });
    if (!data.success) {
      throw new Error(data.message || "Failed to delete bookings");
    }

    return data.data;
  },
};
