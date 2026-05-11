"use client";

import dayjs from "dayjs";
import { Clock, MapPin, Tag } from "lucide-react";

import type { Booking } from "@/types/booking.type";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface BookingDetailDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDetailDialog({ booking, open, onOpenChange }: BookingDetailDialogProps) {
  if (!booking) return null;

  const getStatusColor = (status: string) => {
    const statusColorMap: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return (
      statusColorMap[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>
            Booking #{booking.id.slice(0, 8)} • Created{" "}
            {dayjs(booking.createdAt).format("DD/MM/YYYY HH:mm")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status & Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground mb-1 text-sm font-medium">Status</p>
              <Badge className={getStatusColor(booking.status)}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-sm font-medium">Total Amount</p>
              <p className="text-lg font-semibold">{booking.totalPrice.toLocaleString()} VND</p>
            </div>
          </div>

          <Separator />

          {/* Booking Items */}
          <div>
            <h3 className="mb-4 font-semibold">Booking Items ({booking.items?.length})</h3>
            <div className="space-y-4">
              {booking.items?.map((item) => (
                <div key={item.id} className="rounded-lg border p-4">
                  {/* Court & Venue */}
                  <div className="mb-3">
                    <p className="font-medium">{item.timeSlot?.court?.name || "Unknown Court"}</p>
                    <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                      <MapPin className="h-4 w-4" />
                      {item.timeSlot?.court?.venue?.name || "Unknown Venue"}
                    </p>
                  </div>

                  {/* Date & Time */}
                  <div className="mb-3 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground mb-1 text-xs font-medium">Date</p>
                      <p className="text-sm">{item.slotDate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1 flex items-center gap-1 text-xs font-medium">
                        <Clock className="h-3 w-3" />
                        Time
                      </p>
                      <p className="text-sm">
                        {item.startTime} - {item.endTime}
                      </p>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-muted/50 mb-3 rounded p-2.5">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">Unit Price</span>
                      <span>{item.unitPrice.toLocaleString()} VND/hour</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Total</span>
                      <span>{item.totalPrice.toLocaleString()} VND</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {item.courtId && (
                      <Badge variant="outline" className="gap-1">
                        <Tag className="h-3 w-3" />
                        Court ID: {item.courtId.slice(0, 8)}
                      </Badge>
                    )}
                    {item.timeSlotId && (
                      <Badge variant="secondary" className="text-xs">
                        Slot: {item.timeSlotId.slice(0, 8)}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Created</p>
              <p className="font-medium">
                {dayjs(booking.createdAt).format("DD/MM/YYYY HH:mm:ss")}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Updated</p>
              <p className="font-medium">
                {dayjs(booking.updatedAt).format("DD/MM/YYYY HH:mm:ss")}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
