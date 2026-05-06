import type { ApiListResponse } from "@/types/api.type";
import type { GetAllCourtsRequest } from "@/types/court.type";
import type { GetAllSportsRequest } from "@/types/sport.type";
import type { GetAllVenuesRequest } from "@/types/venue.type";

export const DEFAULT_LIMIT = 6;
export const LOAD_MORE_STEP = 6;

export interface SearchParamsState {
  venueKeyword: string;
  courtKeyword: string;
  sportId: string;
  minPrice: string;
  maxPrice: string;
  venueLimit: number;
  courtLimit: number;
}

export const normalizeSearchParams = (params: {
  keyword?: string;
  venueKeyword?: string;
  courtKeyword?: string;
  sportId?: string;
  minPrice?: string;
  maxPrice?: string;
  venueLimit?: string;
  courtLimit?: string;
}): SearchParamsState => {
  const fallbackKeyword = params.keyword?.trim() ?? "";
  const venueKeyword = params.venueKeyword?.trim() ?? fallbackKeyword;
  const courtKeyword = params.courtKeyword?.trim() ?? fallbackKeyword;
  const sportId = params.sportId?.trim() ?? "all";
  const minPrice = params.minPrice?.trim() ?? "";
  const maxPrice = params.maxPrice?.trim() ?? "";
  const venueLimit = Number(params.venueLimit ?? String(DEFAULT_LIMIT)) || DEFAULT_LIMIT;
  const courtLimit = Number(params.courtLimit ?? String(DEFAULT_LIMIT)) || DEFAULT_LIMIT;

  return {
    venueKeyword,
    courtKeyword,
    sportId,
    minPrice,
    maxPrice,
    venueLimit,
    courtLimit,
  };
};

export const buildVenueFilter = (state: SearchParamsState): GetAllVenuesRequest => {
  const filter: GetAllVenuesRequest = {
    current: 1,
    limit: state.venueLimit,
  };

  if (state.venueKeyword) {
    filter.name = state.venueKeyword;
    filter.address = state.venueKeyword;
  }

  return filter;
};

export const buildCourtFilter = (state: SearchParamsState): GetAllCourtsRequest => ({
  current: 1,
  limit: state.courtLimit,
  name: state.courtKeyword || undefined,
  sportId: state.sportId === "all" ? undefined : state.sportId,
  minPrice: state.minPrice ? Number(state.minPrice) : undefined,
  maxPrice: state.maxPrice ? Number(state.maxPrice) : undefined,
});

export const buildSportFilter = (): GetAllSportsRequest => ({
  current: 1,
  limit: 50,
});

export const createEmptyList = <T>(current: number, limit: number): ApiListResponse<T> => ({
  items: [],
  total: 0,
  current,
  limit,
  totalPages: 0,
});
