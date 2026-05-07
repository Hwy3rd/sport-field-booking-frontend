"use client";

import dayjs from "dayjs";
import { useState } from "react";
import { X } from "lucide-react";

import { BookingDetailDialog } from "@/components/shared/booking-detail-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { TablePagination } from "@/components/shared/table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BOOKING_STATUS_VALUES } from "@/lib/constants/booking.constant";
import { getLocalDateString } from "@/lib/helper/date";
import { useBookingHistory } from "@/hooks/useBooking";
import type { Booking } from "@/types/booking.type";
import type { BookingStatus } from "@/lib/constants/booking.constant";

export default function ProfileBookingsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const bookingQuery = useBookingHistory({
    current: page,
    limit: pageSize,
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(status && { status: status as BookingStatus }),
  });

  const bookings = bookingQuery.data?.items ?? [];
  const hasFilters = startDate || endDate || status;

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setStatus("");
    setPage(1);
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Booking history"
        description="Track all your bookings and their statuses"
      />

      {/* Filters Section */}
      <div className="bg-muted/50 rounded-lg border p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="start-date" className="text-sm font-medium">
              From Date
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              max={endDate || getLocalDateString()}
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="end-date" className="text-sm font-medium">
              To Date
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              min={startDate}
              max={getLocalDateString()}
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Status
            </Label>
            <Select
              value={status || "all"}
              onValueChange={(value) => {
                setStatus(value === "all" ? "" : (value as BookingStatus));
                setPage(1);
              }}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {BOOKING_STATUS_VALUES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Button */}
          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              disabled={!hasFilters}
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              Clear filters
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}

      {bookingQuery.isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No bookings found" : "No bookings yet"}
          description={
            hasFilters
              ? "Try adjusting your filters to find bookings."
              : "You have not made any booking yet. Start exploring available courts."
          }
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card
              key={booking.id}
              className="hover:border-primary/50 cursor-pointer rounded-2xl transition-shadow hover:shadow-md"
              onClick={() => handleViewDetails(booking)}
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-lg font-semibold">Booking #{booking.id.slice(0, 8)}</div>
                      <div className="text-muted-foreground mt-1 text-sm">
                        Created {dayjs(booking.createdAt).format("DD/MM/YYYY HH:mm")}
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {booking.status}
                    </Badge>
                  </div>

                  <Separator />

                  {/* Items Preview */}
                  <div>
                    <p className="text-muted-foreground mb-2 text-sm font-medium">
                      {booking.items?.length} item{booking.items?.length !== 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {booking.items?.slice(0, 3).map((item) => (
                        <Badge key={item.id} variant="secondary" className="text-xs">
                          {item.timeSlot?.court?.name || "Court"} • {item.slotDate}
                        </Badge>
                      ))}
                      {booking.items?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{booking.items?.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-xs font-medium">Total</p>
                      <p className="font-semibold">{booking.totalPrice?.toLocaleString()} VND</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(booking);
                      }}
                    >
                      View details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {bookingQuery.data ? (
        <TablePagination
          total={bookingQuery.data.total}
          currentPage={bookingQuery.data.current}
          pageSize={bookingQuery.data.limit}
          onChangePage={setPage}
          onChangePageSize={setPageSize}
        />
      ) : null}

      {/* Detail Dialog */}
      <BookingDetailDialog
        booking={selectedBooking}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
