"use client";

import dayjs from "dayjs";
import { RefreshCcw, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { TablePagination } from "@/components/shared/table-pagination";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { BookingDetailDialog } from "./dialogs/booking-detail-dialog";
import { BookingFilterDialog } from "./dialogs/booking-filter-dialog";
import { BookingFormDialog } from "./dialogs/booking-form-dialog";

const getBookingStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "confirmed":
    case "completed":
      return "success" as const;
    case "pending":
      return "warning" as const;
    case "cancelled":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
};

const getBookingStatusBadgeClassName = (status: string) => {
  switch (status) {
    case "confirmed":
    case "completed":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "pending":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "cancelled":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "";
  }
};

export default function AdminBookingsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [draftStatus, setDraftStatus] = useState<BookingStatus | "all">("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);
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
  const onCreateBooking = async (values: { timeSlotIds: string }) => {
    const timeSlotIds = values.timeSlotIds
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    try {
      await createBookingMutation.mutateAsync({ timeSlotIds });
      setIsCreateOpen(false);
      bookingsQuery.refetch();
    } catch {
      // mutation hook already handles user feedback
    }
  };

  const handleDeleteSelectedBookings = async () => {
    if (!selectedIds.length) return;
    try {
      await deleteMultipleBookingsMutation.mutateAsync(selectedIds);
      setSelectedIds([]);
      setDeleteSelectedOpen(false);
    } catch {
      // mutation hook already handles user feedback
    }
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
            onClick={() => setDeleteSelectedOpen(true)}
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
                    <Badge
                      variant={getBookingStatusBadgeVariant(booking.status)}
                      className={getBookingStatusBadgeClassName(booking.status)}
                    >
                      {booking.status}
                    </Badge>
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

      <BookingFilterDialog
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        draftStatus={draftStatus}
        onDraftStatusChange={setDraftStatus}
        onApply={(nextStatus) => {
          setPage(1);
          setStatus(nextStatus);
        }}
      />
      <BookingFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreateBooking={onCreateBooking}
        isCreating={createBookingMutation.isPending}
      />
      <BookingDetailDialog
        detailBookingId={detailBookingId}
        setDetailBookingId={setDetailBookingId}
        bookingDetailQuery={bookingDetailQuery}
      />

      <AlertDialog open={deleteSelectedOpen} onOpenChange={setDeleteSelectedOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected bookings?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will permanently delete {selectedIds.length} selected booking(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelectedBookings}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
