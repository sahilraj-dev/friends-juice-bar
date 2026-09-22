'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ClipboardList, ShoppingCart, User } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Use SWR to get cart count, fallback to 0 if error or loading
  const { data: cartData } = useSWR('/api/cart', fetcher);
  const cartItemCount = cartData?.items?.length || 0;

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/orders', icon: ClipboardList, label: 'Orders' },
    { href: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartItemCount },
    { href: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="min-h-screen bg-cream pb-[80px] max-w-md mx-auto shadow-2xl relative bg-[#FFF8F0]">
      <main className="min-h-full">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-40 pb-safe rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="relative flex flex-col items-center justify-center w-12 h-12">
              <div className={`p-2 rounded-2xl transition-colors ${isActive ? 'bg-orange-50 text-brand-500' : 'text-gray-400 hover:text-gray-600'}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              {item.badge ? (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white border-2 border-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
