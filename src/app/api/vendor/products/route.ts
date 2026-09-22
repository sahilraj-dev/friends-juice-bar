import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { variants, addons, ...data } = await req.json();
    
    const product = await prisma.product.create({
      data: {
        ...data,
        variants: { create: variants || [] },
        addons: { create: addons || [] }
      },
      include: { variants: true, addons: true }
    });
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}