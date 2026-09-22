import { NextResponse } from 'next/server';
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
}