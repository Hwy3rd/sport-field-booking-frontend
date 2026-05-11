"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/helper/get-message";
import { CourtService } from "@/services/court.service";
import { courtKeys } from "@/lib/query-keys/court.keys";
import type {
  CreateCourtRequest,
  GetAllCourtsRequest,
  UpdateCourtRequest,
} from "@/types/court.type";

export const useCourtsList = (filter: GetAllCourtsRequest = {}) =>
  useQuery({
    queryKey: courtKeys.list(filter),
    queryFn: () => CourtService.getAllCourts(filter),
    staleTime: 60_000,
  });

export const useCourtDetail = (courtId: string, enabled = true) =>
  useQuery({
    queryKey: courtKeys.detail(courtId),
    queryFn: () => CourtService.getCourtById(courtId),
    enabled: enabled && !!courtId,
    staleTime: 60_000,
  });

export const useCreateCourt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCourtRequest) => CourtService.createCourt(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courtKeys.list() });
      toast.success("Court created successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create court"));
    },
  });
};

export const useUpdateCourt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courtId, payload }: { courtId: string; payload: UpdateCourtRequest }) =>
      CourtService.updateCourt(courtId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: courtKeys.list() });
      queryClient.setQueryData(courtKeys.detail(data.id), data);
      toast.success("Court updated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update court"));
    },
  });
};

export const useDeleteCourt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courtId: string) => CourtService.deleteCourt(courtId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courtKeys.list() });
      toast.success("Court deleted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete court"));
    },
  });
};

export const useDeleteMultipleCourts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courtIds: string[]) => CourtService.deleteMultipleCourts(courtIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courtKeys.list() });
      toast.success("Courts deleted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete courts"));
    },
  });
};

export const useCourts = useCourtsList;
export const useCourt = useCourtDetail;
