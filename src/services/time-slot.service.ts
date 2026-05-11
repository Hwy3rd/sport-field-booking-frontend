import api from "@/lib/api/axios";
import { ApiListResponse, ApiResponse } from "@/types/api.type";
import {
  CreateTimeSlotRequest,
  GetAllTimeSlotsRequest,
  TimeSlot,
  UpdateTimeSlotRequest,
} from "@/types/time-slot.type";

export const TimeSlotService = {
  getAllTimeSlots: async (
    filter: GetAllTimeSlotsRequest,
  ): Promise<ApiListResponse<TimeSlot>> => {
    const { data } = await api.get<ApiResponse<ApiListResponse<TimeSlot>>>("/time-slot", {
      params: filter,
    });
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch time slots");
    }

    return data.data;
  },

  createTimeSlot: async (timeSlotData: CreateTimeSlotRequest): Promise<TimeSlot> => {
    const { data } = await api.post<ApiResponse<TimeSlot>>("/time-slot", timeSlotData);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to create time slot");
    }

    return data.data;
  },

  updateTimeSlot: async (
    timeSlotId: string,
    timeSlotData: UpdateTimeSlotRequest,
  ): Promise<TimeSlot> => {
    const { data } = await api.patch<ApiResponse<TimeSlot>>(
      `/time-slot/${timeSlotId}`,
      timeSlotData,
    );
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to update time slot");
    }

    return data.data;
  },

  deleteTimeSlot: async (timeSlotId: string): Promise<unknown> => {
    const { data } = await api.delete<ApiResponse<unknown>>(`/time-slot/${timeSlotId}`);
    if (!data.success) {
      throw new Error(data.message || "Failed to delete time slot");
    }

    return data.data;
  },

  deleteMultipleTimeSlots: async (timeSlotIds: string[]): Promise<unknown> => {
    const { data } = await api.post<ApiResponse<unknown>>("/time-slot/bulk-delete", {
      ids: timeSlotIds,
    });
    if (!data.success) {
      throw new Error(data.message || "Failed to delete time slots");
    }

    return data.data;
  },

  lockTimeSlot: async (timeSlotId: string): Promise<TimeSlot> => {
    const { data } = await api.post<ApiResponse<TimeSlot>>(`/time-slot/${timeSlotId}/lock`);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to lock time slot");
    }
    return data.data;
  },

  unlockTimeSlot: async (timeSlotId: string): Promise<TimeSlot> => {
    const { data } = await api.post<ApiResponse<TimeSlot>>(`/time-slot/${timeSlotId}/unlock`);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to unlock time slot");
    }
    return data.data;
  },
};
