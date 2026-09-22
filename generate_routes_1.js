const fs = require('fs');
const path = require('path');

const files = {
  "src/app/api/auth/register/route.ts": `import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { name, email, phone, password, role } = await req.json();
    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] }
    });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, phone, password: hashedPassword, role: role || 'CUSTOMER' }
    });
    return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`,

  "src/app/api/products/route.ts": `import { NextResponse } from 'next/server';
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
}`,

  "src/app/api/products/[id]/route.ts": `import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { variants: true, addons: true, category: true, reviews: true }
    });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`,

  "src/app/api/categories/route.ts": `import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: true } } }
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`,

  "src/app/api/cart/route.ts": `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { 
        items: {
          include: {
            product: true,
            variant: true,
            addons: { include: { addon: true } }
          }
        }
      }
    });
    
    if (!cart) return NextResponse.json({ items: [], total: 0 });

    let total = 0;
    cart.items.forEach(item => {
      let itemTotal = item.product.basePrice;
      if (item.variant) itemTotal += item.variant.priceDifference;
      item.addons.forEach(a => { itemTotal += a.addon.price; });
      total += itemTotal * item.quantity;
    });

    return NextResponse.json({ ...cart, computedTotal: total });
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

    await prisma.cart.delete({ where: { userId: user.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`,

  "src/app/api/cart/items/route.ts": `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    const { productId, variantId, quantity, addons, instructions } = await req.json();

    if (!productId || !quantity) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    let cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: user.id } });
    }

    const item = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId,
        quantity,
        instructions,
        addons: {
          create: addons?.map((id: string) => ({ addonId: id })) || []
        }
      }
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`,

  "src/app/api/cart/items/[id]/route.ts": `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { quantity, addons } = await req.json();
    const updateData: any = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    
    if (addons !== undefined) {
      updateData.addons = {
        deleteMany: {},
        create: addons.map((id: string) => ({ addonId: id }))
      };
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    await prisma.cartItem.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`,

  "src/app/api/orders/route.ts": `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { processPayment } from '@/lib/payment';
import { sendNotification } from '@/lib/notifications';
import { eventEmitter } from '@/lib/events';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    
    const { items, deliveryLocationId, paymentMethod, deliveryNotes, customerPhone, couponCode } = await req.json();
    if (!items || !items.length) return NextResponse.json({ error: 'Cart empty' }, { status: 400 });

    let totalAmount = 0;
    const orderItemsData = [];

    // Recalculate prices
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isAvailable) return NextResponse.json({ error: \`Product \${item.productId} unavailable\` }, { status: 400 });
      
      let itemTotal = product.basePrice;
      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId } });
        if (variant) itemTotal += variant.priceDifference;
      }
      
      if (item.addons && item.addons.length > 0) {
        const addons = await prisma.addon.findMany({ where: { id: { in: item.addons } } });
        addons.forEach(a => { itemTotal += a.price; });
      }

      totalAmount += itemTotal * item.quantity;
      orderItemsData.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: itemTotal,
        instructions: item.instructions
      });
    }

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive && (!coupon.minOrder || totalAmount >= coupon.minOrder)) {
        if (coupon.discountType === 'PERCENTAGE') {
          totalAmount -= totalAmount * (coupon.discountAmount / 100);
        } else {
          totalAmount -= coupon.discountAmount;
        }
      }
    }

    // Process payment
    const paymentResult = await processPayment(totalAmount, paymentMethod);
    if (!paymentResult.success) {
      return NextResponse.json({ error: 'Payment failed' }, { status: 400 });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount,
        status: 'PENDING',
        deliveryLocationId,
        paymentMethod,
        deliveryNotes,
        customerPhone,
        items: { create: orderItemsData },
        payment: {
          create: {
            amount: totalAmount,
            status: paymentMethod === 'CASH' ? 'PENDING' : 'COMPLETED',
            method: paymentMethod,
            transactionId: paymentResult.transactionId
          }
        },
        statusHistory: {
          create: { status: 'PENDING', note: 'Order placed' }
        }
      },
      include: { items: true, payment: true, deliveryLocation: true }
    });

    await prisma.cart.deleteMany({ where: { userId: user.id } });
    await sendNotification(user.id, 'Order placed successfully', 'Your order is pending confirmation');
    eventEmitter.emit('new_order', order);

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
}`,

  "src/app/api/orders/[id]/route.ts": `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { 
        items: { include: { product: true, variant: true } },
        statusHistory: true,
        payment: true,
        review: true,
        deliveryLocation: true
      }
    });

    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`,

  "src/app/api/orders/[id]/cancel/route.ts": `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { sendNotification } from '@/lib/notifications';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { reason } = await req.json();
    const order = await prisma.order.findUnique({ where: { id: params.id } });
    
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (order.status !== 'PENDING' && order.status !== 'ACCEPTED') {
      return NextResponse.json({ error: 'Cannot cancel order at this stage' }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { 
        status: 'CANCELLED',
        statusHistory: { create: { status: 'CANCELLED', note: reason } }
      }
    });

    await sendNotification(order.userId, 'Order Cancelled', \`Your order \${order.id} was cancelled.\`);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`,

  "src/app/api/orders/[id]/review/route.ts": `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    
    const { foodRating, packagingRating, deliveryRating, comment } = await req.json();
    const order = await prisma.order.findUnique({ where: { id: params.id } });
    
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (order.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (order.status !== 'DELIVERED') return NextResponse.json({ error: 'Order not delivered yet' }, { status: 400 });

    const review = await prisma.review.create({
      data: {
        orderId: order.id,
        userId: user.id,
        foodRating,
        packagingRating,
        deliveryRating,
        comment
      }
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`,

  "src/app/api/vendor/orders/[id]/accept/route.ts": `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { sendNotification } from '@/lib/notifications';
import { canTransitionTo } from '@/lib/utils';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { estimatedPrepTime } = await req.json();
    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!canTransitionTo(order.status, 'ACCEPTED')) return NextResponse.json({ error: 'Invalid transition' }, { status: 400 });

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: 'ACCEPTED',
        estimatedPrepTime,
        statusHistory: { create: { status: 'ACCEPTED' } }
      }
    });

    await sendNotification(order.userId, 'Order Accepted', \`Prep time: \${estimatedPrepTime} mins\`);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`,

  "src/app/api/vendor/orders/[id]/reject/route.ts": `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { sendNotification } from '@/lib/notifications';
import { canTransitionTo } from '@/lib/utils';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { reason } = await req.json();
    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!canTransitionTo(order.status, 'REJECTED')) return NextResponse.json({ error: 'Invalid transition' }, { status: 400 });

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        statusHistory: { create: { status: 'REJECTED', note: reason } }
      }
    });

    await sendNotification(order.userId, 'Order Rejected', \`Reason: \${reason}\`);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`,

  "src/app/api/vendor/orders/[id]/preparing/route.ts": `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { sendNotification } from '@/lib/notifications';
import { canTransitionTo } from '@/lib/utils';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order || !canTransitionTo(order.status, 'PREPARING')) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { status: 'PREPARING', statusHistory: { create: { status: 'PREPARING' } } }
    });

    await sendNotification(order.userId, 'Order Preparing', 'Your order is now being prepared');
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join('z:/WORK/FriendsJuiceBar', filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('Batch 1 done');
