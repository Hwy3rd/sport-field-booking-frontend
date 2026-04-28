"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/helper/get-message";
import { SportService } from "@/services/sport.service";
import type {
  CreateSportRequest,
  GetAllSportsRequest,
  UpdateSportRequest,
} from "@/types/sport.type";

export const sportKeys = {
  all: ["sports"] as const,
  list: (filter?: GetAllSportsRequest) => ["sports", "list", filter ?? {}] as const,
  detail: (sportId: string) => ["sports", "detail", sportId] as const,
};

export const useSportsList = (filter: GetAllSportsRequest = {}) =>
  useQuery({
    queryKey: sportKeys.list(filter),
    queryFn: () => SportService.getAllSports(filter),
    staleTime: 10 * 60 * 1000,
  });

export const useSportDetail = (sportId: string, enabled = true) =>
  useQuery({
    queryKey: sportKeys.detail(sportId),
    queryFn: () => SportService.getSportById(sportId),
    enabled: enabled && !!sportId,
    staleTime: 10 * 60 * 1000,
  });

export const useCreateSport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSportRequest) => SportService.createSport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportKeys.list() });
      toast.success("Sport created successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create sport"));
    },
  });
};

export const useUpdateSport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sportId, payload }: { sportId: string; payload: UpdateSportRequest }) =>
      SportService.updateSport(sportId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sportKeys.list() });
      queryClient.setQueryData(sportKeys.detail(data.id), data);
      toast.success("Sport updated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update sport"));
    },
  });
};

export const useDeleteSport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sportId: string) => SportService.deleteSport(sportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportKeys.list() });
      toast.success("Sport deleted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete sport"));
    },
  });
};

export const useDeleteMultipleSports = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sportIds: string[]) => SportService.deleteMultipleSports(sportIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportKeys.list() });
      toast.success("Sports deleted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete sports"));
    },
  });
};

export const useSports = useSportsList;
export const useSport = useSportDetail;
