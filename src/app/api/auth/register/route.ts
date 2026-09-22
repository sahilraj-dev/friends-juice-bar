import { NextResponse } from 'next/server';
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
}