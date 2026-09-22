// Server-Sent Events (SSE) for real-time order updates
// This module manages SSE connections for both customer and vendor

type SSEClient = {
  id: string;
  userId: string;
  role: string;
  controller: ReadableStreamDefaultController;
};

class EventEmitter {
  private clients: Map<string, SSEClient> = new Map();

  addClient(client: SSEClient) {
    this.clients.set(client.id, client);
  }

  removeClient(id: string) {
    this.clients.delete(id);
  }

  // Send event to a specific user
  sendToUser(userId: string, event: string, data: unknown) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach((client) => {
      if (client.userId === userId) {
        try {
          client.controller.enqueue(new TextEncoder().encode(message));
        } catch {
          this.removeClient(client.id);
        }
      }
    });
  }

  // Send event to all vendors
  sendToVendors(event: string, data: unknown) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach((client) => {
      if (client.role === 'VENDOR' || client.role === 'ADMIN') {
        try {
          client.controller.enqueue(new TextEncoder().encode(message));
        } catch {
          this.removeClient(client.id);
        }
      }
    });
  }

  // Send event to all admins
  sendToAdmins(event: string, data: unknown) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach((client) => {
      if (client.role === 'ADMIN') {
        try {
          client.controller.enqueue(new TextEncoder().encode(message));
        } catch {
          this.removeClient(client.id);
        }
      }
    });
  }

  // Broadcast to all connected clients
  broadcast(event: string, data: unknown) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach((client) => {
      try {
        client.controller.enqueue(new TextEncoder().encode(message));
      } catch {
        this.removeClient(client.id);
      }
    });
  }

  getClientCount(): number {
    return this.clients.size;
  }
}

// Global singleton
const globalForEvents = globalThis as unknown as { eventEmitter: EventEmitter };

export const eventEmitter =
  globalForEvents.eventEmitter || new EventEmitter();

if (process.env.NODE_ENV !== 'production') {
  globalForEvents.eventEmitter = eventEmitter;
}

// Event types
export const EVENTS = {
  ORDER_CREATED: 'order.created',
  ORDER_ACCEPTED: 'order.accepted',
  ORDER_REJECTED: 'order.rejected',
  ORDER_PREPARING: 'order.preparing',
  ORDER_READY: 'order.ready',
  ORDER_OUT_FOR_DELIVERY: 'order.out_for_delivery',
  ORDER_DELIVERED: 'order.delivered',
  ORDER_CANCELLED: 'order.cancelled',
  PAYMENT_UPDATED: 'payment.updated',
  NOTIFICATION: 'notification',
  STORE_STATUS: 'store.status',
} as const;

// Helper: emit order status change
export function emitOrderUpdate(
  orderId: string,
  status: string,
  customerId: string,
  orderData?: unknown
) {
  const eventName = `order.${status.toLowerCase()}`;
  const payload = { orderId, status, ...((orderData as object) || {}) };

  // Notify the customer
  eventEmitter.sendToUser(customerId, eventName, payload);

  // Notify vendors
  eventEmitter.sendToVendors(eventName, payload);
}

// Helper: emit new order to vendor
export function emitNewOrder(orderData: unknown) {
  eventEmitter.sendToVendors(EVENTS.ORDER_CREATED, orderData);
}

// Helper: emit notification
export function emitNotification(userId: string, notification: unknown) {
  eventEmitter.sendToUser(userId, EVENTS.NOTIFICATION, notification);
}
