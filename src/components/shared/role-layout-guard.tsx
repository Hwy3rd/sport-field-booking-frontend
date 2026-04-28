"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants/routes.constant";
import { canAccessAdminRoutes, canAccessOwnerRoutes } from "@/lib/auth/permissions";

export function OwnerLayoutGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!canAccessOwnerRoutes(user?.role)) {
      router.replace(ROUTES.HOME);
    }
  }, [isAuthenticated, user?.role, router]);

  return <>{children}</>;
}

export function AdminLayoutGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!canAccessAdminRoutes(user?.role)) {
      router.replace(ROUTES.HOME);
    }
  }, [isAuthenticated, user?.role, router]);

  return <>{children}</>;
}
