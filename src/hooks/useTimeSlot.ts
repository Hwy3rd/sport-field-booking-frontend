"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/helper/get-message";
import { TimeSlotService } from "@/services/time-slot.service";
import { TimeSlotTemplateService } from "@/services/time-slot-template.service";
import type {
  CreateTimeSlotRequest,
  CreateTimeSlotTemplateRequest,
  GetAllTimeSlotsRequest,
  GetAllTimeSlotTemplatesRequest,
  UpdateTimeSlotRequest,
  UpdateTimeSlotTemplateRequest,
} from "@/types/time-slot.type";

export const timeSlotKeys = {
  all: ["time-slots"] as const,
  list: (filter?: GetAllTimeSlotsRequest) => ["time-slots", "list", filter ?? {}] as const,
  detail: (id: string) => ["time-slots", "detail", id] as const,
};

export const timeSlotTemplateKeys = {
  all: ["time-slot-templates"] as const,
  list: (filter?: GetAllTimeSlotTemplatesRequest) =>
    ["time-slot-templates", "list", filter ?? {}] as const,
  detail: (id: string) => ["time-slot-templates", "detail", id] as const,
};

export const useTimeSlots = (filter: GetAllTimeSlotsRequest = {}) =>
  useQuery({
    queryKey: timeSlotKeys.list(filter),
    queryFn: () => TimeSlotService.getAllTimeSlots(filter),
  });

export const useCreateTimeSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTimeSlotRequest) => TimeSlotService.createTimeSlot(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeSlotKeys.all });
      toast.success("Time slot created successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create time slot"));
    },
  });
};

export const useUpdateTimeSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTimeSlotRequest }) =>
      TimeSlotService.updateTimeSlot(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeSlotKeys.all });
      toast.success("Time slot updated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update time slot"));
    },
  });
};

export const useDeleteTimeSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => TimeSlotService.deleteTimeSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeSlotKeys.all });
      toast.success("Time slot deleted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete time slot"));
    },
  });
};

export const useTimeSlotTemplates = (filter: GetAllTimeSlotTemplatesRequest = {}) =>
  useQuery({
    queryKey: timeSlotTemplateKeys.list(filter),
    queryFn: () => TimeSlotTemplateService.getAllTimeSlotTemplates(filter),
  });

export const useCreateTimeSlotTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTimeSlotTemplateRequest) =>
      TimeSlotTemplateService.createTimeSlotTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeSlotTemplateKeys.all });
      toast.success("Template created successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create template"));
    },
  });
};

export const useUpdateTimeSlotTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTimeSlotTemplateRequest }) =>
      TimeSlotTemplateService.updateTimeSlotTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeSlotTemplateKeys.all });
      toast.success("Template updated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update template"));
    },
  });
};

export const useDeleteTimeSlotTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => TimeSlotTemplateService.deleteTimeSlotTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeSlotTemplateKeys.all });
      toast.success("Template deleted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete template"));
    },
  });
};
