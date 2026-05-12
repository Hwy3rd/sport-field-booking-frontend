"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { PaymentService } from "@/services/payment.service";
import { CreatePaymentUrlRequest } from "@/types/payment.type";
import { getErrorMessage } from "@/lib/helper/get-message";

export const useCreatePaymentUrl = () => {
  return useMutation({
    mutationFn: (payload: CreatePaymentUrlRequest) =>
      PaymentService.createPaymentUrl(payload),
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to generate payment URL"));
    },
  });
};
