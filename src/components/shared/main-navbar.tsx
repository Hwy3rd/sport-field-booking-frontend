"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { useState } from "react"

import { useAuth, useLogout } from "@/hooks/useAuth"
import { ROUTES } from "@/lib/constants/routes.constant"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { CartSheet } from "@/components/shared/cart-sheet"
import { MobileNavDrawer } from "@/components/shared/mobile-nav-drawer"
import { RoleBadge } from "@/components/shared/role-badge"

export function MainNavbar() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const logoutMutation = useLogout({ redirectTo: ROUTES.HOME })
  const [keyword, setKeyword] = useState("")

  const dashboardRoute =
    user?.role === "admin" ? ROUTES.ADMIN : user?.role === "owner" ? ROUTES.OWNER : null

  const navigationItems = [
    { label: "Home", href: ROUTES.HOME },
    { label: "Search", href: ROUTES.SEARCH },
    ...(dashboardRoute ? [{ label: "Dashboard", href: dashboardRoute }] : []),
  ]

  const submitSearch = () => {
    const url = keyword
      ? `${ROUTES.SEARCH}?keyword=${encodeURIComponent(keyword)}`
      : ROUTES.SEARCH
    router.push(url)
  }

  return (
    <div className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center gap-3 px-4">
        <MobileNavDrawer items={navigationItems} />
        <Link href={ROUTES.HOME} className="font-semibold tracking-tight text-foreground/90">
          SportBooking
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navigationItems.map((item) => (
            <Button key={item.href} asChild variant="ghost">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </div>

        <div className="ml-auto hidden w-full max-w-md items-center gap-2 md:flex">
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search venues..."
            className="h-11 rounded-xl bg-card"
          />
          <Button size="icon" variant="outline" className="h-11 w-11 rounded-xl" onClick={submitSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-xl md:hidden"
          >
            <Link href={ROUTES.SEARCH}>
              <Search className="h-4 w-4" />
            </Link>
          </Button>
          <CartSheet />
        </div>

        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 rounded-xl gap-2 bg-card">
                <Avatar className="h-7 w-7">
                  <AvatarFallback>{user.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">{user.fullName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel className="space-y-1">
                <div className="font-medium">{user.fullName}</div>
                <RoleBadge role={user.role} />
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {dashboardRoute ? (
                <DropdownMenuItem onClick={() => router.push(dashboardRoute)}>
                  Dashboard
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onClick={() => router.push(ROUTES.PROFILE)}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(ROUTES.PROFILE_BOOKINGS)}>
                Booking history
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="hidden md:inline-flex">
              Guest
            </Badge>
            <Button asChild variant="outline">
              <Link href={ROUTES.LOGIN}>Login</Link>
            </Button>
            <Button asChild>
              <Link href={ROUTES.REGISTER}>Register</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
