"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type DropdownContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null)

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </DropdownContext.Provider>
  )
}

function DropdownMenuTrigger({
  asChild,
  children,
}: {
  asChild?: boolean
  children: React.ReactElement
}) {
  const ctx = React.useContext(DropdownContext)
  if (!ctx) return children

  const onClick = () => ctx.setOpen(!ctx.open)

  if (!asChild) {
    return (
      <button type="button" onClick={onClick}>
        {children}
      </button>
    )
  }

  return React.cloneElement(children as React.ReactElement<any>, {
    onClick: (...args: unknown[]) => {
      const originalOnClick = (children.props as any).onClick as
        | ((...event: unknown[]) => void)
        | undefined
      originalOnClick?.(...args)
      onClick()
    },
  })
}

function DropdownMenuContent({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const ctx = React.useContext(DropdownContext)
  if (!ctx?.open) return null

  return (
    <div
      className={cn(
        "absolute right-0 z-50 mt-2 min-w-44 rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        className
      )}
    >
      {children}
    </div>
  )
}

function DropdownMenuLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />
}

function DropdownMenuItem({
  className,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(DropdownContext)

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={(event) => {
        onClick?.(event)
        ctx?.setOpen(false)
      }}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
}
