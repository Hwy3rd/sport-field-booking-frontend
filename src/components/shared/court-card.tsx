import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CourtBookingDialog } from "@/components/shared/court-booking-dialog";
import { useCartStore } from "@/stores/cart.store";
import type { Court } from "@/types/court.type";
import Link from "next/link";

export function CourtCard({ court }: { court: Court }) {
  const saveCourtBooking = useCartStore((state) => state.saveCourtBooking);

  return (
    <Card className="surface-card transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader>
        {court.imageUrl ? (
          <img
            src={court.imageUrl}
            alt={court.name}
            className="mb-3 h-36 w-full rounded-xl border object-cover"
          />
        ) : (
          <div className="mb-3 h-36 rounded-xl border bg-gradient-to-br from-violet-100/70 to-blue-100/70" />
        )}
        <CardTitle className="line-clamp-1 text-lg">{court.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-muted-foreground text-sm">
          Price: {court.pricePerHour.toLocaleString()} VND / hour
        </div>
        <Badge variant="outline">{court.status}</Badge>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2 pt-2">
        <CourtBookingDialog
          court={court}
          trigger={
            <Button variant="outline" size="sm" className="rounded-lg">
              Add to cart
            </Button>
          }
          onConfirm={({ selectedDate, timeSlots }) => {
            const result = saveCourtBooking(court, selectedDate, timeSlots);
            if (!result.saved) {
              toast.info("Choose at least one available time slot");
              return;
            }
            toast.success("Court added with selected time slots");
          }}
        />
        <Link href={`/courts/${court.id}`} className="text-primary text-sm font-medium">
          View detail
        </Link>
      </CardFooter>
    </Card>
  );
}
