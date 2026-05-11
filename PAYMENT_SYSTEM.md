# Payment System Documentation

## Overview

The payment system is built with an extensible provider pattern, making it easy to swap payment providers without changing the core checkout flow. Currently, it uses a **Fake Payment Provider** for testing.

## Architecture

### 1. Payment Provider Interface (`src/lib/payment/types.ts`)

The core abstraction for all payment providers:

```typescript
export interface PaymentProvider {
  name: string;
  charge(amount: number, metadata?: Record<string, unknown>): Promise<PaymentResult>;
}
```

Every payment provider must implement:

- `name`: Display name of the provider (e.g., "fake", "qr", "stripe")
- `charge()`: Process payment and return a `PaymentResult`

### 2. Fake Payment Provider (`src/lib/payment/fake-payment.provider.ts`)

A test implementation that simulates a payment flow by:

1. Generating a fake transaction ID: `FAKE-{timestamp}-{random}`
2. Building a payment URL with metadata: `https://fake-payment-gateway.local/pay?...`
3. Returning success with a redirect URL

**Use case**: Testing the checkout flow without a real payment gateway

### 3. Provider Factory (`src/app/(protected)/checkout/payment-provider.ts`)

Centralizes payment provider configuration. To switch providers, simply:

```typescript
// Current
export const paymentProvider: PaymentProvider = new FakePaymentProvider();

// To switch to QR Provider (when implemented)
// import { QRPaymentProvider } from "@/lib/payment/qr-payment.provider";
// export const paymentProvider: PaymentProvider = new QRPaymentProvider();
```

The rest of the application uses `paymentProvider` without knowing the implementation.

### 4. Checkout Hook (`src/hooks/useCheckout.ts`)

Manages the entire checkout flow:

- **Validates** cart items and authentication
- **Calculates** order summary (subtotal, tax, total)
- **Processes payment** via the payment provider
- **Creates booking** via API (on success)
- **Clears cart** and redirects to booking history

Key functions:

- `calculateSummary()`: Computes totals and item counts
- `processPayment()`: Main payment flow orchestration
- `continueShopping()`: Navigate back to home

### 5. Checkout Page (`src/app/(protected)/checkout/page.tsx`)

The UI component that:

- Displays cart items grouped by court
- Shows item details (date, time slots, price breakdown)
- Renders order summary with taxes
- Provides "Proceed to Payment" and "Continue Shopping" buttons
- Handles empty cart state

## Payment Flow

```
User clicks "Proceed to Checkout" in Cart
            ↓
    [Checkout Page]
    - Display cart items
    - Show order summary
    - User clicks "Pay"
            ↓
    [useCheckout Hook]
    - Validate cart & auth
    - Calculate totals
    - Call paymentProvider.charge()
            ↓
    [Payment Provider]
    - Simulate/process payment
    - Return transaction ID & redirect URL
            ↓
    [Checkout Hook continues]
    - POST booking to API (/booking)
    - Clear cart
    - Redirect to bookings page
```

## How to Integrate a New Payment Provider

### Step 1: Create the Provider Class

Create `src/lib/payment/qr-payment.provider.ts`:

```typescript
import { PaymentProvider, PaymentResult } from "./types";

export class QRPaymentProvider implements PaymentProvider {
  readonly name = "qr";
  private readonly qrPaymentUrl = "https://your-qr-provider.com/api/pay";

  async charge(amount: number, metadata?: Record<string, unknown>): Promise<PaymentResult> {
    try {
      // Call QR payment API
      const response = await fetch(this.qrPaymentUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          metadata,
          // Add QR-specific fields (merchant ID, terminal ID, etc.)
        }),
      });

      const data = await response.json();

      if (!data.success) {
        return { success: false, message: data.error };
      }

      return {
        success: true,
        transactionId: data.transactionId,
        redirectUrl: data.qrUrl, // QR code or payment page
        message: "QR payment initiated",
      };
    } catch (error) {
      return {
        success: false,
        message: `QR payment failed: ${error.message}`,
      };
    }
  }
}
```

### Step 2: Update the Provider Factory

Edit `src/app/(protected)/checkout/payment-provider.ts`:

```typescript
import { QRPaymentProvider } from "@/lib/payment/qr-payment.provider";
import type { PaymentProvider } from "@/lib/payment/types";

export const paymentProvider: PaymentProvider = new QRPaymentProvider();
```

### Step 3: Test

The checkout page and hook will automatically use the new provider with **zero other changes**.

## Configuration

### Environment Variables (Optional)

If your payment provider needs API keys, add to `.env.local`:

```bash
# Fake Payment (testing)
NEXT_PUBLIC_FAKE_PAYMENT_URL=https://fake-payment-gateway.local/pay

# QR Payment (future)
NEXT_PUBLIC_QR_API_KEY=your_api_key
QR_PAYMENT_SECRET=your_secret
```

Then update the provider:

```typescript
export class QRPaymentProvider implements PaymentProvider {
  private readonly apiKey = process.env.NEXT_PUBLIC_QR_API_KEY;
  private readonly secret = process.env.QR_PAYMENT_SECRET;

  async charge(amount: number, metadata?: Record<string, unknown>): Promise<PaymentResult> {
    // Use apiKey and secret
  }
}
```

## Testing

### 1. Test Fake Payment Locally

```bash
npm run dev
# Visit http://localhost:3000
# Add court to cart
# Click "Proceed to Checkout"
# Click "Proceed to Payment"
# Should redirect to: https://fake-payment-gateway.local/pay?amount=...
```

### 2. Test Payment Validation

The `useCheckout` hook validates:

- ✓ Cart is not empty
- ✓ User is authenticated
- ✓ Payment provider returns success
- ✓ API booking creation succeeds

## API Integration

The checkout hook integrates with:

- **POST `/booking`**: Create booking with time slot IDs
  - Request: `{ timeSlotIds: UUID[] }`
  - Response: `{ id, items, totalPrice, status, ... }`

The booking is created with all selected time slots across all dates in the cart.

## Future Enhancements

- [ ] **Payment Webhooks**: Handle async payment confirmation (e.g., QR code scanned)
- [ ] **Payment History**: Track transaction IDs and payment status
- [ ] **Refunds**: Support partial/full refunds via provider
- [ ] **Multi-Currency**: Support different currencies per provider
- [ ] **Payment Analytics**: Log payment attempts, success/failure rates
- [ ] **Error Recovery**: Retry logic for failed payments
- [ ] **Idempotency**: Prevent duplicate bookings on payment retry

## Troubleshooting

| Issue                             | Solution                                           |
| --------------------------------- | -------------------------------------------------- |
| "Giỏ hàng trống" on checkout      | Add courts to cart first                           |
| "Vui lòng đăng nhập"              | Login before checkout                              |
| Payment fails silently            | Check browser console for error messages           |
| Booking not created after payment | Verify API response and cart data                  |
| Time slots missing from booking   | Ensure all slots are present in cart before paying |

## File Structure

```
src/
├── app/(protected)/
│   └── checkout/
│       ├── page.tsx          # Checkout UI
│       └── payment-provider.ts  # Provider factory
├── hooks/
│   └── useCheckout.ts         # Checkout logic
├── lib/
│   └── payment/
│       ├── types.ts           # PaymentProvider interface
│       ├── fake-payment.provider.ts  # Test provider
│       └── qr-payment.provider.ts    # (Future) QR provider
└── components/
    └── shared/
        └── cart-sheet.tsx     # Cart with checkout button
```
