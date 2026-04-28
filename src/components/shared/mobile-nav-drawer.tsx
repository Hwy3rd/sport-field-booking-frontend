"use client"

import Link from "next/link"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

type MobileNavDrawerProps = {
  items: Array<{ label: string; href: string }>
}

export function MobileNavDrawer({ items }: MobileNavDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="rounded-none p-4">
        <div className="mb-4 text-lg font-semibold">Menu</div>
        <div className="grid gap-2">
          {items.map((item) => (
            <Button key={item.href} asChild variant="ghost" className="justify-start">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
