import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured') === 'true';
    const bestseller = searchParams.get('bestseller') === 'true';
    const available = searchParams.get('available') !== 'false';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (category) where.categoryId = category;
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (featured) where.isFeatured = true;
    if (bestseller) where.isBestseller = true;
    if (available) where.isAvailable = true;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { variants: true, addons: true, category: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where })
    ]);

    return NextResponse.json({ products, total, page, limit });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}