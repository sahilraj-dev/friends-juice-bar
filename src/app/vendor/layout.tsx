'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  ChefHat,
  MenuSquare,
  Tags,
  Package,
  MapPin,
  Users,
  Ticket,
  Star,
  LineChart,
  Settings,
  Bell,
  LogOut,
  Power
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/vendor', icon: LayoutDashboard },
  { name: 'Orders', href: '/vendor/orders', icon: ShoppingCart },
  { name: 'Kitchen', href: '/vendor/kitchen', icon: ChefHat },
  { name: 'Menu', href: '/vendor/menu', icon: MenuSquare },
  { name: 'Categories', href: '/vendor/categories', icon: Tags },
  { name: 'Inventory', href: '/vendor/inventory', icon: Package },
  { name: 'Delivery', href: '/vendor/delivery', icon: MapPin },
  { name: 'Customers', href: '/vendor/customers', icon: Users },
  { name: 'Coupons', href: '/vendor/coupons', icon: Ticket },
  { name: 'Reviews', href: '/vendor/reviews', icon: Star },
  { name: 'Analytics', href: '/vendor/analytics', icon: LineChart },
  { name: 'Settings', href: '/vendor/settings', icon: Settings },
];

const MOBILE_NAV_ITEMS = [
  { name: 'Dashboard', href: '/vendor', icon: LayoutDashboard },
  { name: 'Orders', href: '/vendor/orders', icon: ShoppingCart },
  { name: 'Menu', href: '/vendor/menu', icon: MenuSquare },
  { name: 'Analytics', href: '/vendor/analytics', icon: LineChart },
  { name: 'Settings', href: '/vendor/settings', icon: Settings },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [storeOpen, setStoreOpen] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'VENDOR' && (session?.user as any)?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center bg-cream"><div className="animate-spin text-4xl">🥤</div></div>;
  }

  if (status === 'unauthenticated' || ((session?.user as any)?.role !== 'VENDOR' && (session?.user as any)?.role !== 'ADMIN')) {
    return null;
  }

  const toggleStoreStatus = async () => {
    try {
      // API call to toggle store status
      const res = await fetch('/api/vendor/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isStoreOpen: !storeOpen }),
      });
      if (res.ok) {
        setStoreOpen(!storeOpen);
      }
    } catch (error) {
      console.error('Failed to toggle store status', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-orange-50 border-r border-orange-100 z-10">
        <div className="flex items-center justify-center h-16 bg-white border-b border-orange-100 px-4">
          <Link href="/vendor" className="text-xl font-bold text-brand-500 truncate">
            Friends Juice Bar
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-brand-500 text-white'
                      : 'text-gray-700 hover:bg-orange-100 hover:text-brand-500'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-orange-100 bg-white">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-orange-100 hover:text-brand-500 rounded-md"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-10">
          <div className="flex items-center md:hidden">
            <span className="text-lg font-bold text-brand-500">Vendor Panel</span>
          </div>
          
          <div className="flex-1 flex justify-end items-center space-x-4">
            <button
              onClick={toggleStoreStatus}
              className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${
                storeOpen 
                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                  : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
              }`}
            >
              <Power className={`w-4 h-4 mr-1.5 ${storeOpen ? 'text-green-500' : 'text-red-500'}`} />
              {storeOpen ? 'OPEN' : 'CLOSED'}
            </button>
            
            <button className="relative p-2 text-gray-400 hover:text-gray-500">
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              <Bell className="h-6 w-6" />
            </button>
            
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm">
                {session?.user?.name?.charAt(0) || 'V'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-16 md:pb-0 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex items-center justify-between px-2 pb-safe z-20">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-3 text-xs font-medium ${
                isActive ? 'text-brand-500' : 'text-gray-500'
              }`}
            >
              <item.icon className={`h-6 w-6 mb-1 ${isActive ? 'text-brand-500' : 'text-gray-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
