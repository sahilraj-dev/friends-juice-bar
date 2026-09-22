import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'VENDOR' && (session.user as any).role !== 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const settings = await prisma.vendorProfile.findFirst();
    return NextResponse.json(settings || {});
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'VENDOR' && (session.user as any).role !== 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const data = await req.json();
    
    let settings = await prisma.vendorProfile.findFirst();
    if (settings) {
      settings = await prisma.vendorProfile.update({ where: { id: settings.id }, data });
    } else {
      settings = await prisma.vendorProfile.create({ data: { ...data, userId: session.user.id } });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}