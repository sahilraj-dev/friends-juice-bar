'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Gift, Package, CreditCard, CheckCircle2 } from 'lucide-react';
import useSWR from 'swr';
import { EmptyState, Skeleton } from '@/components/ui';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function NotificationsPage() {
  const router = useRouter();

  const { data: notifications, isLoading } = useSWR('/api/notifications', fetcher, {
    fallbackData: [
      { id: '1', title: 'Order Delivered', message: 'Your order #ORD12345 has been delivered successfully. Enjoy your meal!', type: 'order_delivered', isRead: false, time: '2 mins ago' },
      { id: '2', title: '50% Off on Shakes! 🥤', message: 'Use code SHAKE50 to get flat 50% off on all shakes today. Valid till midnight.', type: 'promo', isRead: false, time: '2 hours ago' },
      { id: '3', title: 'Payment Successful', message: 'Payment of ₹293 received for order #ORD12345.', type: 'payment', isRead: true, time: '30 mins ago' },
      { id: '4', title: 'Order Accepted', message: 'The restaurant has accepted your order and is preparing it.', type: 'order_status', isRead: true, time: '45 mins ago' }
    ]
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'order_delivered': return <CheckCircle2 className="text-green-500" size={24} />;
      case 'promo': return <Gift className="text-brand-500" size={24} />;
      case 'payment': return <CreditCard className="text-blue-500" size={24} />;
      default: return <Package className="text-orange-500" size={24} />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'order_delivered': return 'bg-green-100';
      case 'promo': return 'bg-orange-100';
      case 'payment': return 'bg-blue-100';
      default: return 'bg-orange-100';
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-white px-4 py-4 shadow-sm z-10 sticky top-0 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 text-gray-600 hover:bg-gray-50 rounded-full mr-3">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        </div>
        <button className="text-sm font-semibold text-brand-500 px-3 py-1 bg-orange-50 rounded-full">
          Mark all read
        </button>
      </header>

      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
          </div>
        ) : notifications?.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notif: any) => (
              <div 
                key={notif.id}
                className={`p-4 rounded-2xl flex space-x-4 cursor-pointer transition-colors border ${notif.isRead ? 'bg-white border-gray-100' : 'bg-orange-50/50 border-brand-100 shadow-sm'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getIconBg(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-sm ${notif.isRead ? 'font-semibold text-gray-800' : 'font-bold text-gray-900'}`}>{notif.title}</h3>
                    {!notif.isRead && <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5" />}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-2">{notif.message}</p>
                  <p className="text-[10px] font-semibold text-gray-400">{notif.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-20">
            <EmptyState 
              icon={<Bell size={40} className="text-gray-400" />}
              title="No notifications"
              description="You're all caught up! We'll notify you when something important happens."
            />
          </div>
        )}
      </div>
    </div>
  );
}
