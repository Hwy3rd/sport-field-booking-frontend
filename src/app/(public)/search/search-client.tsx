"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { CourtCard } from "@/components/shared/court-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { TablePagination } from "@/components/shared/table-pagination";
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
import type { ApiListResponse } from "@/types/api.type";
import type { Court } from "@/types/court.type";
import type { Sport } from "@/types/sport.type";
import type { Venue } from "@/types/venue.type";

interface SearchClientProps {
  initialKeyword: string;
  initialSportId: string;
  initialMinPrice: string;
  initialMaxPrice: string;
  initialPage: number;
  initialLimit: number;
  venuesData: ApiListResponse<Venue>;
  courtsData: ApiListResponse<Court>;
  sportsData: ApiListResponse<Sport>;
}

export function SearchClient({
  initialKeyword,
  initialSportId,
  initialMinPrice,
  initialMaxPrice,
  initialPage,
  initialLimit,
  venuesData,
  courtsData,
  sportsData,
}: SearchClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [keyword, setKeyword] = useState(initialKeyword);
  const [sportId, setSportId] = useState(initialSportId);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

  const total = Math.max(courtsData.total, venuesData.total);
  const currentPage = Math.max(courtsData.current, venuesData.current);

  const navigateWithParams = useMemo(
    () =>
      (overrides?: {
        page?: number;
        limit?: number;
        keyword?: string;
        sportId?: string;
        minPrice?: string;
        maxPrice?: string;
      }) => {
        const nextKeyword = overrides?.keyword ?? keyword;
        const nextSportId = overrides?.sportId ?? sportId;
        const nextMinPrice = overrides?.minPrice ?? minPrice;
        const nextMaxPrice = overrides?.maxPrice ?? maxPrice;
        const nextPage = overrides?.page ?? initialPage;
        const nextLimit = overrides?.limit ?? initialLimit;

        const params = new URLSearchParams();
        if (nextKeyword.trim()) params.set("keyword", nextKeyword.trim());
        if (nextSportId !== "all") params.set("sportId", nextSportId);
        if (nextMinPrice.trim()) params.set("minPrice", nextMinPrice.trim());
        if (nextMaxPrice.trim()) params.set("maxPrice", nextMaxPrice.trim());
        params.set("page", String(nextPage));
        params.set("limit", String(nextLimit));

        router.push(`${pathname}?${params.toString()}`);
      },
    [keyword, sportId, minPrice, maxPrice, initialPage, initialLimit, pathname, router],
  );

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
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Venue or court name"
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

            <Button className="w-full" onClick={() => navigateWithParams({ page: 1 })}>
              Apply filters
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setKeyword("");
                setSportId("all");
                setMinPrice("");
                setMaxPrice("");
                navigateWithParams({
                  keyword: "",
                  sportId: "all",
                  minPrice: "",
                  maxPrice: "",
                  page: 1,
                });
              }}
            >
              Reset filters
            </Button>
          </CardContent>
        </Card>
      </aside>

      <div className="space-y-8">
        <PageHeader title="Search results" description="Find your ideal venue and available courts" />

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Venues</h2>
          {venuesData.items.length === 0 ? (
            <EmptyState title="No venues found" description="Try another keyword or filter set." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {venuesData.items.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Courts</h2>
          {courtsData.items.length === 0 ? (
            <EmptyState title="No courts found" description="Try another keyword or filter set." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {courtsData.items.map((court) => (
                <CourtCard key={court.id} court={court} />
              ))}
            </div>
          )}
        </section>

        <Card className="flex flex-wrap items-center justify-end gap-2 p-2">
          <TablePagination
            currentPage={currentPage}
            total={total}
            pageSize={initialLimit}
            onChangePage={(nextPage) => navigateWithParams({ page: nextPage })}
            onChangePageSize={(nextLimit) => navigateWithParams({ limit: nextLimit, page: 1 })}
          />
        </Card>
      </div>
    </div>
  );
}
