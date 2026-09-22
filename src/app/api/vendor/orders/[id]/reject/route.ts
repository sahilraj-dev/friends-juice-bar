import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { sendNotification } from '@/lib/notifications';
import { canTransitionTo } from '@/lib/utils';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { reason } = await req.json();
    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!canTransitionTo(order.status, 'REJECTED')) return NextResponse.json({ error: 'Invalid transition' }, { status: 400 });

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        statusHistory: { create: { status: 'REJECTED', note: reason } }
      }
    });

    await sendNotification(order.userId, 'Order Rejected', `Reason: ${reason}`);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}