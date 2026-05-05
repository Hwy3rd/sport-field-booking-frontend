"use client";

import dayjs from "dayjs";
import { RefreshCcw, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { TablePagination } from "@/components/shared/table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdminBookingsList,
  useBookingDetail,
  useCreateBooking,
  useDeleteMultipleBookings,
} from "@/hooks/useBooking";
import type { BookingStatus } from "@/lib/constants/booking.constant";
import { AdminBookingsDialogs } from "./dialogs";

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
                <TableRow
                  key={booking.id}
                  className="cursor-pointer"
                  onClick={() => setDetailBookingId(booking.id)}
                >
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

      <Card className="flex flex-wrap items-center justify-end gap-2 p-2">
        <TablePagination
          currentPage={bookingsQuery.data?.current ?? page}
          total={bookingsQuery.data?.total ?? 0}
          pageSize={limit}
          onChangePage={(value) => {
            setSelectedIds([]);
            setPage(value);
          }}
          onChangePageSize={(value) => {
            setPage(1);
            setSelectedIds([]);
            setLimit(value);
          }}
        />
      </Card>

      <AdminBookingsDialogs
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        draftStatus={draftStatus}
        setDraftStatus={setDraftStatus}
        setPage={setPage}
        setStatus={setStatus}
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        createForm={createForm}
        onCreateBooking={onCreateBooking}
        createBookingMutation={createBookingMutation}
        detailBookingId={detailBookingId}
        setDetailBookingId={setDetailBookingId}
        bookingDetailQuery={bookingDetailQuery}
      />
    </div>
  );
}
