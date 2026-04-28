"use client";

import Link from "next/link";
import { ShoppingCart, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cart.store";

export function CartSheet() {
  const items = useCartStore((state) => state.items);
  const removeCourt = useCartStore((state) => state.removeCourt);
  const clearCart = useCartStore((state) => state.clearCart);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-11 w-11 rounded-xl bg-card">
          <ShoppingCart className="h-4 w-4" />
          {items.length > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
              {items.length}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full max-w-md p-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle>Selected courts</SheetTitle>
          <SheetDescription>
            Courts added to your cart before booking
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3 p-5">
          {items.length === 0 ? (
            <EmptyState
              title="Your cart is empty"
              description="Add courts from search or court detail to start building your booking."
            />
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border bg-card p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <Link
                        href={`/courts/${item.id}`}
                        className="line-clamp-1 text-sm font-semibold text-foreground hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {item.venueName ?? "Unknown venue"}
                      </div>
                      <div className="text-xs font-medium">
                        {item.pricePerHour.toLocaleString()} VND / hour
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline">{item.status}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeCourt(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={clearCart}>
                  Clear cart
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/search">Continue booking</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
