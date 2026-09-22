import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { code, cartTotal } = await req.json();
    if (!code || cartTotal === undefined) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

    const coupon = await prisma.coupon.findFirst({ where: { code } });
    if (!coupon || !coupon.isActive) return NextResponse.json({ error: 'Invalid coupon' }, { status: 400 });
    
    if (coupon.endDate && new Date(coupon.endDate) < new Date()) {
      return NextResponse.json({ error: 'Coupon expired' }, { status: 400 });
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'Usage limit reached' }, { status: 400 });
    }
    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      return NextResponse.json({ error: `Minimum order amount is ${coupon.minOrderAmount}` }, { status: 400 });
    }

    return NextResponse.json(coupon);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}