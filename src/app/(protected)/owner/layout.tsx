import { DashboardShell } from "@/components/shared/dashboard-shell";
import { OwnerLayoutGuard } from "@/components/shared/role-layout-guard";
import { OWNER_ROUTES } from "@/lib/constants/routes.constant";

const ownerSidebarItems = [
  { label: "Overview", href: OWNER_ROUTES.DASHBOARD },
  { label: "Venues", href: OWNER_ROUTES.VENUES },
  { label: "Courts", href: OWNER_ROUTES.COURTS },
  { label: "Bookings", href: OWNER_ROUTES.BOOKINGS },
  { label: "Time Slots", href: OWNER_ROUTES.TIME_SLOTS },
  { label: "Slot Templates", href: OWNER_ROUTES.TIME_SLOT_TEMPLATES },
];

export default function OwnerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <OwnerLayoutGuard>
      <DashboardShell title="Owner Panel" items={ownerSidebarItems}>
        {children}
      </DashboardShell>
    </OwnerLayoutGuard>
  );
}
