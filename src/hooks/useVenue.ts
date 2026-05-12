"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/helper/get-message";
import { VenueService } from "@/services/venue.service";
import { venueKeys } from "@/lib/query-keys/venue.keys";
import type {
  CreateVenueRequest,
  GetAllVenuesRequest,
  UpdateVenueRequest,
} from "@/types/venue.type";

export const useVenuesList = (filter: GetAllVenuesRequest = {}) =>
  useQuery({
    queryKey: venueKeys.list(filter),
    queryFn: () => VenueService.getAllVenues(filter),
    staleTime: 60_000,
  });

export const useVenueDetail = (venueId: string, enabled = true) =>
  useQuery({
    queryKey: venueKeys.detail(venueId),
    queryFn: () => VenueService.getVenueById(venueId),
    enabled: enabled && !!venueId,
  });

export const useCreateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVenueRequest) => VenueService.createVenue(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueKeys.all });
      toast.success("Venue created successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create venue"));
    },
  });
};

export const useUpdateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ venueId, payload }: { venueId: string; payload: UpdateVenueRequest }) =>
      VenueService.updateVenue(venueId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: venueKeys.all });
      queryClient.setQueryData(venueKeys.detail(data.id), data);
      toast.success("Venue updated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update venue"));
    },
  });
};

export const useDeleteVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (venueId: string) => VenueService.deleteVenue(venueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueKeys.all });
      toast.success("Venue deleted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete venue"));
    },
  });
};

export const useDeleteMultipleVenues = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (venueIds: string[]) => VenueService.deleteMultipleVenues(venueIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueKeys.all });
      toast.success("Venues deleted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete venues"));
    },
  });
};

export const useVenues = useVenuesList;
export const useVenue = useVenueDetail;
