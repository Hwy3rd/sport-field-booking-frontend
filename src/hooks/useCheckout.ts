"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { useCartStore } from "@/stores/cart.store";
import { useAuth } from "@/hooks/useAuth";
import { BookingService } from "@/services/booking.service";
import { ROUTES } from "@/lib/constants/routes.constant";
import { getErrorMessage } from "@/lib/helper/get-message";
import { useCreatePaymentUrl } from "./usePayment";

export interface CheckoutSummary {
  totalCourts: number;
  totalSlots: number;
  subtotal: number;
  tax: number;
  total: number;
}

export const useCheckout = () => {
  const router = useRouter();
  const { items: cartItems } = useCartStore();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const createPaymentUrlMutation = useCreatePaymentUrl();

  const calculateSummary = (): CheckoutSummary => {
    const subtotal = cartItems.reduce((sum, item) => {
      const itemTotal = item.timeSlots.reduce((slotSum, slot) => {
        return slotSum + slot.price;
      }, 0);
      return sum + itemTotal;
    }, 0);

    const tax = 0;
    const total = subtotal;
    const totalSlots = cartItems.reduce((sum, item) => sum + item.timeSlots.length, 0);

    return {
      totalCourts: cartItems.length,
      totalSlots,
      subtotal,
      tax,
      total,
    };
  };

  const processPayment = async () => {
    if (cartItems.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    if (!user) {
      toast.error("Vui lòng đăng nhập");
      router.push(ROUTES.LOGIN);
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create booking with all selected time slots
      const timeSlotIds = cartItems.flatMap((item) => item.timeSlots.map((slot) => slot.id));

      const booking = await BookingService.createBooking({
        timeSlotIds,
      });

      if (!booking || !booking.id) {
        throw new Error("Không thể tạo yêu cầu đặt sân");
      }

      // Step 2: Generate VNPAY Payment URL
      const { paymentUrl } = await createPaymentUrlMutation.mutateAsync({
        bookingId: booking.id,
      });

      if (!paymentUrl) {
        throw new Error("Không thể khởi tạo liên kết thanh toán");
      }

      toast.info("Đang chuyển hướng tới cổng thanh toán VNPAY...");

      // Step 3: Redirect user to VNPAY
      window.location.href = paymentUrl;
    } catch (error) {
      const message = getErrorMessage(error, "Có lỗi xảy ra khi xử lý thanh toán");
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const continueShopping = () => {
    router.push(ROUTES.HOME);
  };

  return {
    cartItems,
    calculateSummary,
    processPayment,
    continueShopping,
    isProcessing: isProcessing || createPaymentUrlMutation.isPending,
  };
};
