"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart } from "lucide-react";

import { useCheckout } from "@/hooks/useCheckout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants/routes.constant";
import { formatHoldTime } from "@/lib/helper/date";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cartItems, calculateSummary, processPayment, continueShopping, isProcessing } =
    useCheckout();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (cartItems.length === 0) {
    return (
      <div className="from-background to-muted/50 flex min-h-screen items-center justify-center bg-gradient-to-b px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <ShoppingCart className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h2 className="mb-2 text-lg font-semibold">Giỏ hàng trống</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Vui lòng thêm sân vào giỏ hàng trước khi tiếp tục
          </p>
          <Button onClick={continueShopping} className="w-full">
            Tiếp tục mua sắm
          </Button>
        </Card>
      </div>
    );
  }

  const summary = calculateSummary();
  const now = Date.now();

  return (
    <div className="from-background to-muted/50 min-h-screen bg-gradient-to-b px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4 -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Thanh toán</h1>
          <p className="text-muted-foreground mt-2">Xác nhận và hoàn thành đơn hàng của bạn</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {cartItems.map((item) => (
              <Card key={item.court.id} className="p-6 transition-shadow hover:shadow-md">
                {/* Court Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{item.court.name}</h3>
                    <p className="text-muted-foreground text-sm">
                      {item.court.venue?.name || "Venue"}
                    </p>
                  </div>
                  <Badge variant="outline" className="whitespace-nowrap">
                    {item.timeSlots.length} khung giờ
                  </Badge>
                </div>

                {/* Date Info */}
                <div className="bg-muted/50 mb-4 rounded-lg p-3">
                  <p className="text-sm font-medium">Ngày: {item.selectedDate}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Giữ chỗ còn: {formatHoldTime(item.createdAt, item.holdMinutes, now)}
                  </p>
                </div>

                {/* Time Slots */}
                <div className="mb-4 space-y-2">
                  <p className="text-sm font-medium">Khung giờ:</p>
                  <div className="flex flex-wrap gap-2">
                    {item.timeSlots.map((slot) => (
                      <div key={slot.id} className="bg-primary/10 rounded px-2 py-1 text-xs">
                        <span className="font-medium">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          ({slot.price.toLocaleString()} VND)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Tổng tiền:</span>
                    <span className="font-semibold">
                      {(
                        item.timeSlots.reduce((sum, slot) => sum + slot.price, 0) || 0
                      ).toLocaleString()}{" "}
                      VND
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Summary & Payment */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 p-6 shadow-lg">
              <h2 className="mb-6 text-lg font-semibold">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sân:</span>
                  <span>{summary.totalCourts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Khung giờ:</span>
                  <span>{summary.totalSlots}</span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tiền hàng:</span>
                  <span>{summary.subtotal.toLocaleString()} VND</span>
                </div>
                {summary.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thuế:</span>
                    <span>{summary.tax.toLocaleString()} VND</span>
                  </div>
                )}

                <Separator className="my-3" />

                <div className="flex justify-between text-base font-semibold">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{summary.total.toLocaleString()} VND</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3">
                <Button
                  onClick={processPayment}
                  disabled={isProcessing || cartItems.length === 0}
                  size="lg"
                  className="w-full"
                >
                  {isProcessing ? "Đang xử lý..." : "Thanh toán ngay"}
                </Button>

                <Button
                  onClick={continueShopping}
                  variant="outline"
                  size="lg"
                  disabled={isProcessing}
                  className="w-full"
                >
                  Tiếp tục mua sắm
                </Button>
              </div>

              <div className="mt-6 rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  ✓ Thanh toán an toàn với cổng thanh toán được mã hóa
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
