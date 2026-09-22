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
}