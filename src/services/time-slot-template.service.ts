import api from "@/lib/api/axios";
import { ApiListResponse, ApiResponse } from "@/types/api.type";
import {
  CreateTimeSlotTemplateRequest,
  GetAllTimeSlotTemplatesRequest,
  TimeSlotTemplate,
  UpdateTimeSlotTemplateRequest,
} from "@/types/time-slot.type";

export const TimeSlotTemplateService = {
  getAllTimeSlotTemplates: async (
    filter: GetAllTimeSlotTemplatesRequest,
  ): Promise<ApiListResponse<TimeSlotTemplate>> => {
    const { data } = await api.get<ApiResponse<ApiListResponse<TimeSlotTemplate>>>(
      "/time-slot-template",
      { params: filter },
    );
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch time slot templates");
    }
    return data.data;
  },

  getTimeSlotTemplateById: async (templateId: string): Promise<TimeSlotTemplate> => {
    const { data } = await api.get<ApiResponse<TimeSlotTemplate>>(`/time-slot-template/${templateId}`);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch time slot template");
    }
    return data.data;
  },

  getGroupNames: async (venueId: string): Promise<string[]> => {
    const { data } = await api.get<ApiResponse<string[]>>(`/time-slot-template/group-names/${venueId}`);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch template group names");
    }
    return data.data;
  },

  createTimeSlotTemplate: async (
    payload: CreateTimeSlotTemplateRequest,
  ): Promise<TimeSlotTemplate> => {
    const { data } = await api.post<ApiResponse<TimeSlotTemplate>>("/time-slot-template", payload);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to create time slot template");
    }
    return data.data;
  },

  updateTimeSlotTemplate: async (
    templateId: string,
    payload: UpdateTimeSlotTemplateRequest,
  ): Promise<TimeSlotTemplate> => {
    const { data } = await api.patch<ApiResponse<TimeSlotTemplate>>(
      `/time-slot-template/${templateId}`,
      payload,
    );
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to update time slot template");
    }
    return data.data;
  },

  deleteTimeSlotTemplate: async (templateId: string): Promise<unknown> => {
    const { data } = await api.delete<ApiResponse<unknown>>(`/time-slot-template/${templateId}`);
    if (!data.success) {
      throw new Error(data.message || "Failed to delete time slot template");
    }
    return data.data;
  },

  deleteMultipleTimeSlotTemplates: async (templateIds: string[]): Promise<unknown> => {
    const { data } = await api.post<ApiResponse<unknown>>("/time-slot-template/bulk-delete", {
      ids: templateIds,
    });
    if (!data.success) {
      throw new Error(data.message || "Failed to delete time slot templates");
    }
    return data.data;
  },
};
