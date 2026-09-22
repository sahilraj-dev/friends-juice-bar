import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const { foodRating, packagingRating, deliveryRating, comment } = await req.json();
    const order = await prisma.order.findUnique({ where: { id: params.id } });
    
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (order.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (order.status !== 'DELIVERED') return NextResponse.json({ error: 'Order not delivered yet' }, { status: 400 });

    const review = await prisma.review.create({
      data: {
        orderId: order.id,
        userId: user.id,
        foodRating,
        packagingRating,
        deliveryRating,
        comment
      }
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}