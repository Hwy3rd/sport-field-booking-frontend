import { ProtectedLayoutGuard } from "@/components/shared/protected-layout-guard";
import { SiteShell } from "@/components/shared/site-shell";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedLayoutGuard>
      <SiteShell>{children}</SiteShell>
    </ProtectedLayoutGuard>
  );
}
