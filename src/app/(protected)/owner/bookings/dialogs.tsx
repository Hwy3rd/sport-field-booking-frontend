"use client";

import type { UseFormReturn } from "react-hook-form";
import type { UseMutationResult } from "@tanstack/react-query";

import { EmptyState } from "@/components/shared/empty-state";
import { BookingDetailDialog } from "@/components/shared/booking-detail-dialog";
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

interface OwnerBookingsDialogsProps {
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  draftStatus: BookingStatus | "all";
  setDraftStatus: (value: BookingStatus | "all") => void;
  draftStartDate: string;
  setDraftStartDate: (value: string) => void;
  draftEndDate: string;
  setDraftEndDate: (value: string) => void;
  setPage: (value: number) => void;
  setStatus: (value: BookingStatus | "all") => void;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  createForm: UseFormReturn<CreateBookingForm>;
  onCreate: (values: CreateBookingForm) => void;
  createBookingMutation: { isPending: boolean };
  detailBookingId: string | null;
  setDetailBookingId: (value: string | null) => void;
  detailQuery: {
    isLoading: boolean;
    data?: BookingDetailData | null;
  };
}

export function OwnerBookingsDialogs(props: OwnerBookingsDialogsProps) {
  const {
    isFilterOpen,
    setIsFilterOpen,
    draftStatus,
    setDraftStatus,
    draftStartDate,
    setDraftStartDate,
    draftEndDate,
    setDraftEndDate,
    setPage,
    setStatus,
    setStartDate,
    setEndDate,
    isCreateOpen,
    setIsCreateOpen,
    createForm,
    onCreate,
    createBookingMutation,
    detailBookingId,
    setDetailBookingId,
    detailQuery,
  } = props;

  return (
    <>
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter bookings</DialogTitle>
            <DialogDescription>Apply owner booking filters from backend query.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Status</div>
              <Select value={draftStatus} onValueChange={(value) => setDraftStatus(value as BookingStatus | "all")}>
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-sm font-medium">Start date</div>
                <Input type="date" value={draftStartDate} onChange={(event) => setDraftStartDate(event.target.value)} />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">End date</div>
                <Input type="date" value={draftEndDate} onChange={(event) => setDraftEndDate(event.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDraftStatus("all");
                setDraftStartDate("");
                setDraftEndDate("");
              }}
            >
              Reset
            </Button>
            <Button
              onClick={() => {
                setPage(1);
                setStatus(draftStatus);
                setStartDate(draftStartDate);
                setEndDate(draftEndDate);
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
            <form className="space-y-4" onSubmit={createForm.handleSubmit(onCreate)}>
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

      <BookingDetailDialog
        booking={detailQuery.data as any}
        open={!!detailBookingId}
        onOpenChange={(open) => !open && setDetailBookingId(null)}
      />
    </>
  );
}
