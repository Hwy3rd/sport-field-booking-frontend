"use client";

import { FakePaymentProvider } from "@/lib/payment/fake-payment.provider";
import type { PaymentProvider } from "@/lib/payment/types";

/**
 * Payment Provider Factory
 *
 * This file centralizes payment provider configuration.
 * To switch to a different payment provider:
 *
 * 1. Import the new provider:
 *    import { QRPaymentProvider } from "@/lib/payment/qr-payment.provider";
 *
 * 2. Replace the export:
 *    export const paymentProvider = new QRPaymentProvider();
 *
 * The rest of the checkout flow remains unchanged.
 */
export const paymentProvider: PaymentProvider = new FakePaymentProvider();
