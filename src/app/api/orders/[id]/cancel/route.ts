import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { sendNotification } from '@/lib/notifications';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { reason } = await req.json();
    const order = await prisma.order.findUnique({ where: { id: params.id } });
    
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (order.status !== 'PENDING' && order.status !== 'ACCEPTED') {
      return NextResponse.json({ error: 'Cannot cancel order at this stage' }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { 
        status: 'CANCELLED',
        statusHistory: { create: { status: 'CANCELLED', note: reason } }
      }
    });

    await sendNotification(order.userId, 'Order Cancelled', `Your order ${order.id} was cancelled.`);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}