import { DashboardSidebar } from "@/components/shared/dashboard-sidebar";

type SidebarItem = {
  label: string;
  href: string;
};

export function DashboardShell({
  title,
  items,
  children,
}: {
  title: string;
  items: SidebarItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <DashboardSidebar title={title} items={items} />
      <div className="space-y-6">{children}</div>
    </div>
  );
}
