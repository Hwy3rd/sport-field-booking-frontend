import api from "@/lib/api/axios";
import { ApiResponse } from "@/types/api.type";
import { CreatePaymentUrlRequest, CreatePaymentUrlResponse } from "@/types/payment.type";

export const PaymentService = {
  createPaymentUrl: async (
    requestPayload: CreatePaymentUrlRequest,
  ): Promise<CreatePaymentUrlResponse> => {
    const { data } = await api.post<ApiResponse<CreatePaymentUrlResponse>>(
      "/payment/create-url",
      requestPayload,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to create payment URL");
    }

    return data.data;
  },

  refundBooking: async (bookingId: string): Promise<void> => {
    const { data } = await api.post<ApiResponse<void>>(`/payment/booking/${bookingId}/refund`);
    
    if (!data.success) {
      throw new Error(data.message || "Không thể gửi yêu cầu hoàn tiền");
    }
  },
};
