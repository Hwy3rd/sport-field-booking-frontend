"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SidebarItem = {
  label: string;
  href: string;
};

export function DashboardSidebar({
  title,
  items,
}: {
  title: string;
  items: SidebarItem[];
}) {
  const pathname = usePathname();

  return (
    <aside className="surface-card h-fit p-3">
      <div className="px-2 pb-2 pt-1 text-sm font-semibold text-muted-foreground">
        {title}
      </div>
      <div className="grid gap-1">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && item.href !== "/owner" && pathname.startsWith(item.href));

          return (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={cn(
                "justify-start rounded-xl",
                active && "bg-primary/10 text-primary hover:bg-primary/15",
              )}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          );
        })}
      </div>
    </aside>
  );
}
