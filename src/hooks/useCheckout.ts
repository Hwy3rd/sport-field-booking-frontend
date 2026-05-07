"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { useCartStore } from "@/stores/cart.store";
import { useAuth } from "@/hooks/useAuth";
import { paymentProvider } from "@/app/(protected)/checkout/payment-provider";
import { BookingService } from "@/services/booking.service";
import { ROUTES } from "@/lib/constants/routes.constant";
import { getErrorMessage } from "@/lib/helper/get-message";

export interface CheckoutSummary {
  totalCourts: number;
  totalSlots: number;
  subtotal: number;
  tax: number;
  total: number;
}

export const useCheckout = () => {
  const router = useRouter();
  const { items: cartItems, clearCart } = useCartStore();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateSummary = (): CheckoutSummary => {
    const subtotal = cartItems.reduce((sum, item) => {
      const itemTotal = item.timeSlots.reduce((slotSum, slot) => {
        const hours =
          (new Date(`1970-01-01T${slot.endTime}:00`) as any) -
          (new Date(`1970-01-01T${slot.startTime}:00`) as any);
        const durationHours = hours / (1000 * 60 * 60);
        return slotSum + durationHours * item.court.pricePerHour;
      }, 0);
      return sum + itemTotal;
    }, 0);

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    const totalSlots = cartItems.reduce((sum, item) => sum + item.timeSlots.length, 0);

    return {
      totalCourts: cartItems.length,
      totalSlots,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
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
      const summary = calculateSummary();

      // Step 1: Process payment
      const paymentResult = await paymentProvider.charge(summary.total, {
        userId: user.id,
        totalItems: cartItems.length,
        totalSlots: summary.totalSlots,
      });

      if (!paymentResult.success) {
        throw new Error(paymentResult.message || "Thanh toán thất bại");
      }

      toast.success("Thanh toán thành công!");

      // Step 2: Create booking with all selected time slots
      const timeSlotIds = cartItems.flatMap((item) => item.timeSlots.map((slot) => slot.id));

      const booking = await BookingService.createBooking({
        timeSlotIds,
      });

      if (!booking) {
        throw new Error("Không thể tạo đặt phòng");
      }

      // Step 3: Clear cart and redirect
      clearCart();
      toast.success("Đặt phòng thành công!");
      router.push(ROUTES.PROFILE_BOOKINGS);
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
    isProcessing,
  };
};
