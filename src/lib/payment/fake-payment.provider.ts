"use client";

import { PaymentProvider, PaymentResult } from "./types";

/**
 * Fake Payment Provider for testing
 * Simulates a payment flow by redirecting to a fake payment URL
 *
 * To implement a real payment provider (e.g., QR payment):
 * 1. Create a new file: `src/lib/payment/qr-payment.provider.ts`
 * 2. Implement the PaymentProvider interface
 * 3. Update `src/app/(protected)/checkout/payment-provider.ts` to export the new provider
 *
 * Example:
 * ```typescript
 * export const paymentProvider = new QRPaymentProvider();
 * ```
 */
export class FakePaymentProvider implements PaymentProvider {
  readonly name = "fake";
  private readonly fakePaymentUrl = "https://fake-payment-gateway.local/pay";

  async charge(amount: number, metadata?: Record<string, unknown>): Promise<PaymentResult> {
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate a fake transaction ID
    const transactionId = `FAKE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Build payment URL with metadata
    const params = new URLSearchParams({
      amount: amount.toString(),
      transactionId,
      timestamp: new Date().toISOString(),
      ...(metadata && { metadata: JSON.stringify(metadata) }),
    });

    const redirectUrl = `${this.fakePaymentUrl}?${params.toString()}`;

    return {
      success: true,
      transactionId,
      redirectUrl,
      message: "Fake payment initiated",
    };
  }
}
