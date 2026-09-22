import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { processPayment } from '@/lib/payment';
import { sendNotification } from '@/lib/notifications';
import { emitNewOrder } from '@/lib/events';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const { items, deliveryLocationId, paymentMethod, deliveryNotes, customerPhone, couponCode } = await req.json();
    if (!items || !items.length) return NextResponse.json({ error: 'Cart empty' }, { status: 400 });

    let subtotal = 0;
    const orderItemsData: any[] = [];
    let vendorId = '';

    // Recalculate prices
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isAvailable) return NextResponse.json({ error: `Product ${item.productId} unavailable` }, { status: 400 });
      
      vendorId = product.vendorId; // Assuming all items from same vendor

      let itemPrice = product.basePrice;
      let variantName = null;
      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId } });
        if (variant) {
          itemPrice = variant.price;
          variantName = variant.name;
        }
      }
      
      const addonDetails: { name: string; price: number }[] = [];
      if (item.addons && item.addons.length > 0) {
        const addons = await prisma.addon.findMany({ where: { id: { in: item.addons } } });
        addons.forEach(a => {
          itemPrice += a.price;
          addonDetails.push({ name: a.name, price: a.price });
        });
      }

      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: item.productId,
        productName: product.name,
        variantName,
        price: itemPrice,
        quantity: item.quantity,
        addons: JSON.stringify(addonDetails),
        specialInstructions: item.instructions || '',
        itemTotal
      });
    }

    let discount = 0;
    let couponId = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({ where: { code: couponCode } });
      if (coupon && coupon.isActive && (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount)) {
        couponId = coupon.id;
        if (coupon.type === 'PERCENTAGE') {
          discount = subtotal * (coupon.value / 100);
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = coupon.value;
        }
      }
    }

    // Need vendor for fees/tax
    const vendor = await prisma.vendorProfile.findUnique({ where: { id: vendorId } });
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 400 });

    const deliveryFee = (subtotal - discount) >= vendor.freeDeliveryThreshold ? 0 : vendor.deliveryFee;
    const tax = ((subtotal - discount) * vendor.taxRate) / 100;
    const total = subtotal - discount + deliveryFee + tax;

    // Process payment
    const paymentResult = await processPayment({
      orderId: 'PENDING_ORDER', // Order is created after payment
      amount: total,
      method: paymentMethod,
      customerName: user.name || 'Customer',
      customerPhone: customerPhone || ''
    });
    if (!paymentResult.success) {
      return NextResponse.json({ error: 'Payment failed' }, { status: 400 });
    }

    // Generate unique order number (simple approach)
    const orderNumber = Math.floor(Math.random() * 90000) + 10000;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        vendorId,
        deliveryLocationId,
        couponId,
        subtotal,
        discount,
        deliveryFee,
        tax,
        total,
        status: 'PENDING',
        paymentMethod,
        paymentStatus: paymentMethod === 'CASH' ? 'PENDING' : 'COMPLETED',
        deliveryNotes,
        customerName: user.name || '',
        customerPhone,
        items: { create: orderItemsData },
        payments: {
          create: {
            amount: total,
            status: paymentMethod === 'CASH' ? 'PENDING' : 'COMPLETED',
            method: paymentMethod,
            transactionId: paymentResult.transactionId || ''
          }
        },
        statusHistory: {
          create: { status: 'PENDING', note: 'Order placed', changedBy: user.id }
        }
      },
      include: { items: true, payments: true, deliveryLocation: true }
    });

    await prisma.cart.deleteMany({ where: { userId: user.id } });
    await sendNotification(user.id, 'Order placed successfully', 'Your order is pending confirmation');
    emitNewOrder(order);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const where: any = {};
    if (user.role === 'CUSTOMER') where.userId = user.id;
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: { items: { include: { product: true } }, deliveryLocation: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}