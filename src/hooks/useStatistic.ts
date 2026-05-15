"use client";

import { useQuery } from "@tanstack/react-query";
import { StatisticService } from "@/services/statistic.service";

export const statisticKeys = {
  all: ["statistic"] as const,
  summary: () => [...statisticKeys.all, "summary"] as const,
  revenueChart: (params?: { startDate?: string; endDate?: string }) =>
    [...statisticKeys.all, "revenue-chart", params ?? {}] as const,
  sportSplit: () => [...statisticKeys.all, "sport-split"] as const,
  occupancyRate: () => [...statisticKeys.all, "occupancy-rate"] as const,
  topVenues: () => [...statisticKeys.all, "top-venues"] as const,
  userGrowth: (params?: { startDate?: string; endDate?: string }) =>
    [...statisticKeys.all, "user-growth", params ?? {}] as const,
};

export const useSummaryStats = () =>
  useQuery({
    queryKey: statisticKeys.summary(),
    queryFn: () => StatisticService.getSummary(),
    staleTime: 60_000 * 5, // 5 mins cache
  });

export const useRevenueChart = (params?: { startDate?: string; endDate?: string }) =>
  useQuery({
    queryKey: statisticKeys.revenueChart(params),
    queryFn: () => StatisticService.getRevenueChart(params),
    staleTime: 60_000 * 5,
  });

export const useSportSplit = () =>
  useQuery({
    queryKey: statisticKeys.sportSplit(),
    queryFn: () => StatisticService.getSportSplit(),
    staleTime: 60_000 * 10,
  });

export const useOccupancyRate = () =>
  useQuery({
    queryKey: statisticKeys.occupancyRate(),
    queryFn: () => StatisticService.getOccupancyRate(),
    staleTime: 60_000 * 5,
  });

export const useTopVenues = () =>
  useQuery({
    queryKey: statisticKeys.topVenues(),
    queryFn: () => StatisticService.getTopVenues(),
    staleTime: 60_000 * 5,
  });

export const useUserGrowth = (params?: { startDate?: string; endDate?: string }) =>
  useQuery({
    queryKey: statisticKeys.userGrowth(params),
    queryFn: () => StatisticService.getUserGrowth(params),
    staleTime: 60_000 * 5,
  });
