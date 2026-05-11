export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message?: string;
  redirectUrl?: string;
}

export interface PaymentProvider {
  name: string;
  charge(amount: number, metadata?: Record<string, unknown>): Promise<PaymentResult>;
}
