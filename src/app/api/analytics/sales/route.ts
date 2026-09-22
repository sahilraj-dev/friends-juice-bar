import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start') ? new Date(searchParams.get('start') as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = searchParams.get('end') ? new Date(searchParams.get('end') as string) : new Date();

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { total: true, createdAt: true }
    });

    // Minimal aggregation logic
    const data = orders.reduce((acc: any, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + order.total;
      return acc;
    }, {});

    return NextResponse.json({ sales: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}