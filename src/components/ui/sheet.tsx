"use client"

import * as React from "react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const Sheet = Dialog
const SheetTrigger = DialogTrigger
const SheetClose = DialogClose
const SheetTitle = DialogTitle
const SheetDescription = DialogDescription
const SheetHeader = DialogHeader

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent> & {
    side?: "left" | "right"
  }
>(({ className, side = "right", ...props }, ref) => (
  <DialogContent
    ref={ref}
    className={cn(
      "top-0 h-screen w-[85vw] max-w-sm translate-y-0 p-0",
      side === "left" ? "left-0 translate-x-0" : "left-auto right-0 translate-x-0",
      className
    )}
    {...props}
  />
))
SheetContent.displayName = "SheetContent"

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
}
