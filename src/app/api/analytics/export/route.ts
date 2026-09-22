import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const orders = await prisma.order.findMany({
      include: { user: true }
    });

    const csvRows = ['id,userId,totalAmount,status,createdAt'];
    orders.forEach(o => {
      csvRows.push(`${o.id},${o.userId},${o.total},${o.status},${o.createdAt.toISOString()}`);
    });

    return new Response(csvRows.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="orders.csv"'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}