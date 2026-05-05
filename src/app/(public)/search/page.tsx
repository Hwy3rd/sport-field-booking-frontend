import { serverGet, serverPost } from "@/lib/api/server-api";
import type { ApiListResponse } from "@/types/api.type";
import type { Court } from "@/types/court.type";
import type { Sport } from "@/types/sport.type";
import type { Venue } from "@/types/venue.type";
import { SearchClient } from "./search-client";

interface SearchPageProps {
  searchParams: Promise<{
    keyword?: string;
    sportId?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const keyword = params.keyword?.trim() ?? "";
  const sportId = params.sportId?.trim() ?? "all";
  const minPrice = params.minPrice?.trim() ?? "";
  const maxPrice = params.maxPrice?.trim() ?? "";
  const page = Number(params.page ?? "1") || 1;
  const limit = Number(params.limit ?? "6") || 6;

  const [venuesData, courtsData, sportsData] = await Promise.all([
    serverPost<ApiListResponse<Venue>, { current: number; limit: number; filter: { name?: string; address?: string } }>(
      "/venue/search",
      {
        current: page,
        limit,
        filter: {
          name: keyword || undefined,
          address: keyword || undefined,
        },
      },
      { next: { revalidate: 60 } },
    ),
    serverGet<ApiListResponse<Court>>(
      "/court",
      {
        current: page,
        limit,
        name: keyword || undefined,
        sportId: sportId === "all" ? undefined : sportId,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      },
      { next: { revalidate: 60 } },
    ),
    serverGet<ApiListResponse<Sport>>(
      "/sport",
      { current: 1, limit: 50 },
      { next: { revalidate: 600 } },
    ),
  ]);

  return (
    <SearchClient
      initialKeyword={keyword}
      initialSportId={sportId}
      initialMinPrice={minPrice}
      initialMaxPrice={maxPrice}
      initialPage={page}
      initialLimit={limit}
      venuesData={venuesData}
      courtsData={courtsData}
      sportsData={sportsData}
    />
  );
}
