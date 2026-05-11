"use client";

import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { ROUTES } from "@/lib/constants/routes.constant";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedLayoutGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const hasToken = Boolean(Cookies.get("accessToken"));
    if (!isAuthenticated && !hasToken) {
      router.replace(`${ROUTES.LOGIN}?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, pathname, router]);

  return <>{children}</>;
}
