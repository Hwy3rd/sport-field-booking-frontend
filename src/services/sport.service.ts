import api from "@/lib/api/axios";
import { ApiListResponse, ApiResponse } from "@/types/api.type";
import {
  CreateSportRequest,
  GetAllSportsRequest,
  Sport,
  UpdateSportRequest,
} from "@/types/sport.type";

export const SportService = {
  getAllSports: async (filter: GetAllSportsRequest): Promise<ApiListResponse<Sport>> => {
    const { data } = await api.get<ApiResponse<ApiListResponse<Sport>>>("/sport", {
      params: filter,
    });
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch sports");
    }

    return data.data;
  },

  getSportById: async (sportId: string): Promise<Sport> => {
    const { data } = await api.get<ApiResponse<Sport>>(`/sport/${sportId}`);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch sport");
    }

    return data.data;
  },

  createSport: async (sportData: CreateSportRequest): Promise<Sport> => {
    const { data } = await api.post<ApiResponse<Sport>>("/sport", sportData);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to create sport");
    }

    return data.data;
  },

  updateSport: async (sportId: string, sportData: UpdateSportRequest): Promise<Sport> => {
    const { data } = await api.patch<ApiResponse<Sport>>(`/sport/${sportId}`, sportData);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to update sport");
    }

    return data.data;
  },

  deleteSport: async (sportId: string): Promise<unknown> => {
    const { data } = await api.delete<ApiResponse<unknown>>(`/sport/${sportId}`);
    if (!data.success) {
      throw new Error(data.message || "Failed to delete sport");
    }

    return data.data;
  },

  deleteMultipleSports: async (sportIds: string[]): Promise<unknown> => {
    const { data } = await api.post<ApiResponse<unknown>>("/sport/bulk-delete", {
      ids: sportIds,
    });
    if (!data.success) {
      throw new Error(data.message || "Failed to delete sports");
    }

    return data.data;
  },

  // getSportListSSR: async (filter: GetAllSportsRequest): Promise<ApiListResponse<Sport>> => {
  //   const { data } = await api.get<ApiResponse<ApiListResponse<Sport>>>("/sport", {
  //     params: filter,
  //   });
  // },
};
