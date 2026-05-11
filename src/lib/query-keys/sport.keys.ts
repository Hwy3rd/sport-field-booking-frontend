import type { GetAllSportsRequest } from "@/types/sport.type";

export const sportKeys = {
  all: ["sports"] as const,
  list: (filter?: GetAllSportsRequest) => ["sports", "list", filter ?? {}] as const,
  detail: (sportId: string) => ["sports", "detail", sportId] as const,
};
