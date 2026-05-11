import type { GetAllVenuesRequest, SearchVenuesRequest } from "@/types/venue.type";

export const venueKeys = {
  all: ["venues"] as const,
  list: <T extends SearchVenuesRequest | GetAllVenuesRequest>(filter?: T) =>
    ["venues", "list", filter ?? {}] as const,
  detail: (venueId: string) => ["venues", "detail", venueId] as const,
};
