"use client";

import dayjs from "dayjs";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { TablePagination } from "@/components/shared/table-pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookingHistory } from "@/hooks/useBooking";

export default function ProfileBookingsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const bookingQuery = useBookingHistory({ current: page, limit: pageSize });
  const bookings = bookingQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Booking history"
        description="Track all your bookings and their statuses"
      />

      {bookingQuery.isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="You have not made any booking yet. Start exploring available courts."
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking.id} className="rounded-2xl">
              <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="font-medium">Booking #{booking.id.slice(0, 8)}</div>
                  <div className="text-muted-foreground text-sm">
                    Created at {dayjs(booking.createdAt).format("DD/MM/YYYY HH:mm")}
                  </div>
                  <div className="text-sm">Total: {booking.totalPrice.toLocaleString()} VND</div>
                </div>
                <Badge variant="outline">{booking.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {bookingQuery.data ? (
        <TablePagination
          total={bookingQuery.data.total}
          currentPage={bookingQuery.data.current}
          pageSize={bookingQuery.data.limit}
          onChangePage={setPage}
          onChangePageSize={setPageSize}
        />
      ) : null}
    </div>
  );
}
