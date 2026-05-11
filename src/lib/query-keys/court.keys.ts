import type { GetAllCourtsRequest } from "@/types/court.type";

export const courtKeys = {
  all: ["courts"] as const,
  list: (filter?: GetAllCourtsRequest) => ["courts", "list", filter ?? {}] as const,
  detail: (courtId: string) => ["courts", "detail", courtId] as const,
};
