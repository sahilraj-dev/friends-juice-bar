'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingCart,
  PackageSearch,
  Tags,
  Ticket,
  MapPin,
  ShieldAlert,
  Settings,
  LogOut
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

const ADMIN_NAV = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Vendors', href: '/admin/vendors', icon: Store },
  { name: 'All Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Audit Log', href: '/admin/audit', icon: ShieldAlert },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated' || (session?.user as any)?.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-blue-900 text-white z-10">
        <div className="flex items-center justify-center h-16 bg-blue-950 border-b border-blue-800 px-4">
          <Link href="/admin" className="text-xl font-bold truncate">
            Admin Portal
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {ADMIN_NAV.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-800 text-white'
                      : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-blue-300'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 bg-blue-950">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center px-4 py-2 text-sm font-medium text-blue-100 hover:bg-blue-800 rounded-md"
          >
            <LogOut className="mr-3 h-5 w-5 text-blue-300" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="md:hidden">
            <span className="text-lg font-bold text-blue-900">Admin</span>
          </div>
          <div className="flex-1 flex justify-end items-center space-x-4">
            <div className="text-sm text-gray-500 mr-2">Logged in as Administrator</div>
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm border border-blue-200">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
