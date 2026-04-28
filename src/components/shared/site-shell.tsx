import { MainNavbar } from "@/components/shared/main-navbar";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNavbar />
      <main className="app-shell flex-1">{children}</main>
    </div>
  );
}
