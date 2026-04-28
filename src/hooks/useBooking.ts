"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/helper/get-message";
import { BookingService } from "@/services/booking.service";
import type {
  CreateBookingRequest,
  GetBookingHistoryRequest,
  SearchBookingsRequest,
  UpdateBookingRequest,
} from "@/types/booking.type";
import { courtKeys } from "./useCourt";

export const bookingKeys = {
  all: ["bookings"] as const,
  history: (filter?: GetBookingHistoryRequest) => ["bookings", "history", filter ?? {}] as const,
  adminList: (filter?: SearchBookingsRequest) => ["bookings", "admin-list", filter ?? {}] as const,
  detail: (bookingId: string) => ["bookings", "detail", bookingId] as const,
};

export const useBookingHistory = (filter: GetBookingHistoryRequest = {}) =>
  useQuery({
    queryKey: bookingKeys.history(filter),
    queryFn: () => BookingService.getBookingHistory(filter),
    staleTime: 60_000,
  });

export const useAdminBookingsList = (filter: SearchBookingsRequest = {}) =>
  useQuery({
    queryKey: bookingKeys.adminList(filter),
    queryFn: () => BookingService.searchBookings(filter),
    staleTime: 60_000,
  });

export const useBookingDetail = (bookingId: string, enabled = true) =>
  useQuery({
    queryKey: bookingKeys.detail(bookingId),
    queryFn: () => BookingService.getBookingById(bookingId),
    enabled: enabled && !!bookingId,
  });

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingRequest) => BookingService.createBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: courtKeys.all });
      toast.success("Booking created successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create booking"));
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, payload }: { bookingId: string; payload: UpdateBookingRequest }) =>
      BookingService.updateBooking(bookingId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: courtKeys.all });
      queryClient.setQueryData(bookingKeys.detail(data.id), data);
      toast.success("Booking updated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update booking"));
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => BookingService.cancelBooking(bookingId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.setQueryData(bookingKeys.detail(data.id), data);
      toast.success("Booking cancelled successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to cancel booking"));
    },
  });
};

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => BookingService.deleteBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      toast.success("Booking deleted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete booking"));
    },
  });
};

export const useDeleteMultipleBookings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingIds: string[]) => BookingService.deleteMultipleBookings(bookingIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      toast.success("Bookings deleted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete bookings"));
    },
  });
};
