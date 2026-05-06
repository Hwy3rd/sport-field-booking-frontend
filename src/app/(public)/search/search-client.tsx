"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { useCourtsList } from "@/hooks/useCourt";
import { useSportsList } from "@/hooks/useSport";
import { useDebounce } from "@/hooks/useDebounce";
import { CourtCard } from "@/components/shared/court-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { VenueCard } from "@/components/shared/venue-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { venueKeys } from "@/lib/query-keys/venue.keys";
import { VenueService } from "@/services/venue.service";
import type { Court } from "@/types/court.type";
import type { Sport } from "@/types/sport.type";
import type { Venue } from "@/types/venue.type";
import {
  buildCourtFilter,
  buildSportFilter,
  buildVenueFilter,
  createEmptyList,
  DEFAULT_LIMIT,
  LOAD_MORE_STEP,
  SearchParamsState,
} from "./search-utils";

interface SearchClientProps {
  initialParams: SearchParamsState;
}

export function SearchClient({ initialParams }: SearchClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [venueKeyword, setVenueKeyword] = useState(initialParams.venueKeyword);
  const [courtKeyword, setCourtKeyword] = useState(initialParams.courtKeyword);
  const [sportId, setSportId] = useState(initialParams.sportId);
  const [minPrice, setMinPrice] = useState(initialParams.minPrice);
  const [maxPrice, setMaxPrice] = useState(initialParams.maxPrice);

  const debouncedVenueKeyword = useDebounce(venueKeyword);
  const debouncedCourtKeyword = useDebounce(courtKeyword);
  const debouncedMinPrice = useDebounce(minPrice);
  const debouncedMaxPrice = useDebounce(maxPrice);

  const venueLimit = initialParams.venueLimit;
  const courtLimit = initialParams.courtLimit;

  const venueFilter = useMemo(
    () =>
      buildVenueFilter({
        venueLimit,
        courtLimit,
        venueKeyword,
        courtKeyword,
        sportId,
        minPrice,
        maxPrice,
      }),
    [venueLimit, courtLimit, venueKeyword, courtKeyword, sportId, minPrice, maxPrice],
  );
  const courtFilter = useMemo(
    () =>
      buildCourtFilter({
        venueLimit,
        courtLimit,
        venueKeyword,
        courtKeyword,
        sportId,
        minPrice,
        maxPrice,
      }),
    [venueLimit, courtLimit, venueKeyword, courtKeyword, sportId, minPrice, maxPrice],
  );
  const sportFilter = useMemo(() => buildSportFilter(), []);

  const venuesQuery = useQuery({
    queryKey: venueKeys.list(venueFilter),
    queryFn: () => VenueService.getAllVenues(venueFilter),
    staleTime: 60_000,
  });
  const courtsQuery = useCourtsList(courtFilter);
  const sportsQuery = useSportsList(sportFilter);

  const venuesData = venuesQuery.data ?? createEmptyList<Venue>(1, venueLimit);
  const courtsData = courtsQuery.data ?? createEmptyList<Court>(1, courtLimit);
  const sportsData = sportsQuery.data ?? createEmptyList<Sport>(1, sportFilter.limit ?? 50);

  const navigateWithParams = useMemo(
    () =>
      (overrides?: {
        venueKeyword?: string;
        courtKeyword?: string;
        sportId?: string;
        minPrice?: string;
        maxPrice?: string;
        venueLimit?: number;
        courtLimit?: number;
      }) => {
        const nextVenueKeyword = overrides?.venueKeyword ?? venueKeyword;
        const nextCourtKeyword = overrides?.courtKeyword ?? courtKeyword;
        const nextSportId = overrides?.sportId ?? sportId;
        const nextMinPrice = overrides?.minPrice ?? minPrice;
        const nextMaxPrice = overrides?.maxPrice ?? maxPrice;
        const nextVenueLimit = overrides?.venueLimit ?? venueLimit;
        const nextCourtLimit = overrides?.courtLimit ?? courtLimit;

        const params = new URLSearchParams();
        if (nextVenueKeyword.trim()) params.set("venueKeyword", nextVenueKeyword.trim());
        if (nextCourtKeyword.trim()) params.set("courtKeyword", nextCourtKeyword.trim());
        if (nextSportId !== "all") params.set("sportId", nextSportId);
        if (nextMinPrice.trim()) params.set("minPrice", nextMinPrice.trim());
        if (nextMaxPrice.trim()) params.set("maxPrice", nextMaxPrice.trim());
        params.set("venueLimit", String(nextVenueLimit));
        params.set("courtLimit", String(nextCourtLimit));

        router.push(`${pathname}?${params.toString()}`);
      },
    [
      venueKeyword,
      courtKeyword,
      sportId,
      minPrice,
      maxPrice,
      venueLimit,
      courtLimit,
      pathname,
      router,
    ],
  );

  const venueInitialized = useRef(false);
  const courtInitialized = useRef(false);

  useEffect(() => {
    if (!venueInitialized.current) {
      venueInitialized.current = true;
      return;
    }

    navigateWithParams({
      venueKeyword: debouncedVenueKeyword,
      venueLimit: DEFAULT_LIMIT,
    });
  }, [debouncedVenueKeyword, navigateWithParams]);

  useEffect(() => {
    if (!courtInitialized.current) {
      courtInitialized.current = true;
      return;
    }

    navigateWithParams({
      courtKeyword: debouncedCourtKeyword,
      sportId,
      minPrice: debouncedMinPrice,
      maxPrice: debouncedMaxPrice,
      courtLimit: DEFAULT_LIMIT,
    });
  }, [debouncedCourtKeyword, debouncedMinPrice, debouncedMaxPrice, sportId, navigateWithParams]);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside>
        <Card className="sticky top-24 rounded-2xl">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                Venue search
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Venue keyword</label>
                <Input
                  value={venueKeyword}
                  onChange={(event) => setVenueKeyword(event.target.value)}
                  placeholder="Name or address"
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setVenueKeyword("");
                  navigateWithParams({
                    venueKeyword: "",
                    venueLimit: DEFAULT_LIMIT,
                  });
                }}
              >
                Clear venue search
              </Button>
            </div>

            <div className="space-y-3 border-t pt-4">
              <p className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                Court filters
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Court keyword</label>
                <Input
                  value={courtKeyword}
                  onChange={(event) => setCourtKeyword(event.target.value)}
                  placeholder="Court name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sport type</label>
                <Select value={sportId} onValueChange={setSportId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All sports" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sports</SelectItem>
                    {sportsData.items.map((sport) => (
                      <SelectItem key={sport.id} value={sport.id}>
                        {sport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Price range</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                  />
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCourtKeyword("");
                  setSportId("all");
                  setMinPrice("");
                  setMaxPrice("");
                  navigateWithParams({
                    courtKeyword: "",
                    sportId: "all",
                    minPrice: "",
                    maxPrice: "",
                    courtLimit: DEFAULT_LIMIT,
                  });
                }}
              >
                Reset court filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </aside>

      <div className="space-y-8">
        <PageHeader
          title="Search results"
          description="Find your ideal venue and available courts"
        />

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Venues</h2>
            <p className="text-muted-foreground text-sm">Search by venue name or address.</p>
          </div>

          {venuesData.items.length === 0 ? (
            <EmptyState title="No venues found" description="Try another keyword." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {venuesData.items.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          )}

          {venuesData.items.length < venuesData.total && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() =>
                  navigateWithParams({
                    venueLimit: venueLimit + LOAD_MORE_STEP,
                  })
                }
              >
                Xem them venues
              </Button>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Courts</h2>
            <p className="text-muted-foreground text-sm">Filter by sport and hourly price range.</p>
          </div>

          {courtsData.items.length === 0 ? (
            <EmptyState title="No courts found" description="Try another filter set." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {courtsData.items.map((court) => (
                <CourtCard key={court.id} court={court} />
              ))}
            </div>
          )}

          {courtsData.items.length < courtsData.total && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() =>
                  navigateWithParams({
                    courtLimit: courtLimit + LOAD_MORE_STEP,
                  })
                }
              >
                Xem them courts
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
