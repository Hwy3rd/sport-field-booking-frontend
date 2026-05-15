"use client";

import dayjs from "dayjs";
import { Clock, MapPin, Tag } from "lucide-react";

import type { Booking } from "@/types/booking.type";
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
import { Separator } from "@/components/ui/separator";
import { useCreatePaymentUrl } from "@/hooks/usePayment";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";
import { useCancelBooking, useRefundBooking, useBookingDetail } from "@/hooks/useBooking";
import { useState } from "react";
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
import { Info } from "lucide-react";
import { BOOKING_STATUS } from "@/lib/constants/booking.constant";

interface BookingDetailDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDetailDialog({ booking: initialBooking, open, onOpenChange }: BookingDetailDialogProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);

  const cancelBookingMutation = useCancelBooking();
  const refundBookingMutation = useRefundBooking();
  const createPaymentUrlMutation = useCreatePaymentUrl();

  // Nạp động dữ liệu chi tiết sâu (bao gồm items, timeSlot, court, venue) khi mở dialog
  const { data: detailedBooking, isLoading: isLoadingDetail } = useBookingDetail(
    initialBooking?.id || "",
    !!initialBooking?.id && open
  );

  // Tự động chuyển sang dữ liệu chi tiết đầy đủ ngay khi nạp xong
  const booking = detailedBooking || initialBooking;

  if (!booking) return null;

  // Tính toán mốc 24h trước giờ chơi
  const now = dayjs();
  let minPlayTime: any = null;

  if (booking.items && booking.items.length > 0) {
    booking.items.forEach((item) => {
      const exactTime = dayjs(`${item.slotDate}T${item.startTime}`);
      if (!minPlayTime || exactTime.isBefore(minPlayTime)) {
        minPlayTime = exactTime;
      }
    });
  }

  const hoursUntilPlay = minPlayTime ? minPlayTime.diff(now, "hour", true) : 0;
  const isRefundable = hoursUntilPlay >= 24;

  const handleCancelBooking = async () => {
    try {
      await cancelBookingMutation.mutateAsync(booking.id);
      setShowCancelConfirm(false);
      onOpenChange(false);
    } catch (error) {
      // handled
    }
  };

  const handleRefundBooking = async () => {
    try {
      await refundBookingMutation.mutateAsync(booking.id);
      setShowRefundConfirm(false);
      onOpenChange(false);
    } catch (error) {
      // handled
    }
  };

  const handlePayNow = async () => {
    try {
      const { paymentUrl } = await createPaymentUrlMutation.mutateAsync({
        bookingId: booking.id,
      });
      
      if (paymentUrl) {
        toast.info("Redirecting to payment gateway...");
        window.location.href = paymentUrl;
      } else {
        toast.error("Could not generate payment link");
      }
    } catch (error) {
      // handled in hook onError but standard check
    }
  };

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
            <h3 className="mb-4 font-semibold">Booking Items ({booking.items?.length || 0})</h3>
            
            {isLoadingDetail && !detailedBooking ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3 border border-dashed rounded-lg bg-muted/30">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground font-medium">
                  Đang tải thông tin sân chi tiết...
                </p>
              </div>
            ) : (
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
          )}
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

        {(booking.status === BOOKING_STATUS.PENDING || booking.status === BOOKING_STATUS.CONFIRMED) && (
          <>
            <Separator className="my-2" />
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
              {/* Left/Warning message */}
              <div className="text-xs text-muted-foreground max-w-md">
                {booking.status === BOOKING_STATUS.CONFIRMED && !isRefundable && (
                  <span className="text-destructive flex items-center gap-1.5 font-medium bg-destructive/10 p-2 rounded-lg">
                    <Info className="h-4 w-4 shrink-0" />
                    Không thể hoàn tiền do trận đấu diễn ra dưới 24h nữa.
                  </span>
                )}
                {booking.status === BOOKING_STATUS.CONFIRMED && isRefundable && (
                  <span className="text-emerald-600 flex items-center gap-1.5 font-medium bg-emerald-50 dark:bg-emerald-950/50 p-2 rounded-lg">
                    <Info className="h-4 w-4 shrink-0" />
                    Đủ điều kiện hủy & nhận lại 100% tiền hoàn trả.
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                {booking.status === BOOKING_STATUS.PENDING && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowCancelConfirm(true)}
                      disabled={cancelBookingMutation.isPending}
                      className="flex-1 sm:flex-initial text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                    >
                      Hủy Đặt Sân
                    </Button>
                    <Button
                      onClick={handlePayNow}
                      disabled={createPaymentUrlMutation.isPending}
                      className="flex-1 sm:flex-initial gap-2"
                    >
                      {createPaymentUrlMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4" />
                      )}
                      Thanh Toán Ngay
                    </Button>
                  </>
                )}

                {booking.status === BOOKING_STATUS.CONFIRMED && (
                  <Button
                    variant="destructive"
                    disabled={!isRefundable || refundBookingMutation.isPending}
                    onClick={() => setShowRefundConfirm(true)}
                    className="w-full sm:w-auto gap-2 font-medium shadow-sm"
                  >
                    {refundBookingMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Hủy & Hoàn Tiền
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Hộp thoại xác nhận hủy PENDING */}
        <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận hủy đặt sân?</AlertDialogTitle>
              <AlertDialogDescription>
                Hành động này không thể khôi phục. Toàn bộ các khung giờ đã chọn sẽ được giải phóng ngay lập tức cho người dùng khác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Đóng</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleCancelBooking}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Xác nhận Hủy
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Hộp thoại xác nhận hủy CONFIRMED + REFUND */}
        <AlertDialog open={showRefundConfirm} onOpenChange={setShowRefundConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận hủy và hoàn 100% tiền?</AlertDialogTitle>
              <AlertDialogDescription>
                Chúng tôi sẽ gửi yêu cầu hoàn trả 100% số tiền qua cổng VNPay. Giao dịch hoàn tất sẽ tự động giải phóng các sân đã đặt. Quá trình nhận lại tiền tùy thuộc vào ngân hàng của bạn.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleRefundBooking}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {refundBookingMutation.isPending ? "Đang gửi yêu cầu..." : "Xác nhận Hoàn tiền"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
