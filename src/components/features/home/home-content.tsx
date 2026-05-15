"use client";

import Link from "next/link";

import { CourtCard } from "@/components/shared/court-card";
import { EmptyState } from "@/components/shared/empty-state";
import { VenueCard } from "@/components/shared/venue-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourts } from "@/hooks/useCourt";
import { useVenues } from "@/hooks/useVenue";
import { ROUTES } from "@/lib/constants/routes.constant";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useBookingDetail } from "@/hooks/useBooking";
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { BOOKING_STATUS } from "@/lib/constants/booking.constant";
import { useCartStore } from "@/stores/cart.store";

export function HomeContent() {
  const { items: cartItems, clearCart } = useCartStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const venuesQuery = useVenues({ current: 1, limit: 6 });
  const courtsQuery = useCourts({ current: 1, limit: 6 });

  const paymentStatusParam = searchParams?.get("payment_status");
  const bookingIdParam = searchParams?.get("bookingId");

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Start flow if params present
  const targetBookingId = paymentStatusParam === "success" ? bookingIdParam : null;

  const bookingQuery = useBookingDetail(targetBookingId ?? "", !!targetBookingId);

  useEffect(() => {
    if (paymentStatusParam === "success" && cartItems.length > 0) {
      clearCart();
    }
  }, [paymentStatusParam, cartItems.length, clearCart]);

  useEffect(() => {
    if (paymentStatusParam === "success" && bookingIdParam) {
      setIsDialogOpen(true);
    }
  }, [paymentStatusParam, bookingIdParam]);

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    // Clean URL
    router.replace(ROUTES.HOME);
  };

  const handleViewBookings = () => {
    setIsDialogOpen(false);
    router.push(ROUTES.PROFILE_BOOKINGS);
  };

  const featuredVenues = venuesQuery.data?.items ?? [];
  const featuredCourts = courtsQuery.data?.items ?? [];

  return (
    <div className="space-y-12">
      <section className="surface-card relative overflow-hidden p-8 sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.16),transparent_42%)]" />
        <p className="text-primary text-sm font-medium">Book smarter. Play better.</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-5xl">
          Discover top sports venues and reserve your court in minutes
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          Find available courts by location, sport type, and price. Manage your bookings with a
          modern and seamless experience.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild className="rounded-xl">
            <Link href={ROUTES.SEARCH}>Start booking</Link>
          </Button>
          <Button asChild variant="outline" className="bg-card rounded-xl">
            <Link href={ROUTES.PROFILE_BOOKINGS}>View my bookings</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured venues</h2>
          <Button asChild variant="ghost">
            <Link href={ROUTES.SEARCH}>See all</Link>
          </Button>
        </div>
        {venuesQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : featuredVenues.length === 0 ? (
          <EmptyState title="No venues available" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Featured courts</h2>
        {courtsQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : featuredCourts.length === 0 ? (
          <EmptyState title="No courts available" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourts.map((court) => (
              <CourtCard key={court.id} court={court} />
            ))}
          </div>
        )}
      </section>

      {/* Payment Success Verification Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(val) => {
          if (!val) handleCloseDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          {bookingQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
              <DialogHeader className="sr-only">
                <DialogTitle>Verifying payment</DialogTitle>
              </DialogHeader>
              <Loader2 className="text-primary h-10 w-10 animate-spin" />
              <p className="text-muted-foreground text-sm font-medium">
                Verifying your payment with the system...
              </p>
            </div>
          ) : bookingQuery.isError ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <DialogHeader>
                <DialogTitle className="text-center text-xl">Verification Issue</DialogTitle>
                <DialogDescription className="text-center">
                  Payment completed but we couldn't verify the status immediately. Please check your
                  Booking History shortly.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="w-full sm:justify-center">
                <Button onClick={handleCloseDialog} variant="outline">
                  Close
                </Button>
                <Button onClick={handleViewBookings}>Go to Bookings</Button>
              </DialogFooter>
            </div>
          ) : bookingQuery.data?.status === BOOKING_STATUS.CONFIRMED ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <DialogHeader className="space-y-2">
                <DialogTitle className="text-center text-xl font-bold text-green-600">
                  Payment Successful!
                </DialogTitle>
                <DialogDescription className="text-center">
                  Your booking has been confirmed successfully.
                </DialogDescription>
              </DialogHeader>

              <div className="bg-muted/50 w-full rounded-xl p-4 text-center">
                <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Booking Reference
                </p>
                <p className="mt-1 font-mono text-sm font-medium break-all">{bookingIdParam}</p>
              </div>

              <DialogFooter className="flex w-full flex-col gap-2 sm:flex-row">
                <Button onClick={handleCloseDialog} variant="outline" className="flex-1">
                  Done
                </Button>
                <Button onClick={handleViewBookings} className="flex-1">
                  View My Bookings
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
              <DialogHeader>
                <DialogTitle className="text-center text-xl">Processing Order</DialogTitle>
                <DialogDescription className="text-center">
                  We received confirmation, finalizing the transaction status. Updating
                  momentarily...
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex w-full justify-center">
                <Button onClick={handleCloseDialog} variant="outline">
                  Dismiss
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
