"use client";

import type { UseFormReturn } from "react-hook-form";
import type { UseMutationResult } from "@tanstack/react-query";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BOOKING_STATUS_VALUES, type BookingStatus } from "@/lib/constants/booking.constant";

type CreateBookingForm = {
  timeSlotIds: string;
};

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

interface AdminBookingsDialogsProps {
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  draftStatus: BookingStatus | "all";
  setDraftStatus: (value: BookingStatus | "all") => void;
  setPage: (value: number) => void;
  setStatus: (value: BookingStatus | "all") => void;
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  createForm: UseFormReturn<CreateBookingForm>;
  onCreateBooking: (values: CreateBookingForm) => void;
  createBookingMutation: UseMutationResult<unknown, Error, unknown, unknown>;
  detailBookingId: string | null;
  setDetailBookingId: (value: string | null) => void;
  bookingDetailQuery: {
    isLoading: boolean;
    data?: BookingDetailData | null;
  };
}

export function AdminBookingsDialogs(props: AdminBookingsDialogsProps) {
  const {
    isFilterOpen,
    setIsFilterOpen,
    draftStatus,
    setDraftStatus,
    setPage,
    setStatus,
    isCreateOpen,
    setIsCreateOpen,
    createForm,
    onCreateBooking,
    createBookingMutation,
    detailBookingId,
    setDetailBookingId,
    bookingDetailQuery,
  } = props;

  return (
    <>
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter bookings</DialogTitle>
            <DialogDescription>Filter by booking status from backend.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-sm font-medium">Status</div>
            <Select
              value={draftStatus}
              onValueChange={(value) => setDraftStatus(value as BookingStatus | "all")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                {BOOKING_STATUS_VALUES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraftStatus("all")}>
              Reset
            </Button>
            <Button
              onClick={() => {
                setPage(1);
                setStatus(draftStatus);
                setIsFilterOpen(false);
              }}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create booking</DialogTitle>
            <DialogDescription>Enter time slot IDs, separated by commas.</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form className="space-y-4" onSubmit={createForm.handleSubmit(onCreateBooking)}>
              <FormField
                control={createForm.control}
                name="timeSlotIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time slot IDs</FormLabel>
                    <FormControl>
                      <Input placeholder="slot-id-1, slot-id-2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createBookingMutation.isPending}>
                  {createBookingMutation.isPending ? "Creating..." : "Create booking"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
                <span className="font-medium">Total price:</span>{" "}
                {bookingDetailQuery.data.totalPrice.toLocaleString()} VND
              </div>
              <div className="space-y-1 rounded-lg border p-3">
                <div className="font-medium">Items</div>
                {bookingDetailQuery.data.items.map((item) => (
                  <div key={item.id} className="text-muted-foreground text-xs">
                    Court {item.courtId.slice(0, 8)} - {item.slotDate} {item.startTime}-
                    {item.endTime}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="No detail found" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
