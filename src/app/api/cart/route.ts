import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
     if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { 
        items: {
          include: {
            product: true,
            variant: true
          }
        }
      }
    });
    
    if (!cart) return NextResponse.json({ items: [], total: 0 });

    let total = 0;
    // We need to fetch all addons for the cart to compute prices properly
    const allAddonIds = cart.items.flatMap(item => {
      try {
        return JSON.parse(item.selectedAddons) as string[];
      } catch {
        return [];
      }
    });
    
    const addons = await prisma.addon.findMany({
      where: { id: { in: allAddonIds } }
    });
    const addonMap = new Map(addons.map(a => [a.id, a]));

    const computedItems = cart.items.map(item => {
      let itemPrice = item.product.basePrice;
      if (item.variant) {
        itemPrice = item.variant.price;
      }
      
      let parsedAddons: string[] = [];
      try {
        parsedAddons = JSON.parse(item.selectedAddons);
      } catch {}
      
      const itemAddonDetails = parsedAddons.map(id => addonMap.get(id)).filter(Boolean);
      itemAddonDetails.forEach(a => { if (a) itemPrice += a.price; });
      
      const itemTotal = itemPrice * item.quantity;
      total += itemTotal;
      
      return {
        ...item,
        computedPrice: itemPrice,
        computedTotal: itemTotal,
        addonDetails: itemAddonDetails
      };
    });

    return NextResponse.json({ ...cart, items: computedItems, computedTotal: total });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
     if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await prisma.cart.delete({ where: { userId: user.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}