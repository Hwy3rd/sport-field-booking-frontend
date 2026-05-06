import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { serverGet } from "@/lib/api/server-api";
import { courtKeys } from "@/lib/query-keys/court.keys";
import { sportKeys } from "@/lib/query-keys/sport.keys";
import { venueKeys } from "@/lib/query-keys/venue.keys";
import type { ApiListResponse } from "@/types/api.type";
import type { Court } from "@/types/court.type";
import type { Sport } from "@/types/sport.type";
import type { Venue } from "@/types/venue.type";
import { SearchClient } from "./search-client";
import {
  buildCourtFilter,
  buildSportFilter,
  buildVenueFilter,
  createEmptyList,
  normalizeSearchParams,
} from "./search-utils";

interface SearchPageProps {
  searchParams: Promise<{
    keyword?: string;
    venueKeyword?: string;
    courtKeyword?: string;
    sportId?: string;
    minPrice?: string;
    maxPrice?: string;
    venueLimit?: string;
    courtLimit?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = normalizeSearchParams(await searchParams);
  const venueFilter = buildVenueFilter(params);
  const courtFilter = buildCourtFilter(params);
  const sportFilter = buildSportFilter();
  const courtQueryParams = courtFilter as Record<string, string | number | undefined>;
  const venueQueryParams = venueFilter as Record<string, string | number | undefined>;
  const sportQueryParams = sportFilter as Record<string, string | number | undefined>;

  const queryClient = new QueryClient();
  const venuesKey = venueKeys.list(venueFilter);
  const courtsKey = courtKeys.list(courtFilter);
  const sportsKey = sportKeys.list(sportFilter);

  const [venuesResult, courtsResult, sportsResult] = await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: venuesKey,
      queryFn: () =>
        serverGet<ApiListResponse<Venue>>("/venue", venueQueryParams, {
          next: { revalidate: 60 },
        }),
    }),
    queryClient.prefetchQuery({
      queryKey: courtsKey,
      queryFn: () =>
        serverGet<ApiListResponse<Court>>("/court", courtQueryParams, { next: { revalidate: 60 } }),
    }),
    queryClient.prefetchQuery({
      queryKey: sportsKey,
      queryFn: () =>
        serverGet<ApiListResponse<Sport>>("/sport", sportQueryParams, {
          next: { revalidate: 600 },
        }),
    }),
  ]);

  if (venuesResult.status === "rejected") {
    queryClient.setQueryData(venuesKey, createEmptyList<Venue>(1, params.venueLimit));
  }
  if (courtsResult.status === "rejected") {
    queryClient.setQueryData(courtsKey, createEmptyList<Court>(1, params.courtLimit));
  }
  if (sportsResult.status === "rejected") {
    queryClient.setQueryData(sportsKey, createEmptyList<Sport>(1, sportFilter.limit ?? 50));
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SearchClient initialParams={params} />
    </HydrationBoundary>
  );
}
