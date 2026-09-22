import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { sendNotification } from '@/lib/notifications';
import { canTransitionTo } from '@/lib/utils';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const order = await prisma.order.findUnique({ where: { id: params.id }, include: { payments: true } });
    if (!order || !canTransitionTo(order.status, 'DELIVERED')) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { 
        status: 'DELIVERED', 
        statusHistory: { create: { status: 'DELIVERED' } }
      }
    });

    if (order.paymentMethod === 'CASH' && order.payments && order.payments.length > 0) {
      await prisma.payment.update({
        where: { id: order.payments[0].id },
        data: { status: 'COMPLETED' }
      });
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'COMPLETED' }
      });
    }

    await sendNotification(order.userId, 'Order Delivered', 'Enjoy your food!');
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}