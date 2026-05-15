"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Court } from "@/types/court.type";
import type { TimeSlot } from "@/types/time-slot.type";

const DEFAULT_HOLD_MINUTES = 15;

export type CartCourtSummary = Pick<
  Court,
  "id" | "name" | "pricePerHour" | "status" | "venueId" | "imageUrl"
> & {
  venue?: Pick<NonNullable<Court["venue"]>, "id" | "name">;
};

export type CartCourtItem = {
  court: CartCourtSummary;
  selectedDate: string;
  timeSlots: TimeSlot[];
  createdAt: string;
  holdMinutes: number;
};

type CartState = {
  items: CartCourtItem[];
  saveCourtBooking: (
    court: CartCourtSummary,
    selectedDate: string,
    timeSlots: TimeSlot[],
  ) => { saved: boolean };
  removeCourt: (courtId: string) => void;
  removeTimeSlot: (courtId: string, timeSlotId: string) => void;
  pruneExpiredItems: () => void;
  clearCart: () => void;
};

function isExpired(item: CartCourtItem, now = Date.now()) {
  const deadline = new Date(item.createdAt);
  deadline.setMinutes(deadline.getMinutes() + item.holdMinutes);
  return deadline.getTime() <= now;
}

function getCourtSummary(court: CartCourtSummary): CartCourtSummary {
  return {
    id: court.id,
    name: court.name,
    pricePerHour: court.pricePerHour,
    status: court.status,
    venueId: court.venueId,
    imageUrl: court.imageUrl,
    venue: court.venue ? { id: court.venue.id, name: court.venue.name } : undefined,
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      saveCourtBooking: (court, selectedDate, timeSlots) => {
        if (timeSlots.length === 0) {
          return { saved: false };
        }

        const nextItem: CartCourtItem = {
          court: getCourtSummary(court),
          selectedDate,
          timeSlots,
          createdAt: new Date().toISOString(),
          holdMinutes: DEFAULT_HOLD_MINUTES,
        };

        set((state) => {
          const exists = state.items.some(
            (item) => item.court.id === court.id && item.selectedDate === selectedDate
          );
          if (!exists) {
            return { items: [...state.items, nextItem] };
          }

          return {
            items: state.items.map((item) =>
              item.court.id === court.id && item.selectedDate === selectedDate
                ? { ...item, timeSlots }
                : item,
            ),
          };
        });

        return { saved: true };
      },
      removeCourt: (courtId) =>
        set((state) => ({
          items: state.items.filter((item) => item.court.id !== courtId),
        })),
      removeTimeSlot: (courtId, timeSlotId) =>
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.court.id !== courtId) {
                return item;
              }

              const nextTimeSlots = item.timeSlots.filter((slot) => slot.id !== timeSlotId);
              return nextTimeSlots.length === 0 ? null : { ...item, timeSlots: nextTimeSlots };
            })
            .filter((item): item is CartCourtItem => item !== null),
        })),
      pruneExpiredItems: () =>
        set((state) => ({
          items: state.items.filter((item) => !isExpired(item)),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "court-cart-storage",
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<CartState & { items?: unknown[] }>;
        const items = Array.isArray(state.items)
          ? state.items.map((item) => {
              const legacyItem = item as {
                id?: string;
                name?: string;
                pricePerHour?: number;
                status?: string;
                venueName?: string;
              };

              if (legacyItem && legacyItem.id) {
                return {
                  court: {
                    id: legacyItem.id,
                    name: legacyItem.name ?? "Unknown court",
                    pricePerHour: legacyItem.pricePerHour ?? 0,
                    status: (legacyItem.status as any) ?? "active",
                    imageUrl: undefined,
                    venueId: "",
                    venue: legacyItem.venueName
                      ? { id: "", name: legacyItem.venueName }
                      : undefined,
                  },
                  selectedDate: new Date().toISOString().slice(0, 10),
                  timeSlots: [],
                  createdAt: new Date().toISOString(),
                  holdMinutes: DEFAULT_HOLD_MINUTES,
                } satisfies CartCourtItem;
              }

              return item;
            })
          : [];

        return { items };
      },
    },
  ),
);
