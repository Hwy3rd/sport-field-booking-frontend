"use client";

import { EmptyState } from "@/components/shared/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface BookingDetailData {
  id: string;
  userId: string;
  status: string;
  totalPrice: number;
  items: Array<{
    id: string;
    courtId: string;
    slotDate: string;
    startTime: string;
    endTime: string;
  }>;
}

interface BookingDetailDialogProps {
  detailBookingId: string | null;
  setDetailBookingId: (value: string | null) => void;
  bookingDetailQuery: {
    isLoading: boolean;
    data?: BookingDetailData | null;
  };
}

export function BookingDetailDialog(props: BookingDetailDialogProps) {
  const { detailBookingId, setDetailBookingId, bookingDetailQuery } = props;

  return (
    <Dialog open={!!detailBookingId} onOpenChange={(open) => !open && setDetailBookingId(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Booking detail</DialogTitle>
          <DialogDescription>Data loaded from booking detail API.</DialogDescription>
        </DialogHeader>
        {bookingDetailQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : bookingDetailQuery.data ? (
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium">Booking ID:</span> {bookingDetailQuery.data.id}
            </div>
            <div>
              <span className="font-medium">User ID:</span> {bookingDetailQuery.data.userId}
            </div>
            <div>
              <span className="font-medium">Status:</span> {bookingDetailQuery.data.status}
            </div>
            <div>
              <span className="font-medium">Total price:</span> {bookingDetailQuery.data.totalPrice.toLocaleString()} VND
            </div>
            <div className="space-y-1 rounded-lg border p-3">
              <div className="font-medium">Items</div>
              {bookingDetailQuery.data.items.map((item) => (
                <div key={item.id} className="text-muted-foreground text-xs">
                  Court {item.courtId.slice(0, 8)} - {item.slotDate} {item.startTime}-{item.endTime}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState title="No detail found" />
        )}
      </DialogContent>
    </Dialog>
  );
}

