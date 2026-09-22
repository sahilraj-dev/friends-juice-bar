import prisma from './db';
import { emitNotification } from './events';

export async function createNotification({
  userId,
  title,
  body,
  type = 'INFO',
  data = {},
}: {
  userId: string;
  title: string;
  body: string;
  type?: string;
  data?: Record<string, unknown>;
}) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      body,
      type,
      data: JSON.stringify(data),
    },
  });

  // Push via SSE
  emitNotification(userId, {
    id: notification.id,
    title,
    body,
    type,
    data,
    createdAt: notification.createdAt,
  });

  return notification;
}

// Pre-defined notification templates for order events
export async function notifyOrderPlaced(userId: string, orderNumber: number) {
  return createNotification({
    userId,
    title: 'Order Placed! 🎉',
    body: `Your order #${orderNumber} has been placed successfully.`,
    type: 'ORDER',
    data: { orderNumber, event: 'placed' },
  });
}

export async function notifyOrderAccepted(userId: string, orderNumber: number) {
  return createNotification({
    userId,
    title: 'Order Accepted! ✅',
    body: `Your order #${orderNumber} has been accepted and will be prepared soon.`,
    type: 'ORDER',
    data: { orderNumber, event: 'accepted' },
  });
}

export async function notifyOrderRejected(userId: string, orderNumber: number, reason?: string) {
  return createNotification({
    userId,
    title: 'Order Rejected 😔',
    body: `Your order #${orderNumber} was rejected.${reason ? ` Reason: ${reason}` : ''}`,
    type: 'ORDER',
    data: { orderNumber, event: 'rejected' },
  });
}

export async function notifyOrderPreparing(userId: string, orderNumber: number) {
  return createNotification({
    userId,
    title: 'Preparing Your Order 👨‍🍳',
    body: `Your order #${orderNumber} is being prepared with love!`,
    type: 'ORDER',
    data: { orderNumber, event: 'preparing' },
  });
}

export async function notifyOrderReady(userId: string, orderNumber: number, location?: string) {
  return createNotification({
    userId,
    title: 'Order Ready! 🥤',
    body: `Your order #${orderNumber} is ready!${location ? ` It will be delivered to ${location} shortly.` : ''}`,
    type: 'ORDER',
    data: { orderNumber, event: 'ready' },
  });
}

export async function notifyOutForDelivery(userId: string, orderNumber: number) {
  return createNotification({
    userId,
    title: 'On the Way! 🚴',
    body: `Your order #${orderNumber} is on its way to you!`,
    type: 'ORDER',
    data: { orderNumber, event: 'out_for_delivery' },
  });
}

export async function notifyOrderDelivered(userId: string, orderNumber: number) {
  return createNotification({
    userId,
    title: 'Delivered! ✨',
    body: `Your order #${orderNumber} has been delivered. Enjoy! Don't forget to leave a review.`,
    type: 'ORDER',
    data: { orderNumber, event: 'delivered' },
  });
}

export async function notifyOrderCancelled(userId: string, orderNumber: number, reason?: string) {
  return createNotification({
    userId,
    title: 'Order Cancelled',
    body: `Your order #${orderNumber} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
    type: 'ORDER',
    data: { orderNumber, event: 'cancelled' },
  });
}

export async function notifyVendorNewOrder(vendorUserId: string, orderNumber: number, total: number) {
  return createNotification({
    userId: vendorUserId,
    title: '🔔 New Order!',
    body: `New order #${orderNumber} — ₹${total.toFixed(0)}`,
    type: 'ORDER',
    data: { orderNumber, event: 'new_order' },
  });
}

export async function notifyPaymentSuccess(userId: string, orderNumber: number, amount: number) {
  return createNotification({
    userId,
    title: 'Payment Successful 💰',
    body: `Payment of ₹${amount.toFixed(0)} for order #${orderNumber} was successful.`,
    type: 'PAYMENT',
    data: { orderNumber, amount, event: 'payment_success' },
  });
}

// Simple alias used by API routes
export async function sendNotification(userId: string, title: string, body: string) {
  return createNotification({ userId, title, body, type: 'ORDER' });
}
