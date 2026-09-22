import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const reviews = await prisma.review.findMany({
      include: { user: true, order: true }
    });
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}