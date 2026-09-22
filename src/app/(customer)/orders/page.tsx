'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCcw, MapPin, ChevronRight, Clock } from 'lucide-react';
import useSWR from 'swr';
import { Badge, Button, Skeleton, EmptyState } from '@/components/ui';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function OrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED'>('ALL');

  const { data: orders, isLoading } = useSWR('/api/orders', fetcher, {
    fallbackData: [
      { id: 'ORD12345', date: new Date().toISOString(), status: 'PREPARING', total: 293, items: ['Oreo Milkshake x2', 'Masala Fries x1'], location: 'Girls Hostel Gate' },
      { id: 'ORD12340', date: new Date(Date.now() - 86400000).toISOString(), status: 'DELIVERED', total: 180, items: ['Cold Coffee x2'], location: 'Library' },
      { id: 'ORD12310', date: new Date(Date.now() - 172800000).toISOString(), status: 'CANCELLED', total: 90, items: ['Mango Shake x1'], location: 'Boys Hostel Gate' }
    ]
  });

  const tabs = ['ALL', 'ACTIVE', 'DELIVERED', 'CANCELLED'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'ACCEPTED':
      case 'PREPARING':
      case 'READY':
      case 'OUT_FOR_DELIVERY':
        return <Badge variant="brand">{status.replace(/_/g, ' ')}</Badge>;
      case 'DELIVERED':
        return <Badge variant="success">DELIVERED</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">CANCELLED</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  const filteredOrders = orders?.filter((order: any) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ACTIVE') return !['DELIVERED', 'CANCELLED'].includes(order.status);
    return order.status === activeTab;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const handleReorder = async (e: React.MouseEvent, order: any) => {
    e.stopPropagation();
    // Reorder logic: add items to cart and redirect to cart
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-cream pb-[80px]">
      <header className="bg-white px-5 py-4 shadow-sm z-10 sticky top-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Orders</h1>
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </header>

      <div className="p-5 space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)
        ) : filteredOrders?.length === 0 ? (
          <div className="mt-10">
            <EmptyState 
              icon={<Clock size={40} />}
              title="No orders found"
              description={`You don't have any ${activeTab !== 'ALL' ? activeTab.toLowerCase() : ''} orders yet.`}
            />
          </div>
        ) : (
          filteredOrders.map((order: any) => (
            <div 
              key={order.id} 
              onClick={() => router.push(`/orders/${order.id}`)}
              className="bg-white rounded-3xl p-5 shadow-sm cursor-pointer border-2 border-transparent hover:border-orange-100 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-1">#{order.id}</p>
                  <p className="text-sm text-gray-900 font-medium">{formatDate(order.date)}</p>
                </div>
                {getStatusBadge(order.status)}
              </div>
              
              <div className="py-3 border-y border-dashed border-gray-100 mb-3">
                <p className="text-sm font-semibold text-gray-700 line-clamp-2">
                  {order.items.join(', ')}
                </p>
                <div className="flex items-center mt-2 text-xs text-gray-500 font-medium">
                  <MapPin size={14} className="mr-1" /> {order.location}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-black text-gray-900 text-lg">₹{order.total}</span>
                
                {order.status === 'DELIVERED' ? (
                  <Button variant="outline" size="sm" onClick={(e) => handleReorder(e, order)}>
                    <RefreshCcw size={14} className="mr-2" /> Reorder
                  </Button>
                ) : !['CANCELLED'].includes(order.status) ? (
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/orders/${order.id}`); }}>
                    Track <ChevronRight size={16} className="ml-1" />
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
