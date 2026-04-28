"use client";

import { SimpleUserInfo } from "@/types/user.type";
import Cookies from "js-cookie";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  accessToken: string | null;
  user: SimpleUserInfo | null;

  setAccessToken: (token: string) => void;
  setUser: (user: SimpleUserInfo) => void;
  setAuth: (token: string, user: SimpleUserInfo) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: typeof window !== "undefined" ? (Cookies.get("accessToken") ?? null) : null,
      user: null,

      setUser: (user) => set({ user }),

      setAccessToken: (token) => {
        Cookies.set("accessToken", token, { expires: 7 });
        set({ accessToken: token });
      },

      setAuth: (token, user) => {
        Cookies.set("accessToken", token, { expires: 7 });
        set({ accessToken: token, user });
      },

      clearAuth: () => {
        Cookies.remove("accessToken");
        set({ accessToken: null, user: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user, //only persist user
      }),
    },
  ),
);
