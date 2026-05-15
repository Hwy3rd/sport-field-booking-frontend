import api from "@/lib/api/axios";
import { ApiResponse } from "@/types/api.type";
import {
  OccupancyRate,
  RevenueChartItem,
  SportSplitItem,
  SummaryStats,
  TopVenueItem,
  UserGrowthItem,
} from "@/types/statistic.type";

export const StatisticService = {
  getSummary: async (): Promise<SummaryStats> => {
    const { data } = await api.get<ApiResponse<SummaryStats>>("/statistic/summary");
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch summary stats");
    }
    return data.data;
  },

  getRevenueChart: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<RevenueChartItem[]> => {
    const { data } = await api.get<ApiResponse<RevenueChartItem[]>>("/statistic/revenue-chart", {
      params,
    });
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch revenue chart data");
    }
    return data.data;
  },

  getSportSplit: async (): Promise<SportSplitItem[]> => {
    const { data } = await api.get<ApiResponse<SportSplitItem[]>>("/statistic/sport-split");
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch sport split data");
    }
    return data.data;
  },

  getOccupancyRate: async (): Promise<OccupancyRate> => {
    const { data } = await api.get<ApiResponse<OccupancyRate>>("/statistic/occupancy-rate");
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch occupancy rate");
    }
    return data.data;
  },

  getTopVenues: async (): Promise<TopVenueItem[]> => {
    const { data } = await api.get<ApiResponse<TopVenueItem[]>>("/statistic/top-venues");
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch top venues");
    }
    return data.data;
  },

  getUserGrowth: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<UserGrowthItem[]> => {
    const { data } = await api.get<ApiResponse<UserGrowthItem[]>>("/statistic/user-growth", {
      params,
    });
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch user growth");
    }
    return data.data;
  },
};
