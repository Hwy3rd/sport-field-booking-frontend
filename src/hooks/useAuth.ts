"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/helper/get-message";
import { AuthService } from "@/services/auth.service";
import { UserService } from "@/services/user.service";
import { useAuthStore } from "@/stores/auth.store";
import type { LoginRequest, RegisterRequest } from "@/types/auth.type";
import { SimpleUserInfo } from "@/types/user.type";
import { userKeys } from "./useUser";

export const useLogin = (options?: { redirectTo?: string }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (payload: LoginRequest) => AuthService.login(payload),
    onSuccess: async (data) => {
      const { accessToken, ...userInfo } = data;
      setAuth(accessToken, userInfo as SimpleUserInfo);

      queryClient.setQueryData(userKeys.me, userInfo);

      toast.success("Login successful");

      router.push(options?.redirectTo ?? "/");
      router.refresh();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Login failed"));
    },
  });
};

export const useRegister = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: RegisterRequest) => AuthService.register(payload),
    onSuccess: () => {
      toast.success("Registration successful, you can now log in");
      router.push("/login");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Registration failed"));
    },
  });
};

export const useLogout = (options?: { redirectTo?: string }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => {
      toast.success("Logout successful");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Logout failed"));
    },
    onSettled: () => {
      clearAuth();
      queryClient.removeQueries({ queryKey: userKeys.me });

      if (options?.redirectTo) router.push(options.redirectTo);
    },
  });
};

export const useAuth = () => {
  const { user, accessToken } = useAuthStore();

  const isAuthenticated = !!accessToken;

  return {
    user,
    isAuthenticated,
    isAdmin: user?.role === "admin",
    isOwner: user?.role === "owner",
  };
};
