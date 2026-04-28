"use client";

import dayjs from "dayjs";
import { RefreshCcw, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
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
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  useAdminBookingsList,
  useBookingDetail,
  useCreateBooking,
  useDeleteMultipleBookings,
} from "@/hooks/useBooking";
import { BOOKING_STATUS_VALUES, type BookingStatus } from "@/lib/constants/booking.constant";

const createBookingSchema = z.object({
  timeSlotIds: z.string().min(1, "Please provide at least 1 time slot id"),
});

type CreateBookingForm = z.infer<typeof createBookingSchema>;

export default function AdminBookingsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [draftStatus, setDraftStatus] = useState<BookingStatus | "all">("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailBookingId, setDetailBookingId] = useState<string | null>(null);

  const bookingsQuery = useAdminBookingsList({
    current: page,
    limit,
    filter: {
      status: status === "all" ? undefined : status,
    },
  });
  const createBookingMutation = useCreateBooking();
  const deleteMultipleBookingsMutation = useDeleteMultipleBookings();
  const bookingDetailQuery = useBookingDetail(detailBookingId ?? "", !!detailBookingId);
  const pageItems = bookingsQuery.data?.items ?? [];
  const isAllSelected = useMemo(
    () => pageItems.length > 0 && pageItems.every((item) => selectedIds.includes(item.id)),
    [pageItems, selectedIds],
  );
  const createForm = useForm<CreateBookingForm>({
    resolver: zodResolver(createBookingSchema as any),
    defaultValues: {
      timeSlotIds: "",
    },
  });

  const onCreateBooking = (values: CreateBookingForm) => {
    const timeSlotIds = values.timeSlotIds
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    createBookingMutation.mutate(
      { timeSlotIds },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          createForm.reset();
          bookingsQuery.refetch();
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Manage bookings" description="Inspect bookings across the platform" />

      <div className="surface-card flex flex-wrap items-center gap-2 p-4">
        <Button variant="outline" onClick={() => bookingsQuery.refetch()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setDraftStatus(status);
            setIsFilterOpen(true);
          }}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button onClick={() => setIsCreateOpen(true)}>Create new</Button>
        {selectedIds.length > 0 ? (
          <Button
            variant="destructive"
            onClick={() => {
              deleteMultipleBookingsMutation.mutate(selectedIds, {
                onSuccess: () => setSelectedIds([]),
              });
            }}
          >
            Delete selected ({selectedIds.length})
          </Button>
        ) : null}
      </div>

      {bookingsQuery.isLoading ? (
        <Skeleton className="h-72 rounded-2xl" />
      ) : (bookingsQuery.data?.items?.length ?? 0) === 0 ? (
        <EmptyState title="No bookings found" />
      ) : (
        <div className="surface-card p-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelectedIds(pageItems.map((item) => item.id));
                        return;
                      }
                      setSelectedIds([]);
                    }}
                  />
                </TableHead>
                <TableHead>Booking ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(bookingsQuery.data?.items ?? []).map((booking) => (
                <TableRow key={booking.id} className="cursor-pointer" onClick={() => setDetailBookingId(booking.id)}>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(booking.id)}
                      onChange={(event) => {
                        if (event.target.checked) {
                          setSelectedIds((prev) => [...prev, booking.id]);
                          return;
                        }
                        setSelectedIds((prev) => prev.filter((id) => id !== booking.id));
                      }}
                    />
                  </TableCell>
                  <TableCell>#{booking.id.slice(0, 8)}</TableCell>
                  <TableCell className="font-mono text-xs">{booking.userId.slice(0, 8)}</TableCell>
                  <TableCell>{dayjs(booking.createdAt).format("DD/MM/YYYY HH:mm")}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{booking.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {booking.totalPrice.toLocaleString()} VND
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Pagination
          current={bookingsQuery.data?.current ?? page}
          totalPages={bookingsQuery.data?.totalPages ?? 1}
          onChange={(value) => {
            setSelectedIds([]);
            setPage(value);
          }}
        />
        <div className="flex items-center gap-2">
          <Select
            value={String(page)}
            onValueChange={(value) => {
              setSelectedIds([]);
              setPage(Number(value));
            }}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Page" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: bookingsQuery.data?.totalPages ?? 1 }).map((_, index) => {
                const value = index + 1;
                return (
                  <SelectItem key={value} value={String(value)}>
                    Page {value}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Select
            value={String(limit)}
            onValueChange={(value) => {
              setPage(1);
              setSelectedIds([]);
              setLimit(Number(value));
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50].map((item) => (
                <SelectItem key={item} value={String(item)}>
                  {item} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter bookings</DialogTitle>
            <DialogDescription>Filter by booking status from backend.</DialogDescription>
          </DialogHeader>
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
              <div><span className="font-medium">Booking ID:</span> {bookingDetailQuery.data.id}</div>
              <div><span className="font-medium">User ID:</span> {bookingDetailQuery.data.userId}</div>
              <div><span className="font-medium">Status:</span> {bookingDetailQuery.data.status}</div>
              <div><span className="font-medium">Total price:</span> {bookingDetailQuery.data.totalPrice.toLocaleString()} VND</div>
              <div className="space-y-1 rounded-lg border p-3">
                <div className="font-medium">Items</div>
                {bookingDetailQuery.data.items.map((item) => (
                  <div key={item.id} className="text-xs text-muted-foreground">
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
    </div>
  );
}
