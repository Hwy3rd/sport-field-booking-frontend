"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { CourtCard } from "@/components/shared/court-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { VenueCard } from "@/components/shared/venue-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourts } from "@/hooks/useCourt";
import { useSports } from "@/hooks/useSport";
import { useVenues } from "@/hooks/useVenue";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialKeyword = searchParams.get("keyword") ?? "";

  const [keyword, setKeyword] = useState(initialKeyword);
  const [sportId, setSportId] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [page, setPage] = useState(1);

  const normalizedMinPrice = minPrice ? Number(minPrice) : undefined;
  const normalizedMaxPrice = maxPrice ? Number(maxPrice) : undefined;

  const venuesFilter = useMemo(
    () => ({
      current: page,
      limit: 6,
      filter: {
        name: keyword || undefined,
        address: keyword || undefined,
      },
    }),
    [keyword, page]
  );

  const courtsFilter = useMemo(
    () => ({
      current: page,
      limit: 6,
      name: keyword || undefined,
      sportId: sportId === "all" ? undefined : sportId,
      minPrice: normalizedMinPrice,
      maxPrice: normalizedMaxPrice,
    }),
    [keyword, sportId, normalizedMinPrice, normalizedMaxPrice, page]
  );

  const venuesQuery = useVenues(venuesFilter);
  const courtsQuery = useCourts(courtsFilter);
  const sportsQuery = useSports({ current: 1, limit: 50 });

  const isLoading = venuesQuery.isLoading || courtsQuery.isLoading;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside>
        <Card className="sticky top-24 rounded-2xl">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Keyword</label>
              <Input
                value={keyword}
                onChange={(event) => {
                  setPage(1);
                  setKeyword(event.target.value);
                }}
                placeholder="Venue or court name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sport type</label>
              <Select
                value={sportId}
                onValueChange={(value) => {
                  setPage(1);
                  setSportId(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All sports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sports</SelectItem>
                  {(sportsQuery.data?.items ?? []).map((sport) => (
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
                  onChange={(event) => {
                    setPage(1);
                    setMinPrice(event.target.value);
                  }}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(event) => {
                    setPage(1);
                    setMaxPrice(event.target.value);
                  }}
                />
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setKeyword("");
                setSportId("all");
                setMinPrice("");
                setMaxPrice("");
                setPage(1);
              }}
            >
              Reset filters
            </Button>
          </CardContent>
        </Card>
      </aside>

      <div className="space-y-8">
        <PageHeader
          title="Search results"
          description="Find your ideal venue and available courts"
        />

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Venues</h2>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : (venuesQuery.data?.items?.length ?? 0) === 0 ? (
            <EmptyState title="No venues found" description="Try another keyword or filter set." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {(venuesQuery.data?.items ?? []).map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Courts</h2>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : (courtsQuery.data?.items?.length ?? 0) === 0 ? (
            <EmptyState title="No courts found" description="Try another keyword or filter set." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {(courtsQuery.data?.items ?? []).map((court) => (
                <CourtCard key={court.id} court={court} />
              ))}
            </div>
          )}
        </section>

        <Pagination
          current={courtsQuery.data?.current ?? page}
          totalPages={Math.max(courtsQuery.data?.totalPages ?? 1, venuesQuery.data?.totalPages ?? 1)}
          onChange={setPage}
        />
      </div>
    </div>
  );
}
