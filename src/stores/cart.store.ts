"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Court } from "@/types/court.type";

export type CartCourtItem = {
  id: string;
  name: string;
  pricePerHour: number;
  venueName?: string;
  status: string;
};

type CartState = {
  items: CartCourtItem[];
  addCourt: (court: Court) => { added: boolean };
  removeCourt: (courtId: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addCourt: (court) => {
        const exists = get().items.some((item) => item.id === court.id);
        if (exists) return { added: false };

        const nextItem: CartCourtItem = {
          id: court.id,
          name: court.name,
          pricePerHour: court.pricePerHour,
          venueName: court.venue?.name,
          status: court.status,
        };

        set((state) => ({ items: [...state.items, nextItem] }));
        return { added: true };
      },
      removeCourt: (courtId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== courtId),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "court-cart-storage",
    },
  ),
);
