const fs = require('fs');
const path = require('path');

const files = {
  "src/app/api/vendor/orders/[id]/ready/route.ts": `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { sendNotification } from '@/lib/notifications';
import { canTransitionTo } from '@/lib/utils';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order || !canTransitionTo(order.status, 'READY')) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { status: 'READY', statusHistory: { create: { status: 'READY' } } }
    });
    await sendNotification(order.userId, 'Order Ready', 'Your order is ready');
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`,

  "src/app/api/vendor/orders/[id]/out-for-delivery/route.ts": `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { sendNotification } from '@/lib/notifications';
import { canTransitionTo } from '@/lib/utils';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order || !canTransitionTo(order.status, 'OUT_FOR_DELIVERY')) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { status: 'OUT_FOR_DELIVERY', statusHistory: { create: { status: 'OUT_FOR_DELIVERY' } } }
    });
    await sendNotification(order.userId, 'Out for Delivery', 'Your order is on the way');
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`,

  "src/app/api/vendor/orders/[id]/delivered/route.ts": `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { sendNotification } from '@/lib/notifications';
import { canTransitionTo } from '@/lib/utils';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const order = await prisma.order.findUnique({ where: { id: params.id }, include: { payment: true } });
    if (!order || !canTransitionTo(order.status, 'DELIVERED')) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { 
        status: 'DELIVERED', 
        statusHistory: { create: { status: 'DELIVERED' } }
      }
    });

    if (order.paymentMethod === 'CASH' && order.payment) {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: { status: 'COMPLETED' }
      });
    }

    await sendNotification(order.userId, 'Order Delivered', 'Enjoy your food!');
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`,

  "src/app/api/coupons/validate/route.ts": `import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { code, cartTotal } = await req.json();
    if (!code || cartTotal === undefined) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon || !coupon.isActive) return NextResponse.json({ error: 'Invalid coupon' }, { status: 400 });
    
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ error: 'Coupon expired' }, { status: 400 });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'Usage limit reached' }, { status: 400 });
    }
    if (coupon.minOrder && cartTotal < coupon.minOrder) {
      return NextResponse.json({ error: \`Minimum order amount is \${coupon.minOrder}\` }, { status: 400 });
    }

    return NextResponse.json(coupon);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`,

  "src/app/api/vendor/coupons/route.ts": `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const coupons = await prisma.coupon.findMany();
    return NextResponse.json(coupons);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const data = await req.json();
    const coupon = await prisma.coupon.create({ data });
    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`,

  "src/app/api/vendor/coupons/[id]/route.ts": `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const data = await req.json();
    const coupon = await prisma.coupon.update({ where: { id: params.id }, data });
    return NextResponse.json(coupon);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.coupon.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`,

  "src/app/api/favorites/route.ts": `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: { product: true }
    });
    return NextResponse.json(favorites);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    
    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

    const existing = await prisma.favorite.findFirst({ where: { userId: user.id, productId } });
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ status: 'removed' });
    }

    const favorite = await prisma.favorite.create({ data: { userId: user.id, productId } });
    return NextResponse.json({ status: 'added', favorite }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`,

  "src/app/api/favorites/[id]/route.ts": `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    await prisma.favorite.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`,

  "src/app/api/notifications/route.ts": `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`,

  "src/app/api/notifications/[id]/read/route.ts": `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const notification = await prisma.notification.update({
      where: { id: params.id },
      data: { isRead: true }
    });
    return NextResponse.json(notification);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`,

  "src/app/api/notifications/read-all/route.ts": `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`,

  "src/app/api/events/orders/route.ts": `import { NextResponse } from 'next/server';
import { eventEmitter } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      const onNewOrder = (order: any) => {
        controller.enqueue(encoder.encode(\`data: \${JSON.stringify(order)}\\n\\n\`));
      };
      
      eventEmitter.on('new_order', onNewOrder);
      
      const interval = setInterval(() => {
        controller.enqueue(encoder.encode(': keepalive\\n\\n'));
      }, 30000);
      
      return () => {
        clearInterval(interval);
        eventEmitter.off('new_order', onNewOrder);
      };
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
}`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join('z:/WORK/FriendsJuiceBar', filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('Batch 2 done');
