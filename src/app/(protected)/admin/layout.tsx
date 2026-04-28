import { DashboardShell } from "@/components/shared/dashboard-shell";
import { AdminLayoutGuard } from "@/components/shared/role-layout-guard";
import { ADMIN_ROUTES } from "@/lib/constants/routes.constant";

const adminSidebarItems = [
  { label: "Overview", href: ADMIN_ROUTES.DASHBOARD },
  { label: "Users", href: ADMIN_ROUTES.USERS },
  { label: "Venues", href: ADMIN_ROUTES.VENUES },
  { label: "Courts", href: ADMIN_ROUTES.COURTS },
  { label: "Bookings", href: ADMIN_ROUTES.BOOKINGS },
  { label: "Sports", href: ADMIN_ROUTES.SPORTS },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminLayoutGuard>
      <DashboardShell title="Admin Panel" items={adminSidebarItems}>
        {children}
      </DashboardShell>
    </AdminLayoutGuard>
  );
}
