// Payment gateway abstraction layer
// In development: simulated gateway
// In production: plug in Razorpay/Stripe/PayU

export type PaymentRequest = {
  orderId: string;
  amount: number;
  method: 'UPI' | 'ONLINE' | 'CASH';
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
};

export type PaymentResponse = {
  success: boolean;
  transactionId: string | null;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  gatewayResponse: string;
  message: string;
};

export async function processPayment(request: PaymentRequest): Promise<PaymentResponse> {
  // Cash payments are always "successful" — collected on delivery
  if (request.method === 'CASH') {
    return {
      success: true,
      transactionId: `CASH-${Date.now()}`,
      status: 'PENDING', // Will be marked COMPLETED on delivery
      gatewayResponse: JSON.stringify({ method: 'CASH', note: 'Collect on delivery' }),
      message: 'Cash on delivery — collect payment at delivery point',
    };
  }

  // In development: simulate payment gateway
  if (process.env.NODE_ENV === 'development') {
    return simulatePayment(request);
  }

  // In production: integrate with real gateway
  // TODO: Replace with Razorpay/Stripe integration
  return simulatePayment(request);
}

async function simulatePayment(request: PaymentRequest): Promise<PaymentResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate 95% success rate in dev
  const isSuccess = Math.random() > 0.05;

  if (isSuccess) {
    const txnId = `TXN-${request.method}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    return {
      success: true,
      transactionId: txnId,
      status: 'COMPLETED',
      gatewayResponse: JSON.stringify({
        method: request.method,
        amount: request.amount,
        timestamp: new Date().toISOString(),
        simulated: true,
      }),
      message: 'Payment successful',
    };
  }

  return {
    success: false,
    transactionId: null,
    status: 'FAILED',
    gatewayResponse: JSON.stringify({
      error: 'PAYMENT_DECLINED',
      simulated: true,
    }),
    message: 'Payment failed. Please try again.',
  };
}

export async function processRefund(
  transactionId: string,
  amount: number,
  reason: string
): Promise<{
  success: boolean;
  refundTransactionId: string | null;
  message: string;
}> {
  // In development: simulate refund
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    refundTransactionId: `REFUND-${Date.now()}`,
    message: `Refund of ₹${amount} processed successfully. Reason: ${reason}`,
  };
}

// Razorpay integration placeholder
/*
export async function createRazorpayOrder(amount: number, orderId: string) {
  const Razorpay = require('razorpay');
  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  return instance.orders.create({
    amount: amount * 100, // paise
    currency: 'INR',
    receipt: orderId,
  });
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const crypto = require('crypto');
  const generated = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return generated === signature;
}
*/
