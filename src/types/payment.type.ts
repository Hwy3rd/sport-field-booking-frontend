import { PaymentMethod, PaymentStatus } from "@/lib/constants/payment.constant";

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  txnRef: string;
  transactionNo?: string;
  bankCode?: string;
  payDate?: string;
  paymentInfo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentUrlRequest {
  bookingId: string;
}

export interface CreatePaymentUrlResponse {
  message: string;
  paymentUrl: string;
}
