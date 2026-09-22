'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  User, 
  Heart, 
  Bell, 
  LifeBuoy, 
  Info, 
  FileText, 
  LogOut, 
  ChevronRight,
  ClipboardList,
  Edit
} from 'lucide-react';
import { Skeleton } from '@/components/ui';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const menuItems = [
    { icon: ClipboardList, label: 'Order History', href: '/orders' },
    { icon: Heart, label: 'Favorites', href: '/favorites' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: LifeBuoy, label: 'Help & Support', href: '/support' },
    { icon: Info, label: 'About Friends Juice Bar', href: '#' },
    { icon: FileText, label: 'Terms & Conditions', href: '#' }
  ];

  if (status === 'loading') {
    return <div className="p-4 space-y-4 pt-8"><Skeleton className="h-32 w-full rounded-2xl" /><Skeleton className="h-[400px] w-full rounded-2xl" /></div>;
  }

  const user = session?.user || { name: 'Guest User', email: 'guest@example.com' };
  const initials = user.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'G';

  return (
    <div className="min-h-screen bg-cream pb-[100px]">
      {/* Profile Header */}
      <div className="bg-white px-5 pt-10 pb-8 rounded-b-[40px] shadow-sm mb-6 flex flex-col items-center relative">
        <button className="absolute top-10 right-5 p-2 text-brand-500 bg-orange-50 rounded-full hover:bg-orange-100 transition-colors">
          <Edit size={18} />
        </button>
        
        <div className="w-24 h-24 bg-gradient-to-tr from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white text-3xl font-black mb-4 shadow-lg shadow-brand-500/30 border-4 border-white">
          {initials}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h1>
        <p className="text-sm font-medium text-gray-500">{user.email}</p>
        <p className="text-xs font-semibold text-gray-400 mt-1 bg-gray-100 px-3 py-1 rounded-full">+91 9876543210</p>
      </div>

      {/* Menu Options */}
      <div className="px-5 space-y-4">
        <div className="bg-white rounded-3xl p-2 shadow-sm">
          {menuItems.map((item, index) => (
            <React.Fragment key={item.label}>
              <button 
                onClick={() => router.push(item.href)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-2xl"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-brand-500">
                    <item.icon size={20} />
                  </div>
                  <span className="font-semibold text-gray-800">{item.label}</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </button>
              {index < menuItems.length - 1 && <div className="h-px bg-gray-100 mx-4" />}
            </React.Fragment>
          ))}
        </div>

        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-center space-x-2 text-red-500 font-bold hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
        
        <p className="text-center text-xs font-medium text-gray-400 py-4">App Version 1.0.0</p>
      </div>
    </div>
  );
}
