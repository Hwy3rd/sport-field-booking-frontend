import api from "@/lib/api/axios";
import { ApiListResponse, ApiResponse } from "@/types/api.type";
import {
  Court,
  CreateCourtRequest,
  GetAllCourtsRequest,
  UpdateCourtRequest,
} from "@/types/court.type";

export const CourtService = {
  getAllCourts: async (filter: GetAllCourtsRequest): Promise<ApiListResponse<Court>> => {
    const { data } = await api.get<ApiResponse<ApiListResponse<Court>>>("/court", {
      params: filter,
    });
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch courts");
    }

    return data.data;
  },

  getCourtById: async (courtId: string): Promise<Court> => {
    const { data } = await api.get<ApiResponse<Court>>(`/court/${courtId}`);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch court");
    }

    return data.data;
  },

  createCourt: async (courtData: CreateCourtRequest): Promise<Court> => {
    const { data } = await api.post<ApiResponse<Court>>("/court", courtData);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to create court");
    }

    return data.data;
  },

  updateCourt: async (courtId: string, courtData: UpdateCourtRequest): Promise<Court> => {
    const { data } = await api.patch<ApiResponse<Court>>(`/court/${courtId}`, courtData);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to update court");
    }

    return data.data;
  },

  deleteCourt: async (courtId: string): Promise<unknown> => {
    const { data } = await api.delete<ApiResponse<unknown>>(`/court/${courtId}`);
    if (!data.success) {
      throw new Error(data.message || "Failed to delete court");
    }

    return data.data;
  },

  deleteMultipleCourts: async (courtIds: string[]): Promise<unknown> => {
    const { data } = await api.post<ApiResponse<unknown>>("/court/bulk-delete", {
      ids: courtIds,
    });
    if (!data.success) {
      throw new Error(data.message || "Failed to delete courts");
    }

    return data.data;
  },
};
