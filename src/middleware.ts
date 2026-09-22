import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require auth
  const publicPaths = ['/login', '/register', '/api/auth', '/api/products', '/api/categories'];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Static assets, images, etc
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Allow public API routes for browsing
  if (pathname.startsWith('/api/products') && request.method === 'GET') {
    return NextResponse.next();
  }
  if (pathname.startsWith('/api/categories') && request.method === 'GET') {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect authenticated users away from login/register
  if (isPublicPath && token) {
    if (pathname === '/login' || pathname === '/register') {
      const role = (token as any).role;
      if (role === 'VENDOR') {
        return NextResponse.redirect(new URL('/vendor', request.url));
      }
      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Protect vendor routes
  if (pathname.startsWith('/vendor') || pathname.startsWith('/api/vendor')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if ((token as any).role !== 'VENDOR' && (token as any).role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if ((token as any).role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect other API routes that need auth
  if (pathname.startsWith('/api/') && !isPublicPath) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Protect customer routes (but allow browsing menu without auth)
  if (!token && !pathname.startsWith('/api/') && !isPublicPath) {
    // Allow browsing certain pages without auth
    const browsingPaths = ['/', '/search', '/category', '/product'];
    const isBrowsing = browsingPaths.some(
      (p) => pathname === p || pathname.startsWith('/category/') || pathname.startsWith('/product/')
    );
    if (!isBrowsing) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
