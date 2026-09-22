'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { MapPin, Phone, Clock, AlertCircle } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const STATUS_TABS = ['ALL', 'NEW', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

export default function VendorOrdersPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedPrepTime, setSelectedPrepTime] = useState<Record<string, number>>({});
  const audioContextRef = useRef<AudioContext | null>(null);

  const { data: orders, error, mutate } = useSWR('/api/vendor/orders', fetcher, { refreshInterval: 30000 });

  useEffect(() => {
    const eventSource = new EventSource('/api/events/orders');
    eventSource.onmessage = (event) => {
      const newOrder = JSON.parse(event.data);
      if (newOrder.type === 'NEW_ORDER') {
        playBeep();
        mutate(); // Re-fetch
      }
    };
    return () => eventSource.close();
  }, [mutate]);

  const playBeep = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error('Audio beep failed', e);
    }
  };

  const updateStatus = async (id: string, action: string, data?: any) => {
    try {
      await fetch(`/api/vendor/orders/${id}/${action}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined
      });
      mutate();
    } catch (err) {
      console.error(err);
    }
  };

  if (error) return <div className="p-6 text-red-500">Failed to load orders.</div>;
  if (!orders) return <div className="p-6">Loading...</div>;

  const filteredOrders = activeTab === 'ALL' 
    ? orders 
    : orders.filter((o: any) => activeTab === 'NEW' ? o.status === 'PENDING' : o.status === activeTab);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>
      
      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 mb-6 hide-scrollbar space-x-2">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium ${
              activeTab === tab
                ? 'bg-brand-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.replace(/_/g, ' ')}
            {tab === 'NEW' && orders.filter((o:any) => o.status === 'PENDING').length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs">
                {orders.filter((o:any) => o.status === 'PENDING').length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No orders found.</p>
          </div>
        ) : (
          filteredOrders.map((order: any) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Link href={`/vendor/orders/${order.id}`} className="text-lg font-bold text-brand-600 hover:underline">
                      #{order.orderNumber}
                    </Link>
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">₹{order.totalAmount}</div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-md bg-gray-100 mt-1">
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="font-medium">{order.customerName}</div>
                  <div className="text-sm text-gray-600 flex items-center mt-1">
                    <Phone className="w-4 h-4 mr-1" /> {order.customerPhone}
                  </div>
                  <div className="text-sm text-gray-600 flex items-start mt-2">
                    <MapPin className="w-4 h-4 mr-1 mt-0.5 text-red-500 flex-shrink-0" /> 
                    <span>{order.deliveryLocation?.name || 'N/A'} {order.deliveryNotes && ` - ${order.deliveryNotes}`}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <ul className="space-y-2">
                    {order.items?.map((item: any) => (
                      <li key={item.id} className="flex justify-between">
                        <span><span className="font-medium">{item.quantity}x</span> {item.productName}</span>
                        <span className="text-gray-500">₹{item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="sm:w-64 flex flex-col justify-end space-y-3 border-t sm:border-t-0 pt-4 sm:pt-0 sm:border-l border-gray-100 sm:pl-6">
                {order.status === 'PENDING' && (
                  <>
                    <button onClick={() => updateStatus(order.id, 'reject', { reason: 'Busy' })} className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100">
                      Reject Order
                    </button>
                    <button onClick={() => updateStatus(order.id, 'accept', { estimatedPrepTime: 15 })} className="w-full px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-md hover:bg-brand-600">
                      Accept (15m prep)
                    </button>
                  </>
                )}

                {order.status === 'ACCEPTED' && (
                  <>
                    <div className="mb-2">
                      <label className="text-xs text-gray-500 mb-1 block">Prep Time</label>
                      <select 
                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-brand-500 focus:ring-brand-500"
                        value={selectedPrepTime[order.id] || 15}
                        onChange={(e) => setSelectedPrepTime({...selectedPrepTime, [order.id]: parseInt(e.target.value)})}
                      >
                        <option value={10}>10 mins</option>
                        <option value={15}>15 mins</option>
                        <option value={20}>20 mins</option>
                        <option value={30}>30 mins</option>
                      </select>
                    </div>
                    <button onClick={() => updateStatus(order.id, 'status', { status: 'PREPARING' })} className="w-full px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">
                      Start Preparation
                    </button>
                  </>
                )}

                {order.status === 'PREPARING' && (
                  <button onClick={() => updateStatus(order.id, 'status', { status: 'READY' })} className="w-full px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 py-3">
                    Mark as Ready
                  </button>
                )}

                {order.status === 'READY' && (
                  <button onClick={() => updateStatus(order.id, 'status', { status: 'OUT_FOR_DELIVERY' })} className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600">
                    Start Delivery
                  </button>
                )}

                {order.status === 'OUT_FOR_DELIVERY' && (
                  <>
                    <a href={`tel:${order.customerPhone}`} className="w-full flex justify-center items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100">
                      <Phone className="w-4 h-4 mr-2" /> Call Customer
                    </a>
                    <button onClick={() => updateStatus(order.id, 'status', { status: 'DELIVERED' })} className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800">
                      Mark Delivered
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
