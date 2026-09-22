'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Maximize2, Minimize2, Check } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function KitchenDisplayPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { data: orders, mutate } = useSWR('/api/vendor/orders?kitchen=true', fetcher, { refreshInterval: 15000 });

  useEffect(() => {
    const eventSource = new EventSource('/api/events/orders');
    eventSource.onmessage = (event) => {
      mutate();
    };
    return () => eventSource.close();
  }, [mutate]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/vendor/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      mutate();
    } catch (err) {
      console.error(err);
    }
  };

  if (!orders) return <div className="p-8 text-xl font-bold">Loading Kitchen Display...</div>;

  const newOrders = orders.filter((o: any) => o.status === 'PENDING' || o.status === 'ACCEPTED');
  const preparingOrders = orders.filter((o: any) => o.status === 'PREPARING');
  const readyOrders = orders.filter((o: any) => o.status === 'READY');

  const OrderCard = ({ order, actionText, nextStatus, colorClass }: any) => (
    <div className={`bg-white rounded-xl shadow-md border-t-8 ${colorClass} p-4 mb-4 flex flex-col h-full`}>
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
        <span className="text-2xl font-black">#{order.orderNumber}</span>
        <span className="text-sm font-semibold text-gray-500">
          {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </span>
      </div>
      
      <div className="flex-1">
        <ul className="space-y-3 mb-4">
          {order.items?.map((item: any, idx: number) => (
            <li key={idx} className="text-lg">
              <span className="font-bold text-xl mr-2">{item.quantity}x</span>
              <span className="font-medium text-gray-900">{item.productName}</span>
              {item.specialInstructions && (
                <div className="text-sm text-red-600 bg-red-50 p-1 mt-1 rounded font-bold">
                  *** {item.specialInstructions} ***
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <button 
        onClick={() => updateStatus(order.id, nextStatus)}
        className={`w-full py-4 rounded-lg font-bold text-xl text-white mt-auto ${actionText === 'READY' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {actionText}
      </button>
    </div>
  );

  return (
    <div className={`bg-gray-100 min-h-screen ${isFullscreen ? 'p-4' : 'p-4 sm:p-6 lg:p-8'}`}>
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-3xl font-black text-gray-800">Kitchen Display System</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm font-semibold text-gray-500">
            {new Date().toLocaleTimeString()}
          </div>
          <button onClick={toggleFullscreen} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md">
            {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
        {/* NEW COLUMN */}
        <div className="bg-gray-200 rounded-xl p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center justify-between sticky top-0 bg-gray-200 py-2 z-10">
            NEW / ACCEPTED <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">{newOrders.length}</span>
          </h2>
          {newOrders.map((order: any) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              actionText="START PREP" 
              nextStatus="PREPARING"
              colorClass="border-blue-500" 
            />
          ))}
        </div>

        {/* PREPARING COLUMN */}
        <div className="bg-orange-100 rounded-xl p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center justify-between text-orange-900 sticky top-0 bg-orange-100 py-2 z-10">
            PREPARING <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center">{preparingOrders.length}</span>
          </h2>
          {preparingOrders.map((order: any) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              actionText="MARK READY" 
              nextStatus="READY"
              colorClass="border-orange-500" 
            />
          ))}
        </div>

        {/* READY COLUMN */}
        <div className="bg-green-100 rounded-xl p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center justify-between text-green-900 sticky top-0 bg-green-100 py-2 z-10">
            READY <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">{readyOrders.length}</span>
          </h2>
          {readyOrders.map((order: any) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              actionText="DELIVER / HANDOVER" 
              nextStatus="OUT_FOR_DELIVERY"
              colorClass="border-green-500" 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
