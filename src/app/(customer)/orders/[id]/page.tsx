'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, MapPin, Receipt, Star, Phone, MessageSquare, AlertCircle } from 'lucide-react';
import useSWR from 'swr';
import { Badge, Button, Modal, Skeleton } from '@/components/ui';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const TRACKING_STEPS = [
  { id: 'PENDING', label: 'Order Placed', timeField: 'createdAt' },
  { id: 'ACCEPTED', label: 'Order Accepted', timeField: 'acceptedAt' },
  { id: 'PREPARING', label: 'Preparing', timeField: 'preparingAt' },
  { id: 'READY', label: 'Ready for Pickup', timeField: 'readyAt' },
  { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', timeField: 'outForDeliveryAt' },
  { id: 'DELIVERED', label: 'Delivered', timeField: 'deliveredAt' }
];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const { data: order, isLoading, mutate } = useSWR(`/api/orders/${id}`, fetcher, {
    fallbackData: {
      id,
      status: liveStatus || 'PREPARING',
      createdAt: new Date(Date.now() - 600000).toISOString(),
      acceptedAt: new Date(Date.now() - 500000).toISOString(),
      preparingAt: new Date(Date.now() - 300000).toISOString(),
      total: 293,
      paymentMethod: 'UPI',
      location: 'Girls Hostel Gate',
      customerNotes: 'Call me when you reach',
      items: [
        { id: '1', name: 'Oreo Milkshake', variantName: '500 ML', quantity: 2, price: 130 }
      ]
    }
  });

  // Simulated SSE for live tracking
  useEffect(() => {
    // In real app: const es = new EventSource(`/api/events/orders?id=${id}`);
    const timer = setInterval(() => {
      // Simulate status progression
      setLiveStatus(prev => {
        if (!prev) return 'PREPARING';
        if (prev === 'PREPARING') return 'READY';
        if (prev === 'READY') return 'OUT_FOR_DELIVERY';
        if (prev === 'OUT_FOR_DELIVERY') return 'DELIVERED';
        return prev;
      });
    }, 15000); // 15 sec per step for demo

    return () => clearInterval(timer);
  }, [id]);

  const currentStatus = liveStatus || order?.status;

  const handleCancel = async () => {
    try {
      await fetch(`/api/orders/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: cancelReason })
      });
      setIsCancelModalOpen(false);
      mutate();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div className="p-4"><Skeleton className="h-screen" /></div>;

  const currentStepIndex = TRACKING_STEPS.findIndex(s => s.id === currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col pb-6">
      <header className="bg-white px-4 py-4 shadow-sm z-10 sticky top-0 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 text-gray-600 hover:bg-gray-50 rounded-full mr-2">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Order #{id}</h1>
            <p className="text-xs text-gray-500 font-medium">Placed at {formatTime(order.createdAt)}</p>
          </div>
        </div>
        <Badge variant={isCancelled ? 'danger' : currentStatus === 'DELIVERED' ? 'success' : 'brand'}>
          {currentStatus}
        </Badge>
      </header>

      <div className="p-5 space-y-5">
        {/* Tracking Timeline */}
        {!isCancelled && currentStatus !== 'DELIVERED' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Live Tracking</h3>
            <div className="relative pl-4 space-y-6">
              <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gray-100" />
              <div 
                className="absolute left-6 top-2 w-0.5 bg-brand-500 transition-all duration-500" 
                style={{ height: `${(currentStepIndex / (TRACKING_STEPS.length - 1)) * 100}%` }}
              />
              
              {TRACKING_STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                  <div key={step.id} className="relative flex items-center">
                    <div className={`absolute -left-[23px] w-5 h-5 rounded-full border-[3px] flex items-center justify-center bg-white ${isCompleted ? 'border-brand-500' : 'border-gray-200'} z-10`}>
                      {isCurrent && <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />}
                    </div>
                    <div className="ml-4 flex-1 flex justify-between items-center">
                      <span className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</span>
                      <span className="text-xs font-medium text-gray-500">{formatTime(order[step.timeField])}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Delivery Partner Info (Mock) */}
            {currentStepIndex >= 3 && (
              <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Raju Delivery</p>
                    <p className="text-xs text-gray-500 flex items-center">⭐ 4.9 (120+ deliveries)</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <Phone size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {['PENDING', 'ACCEPTED'].includes(currentStatus) && (
          <Button variant="outline" className="w-full text-red-500 border-red-200 hover:bg-red-50" onClick={() => setIsCancelModalOpen(true)}>
            Cancel Order
          </Button>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center"><Receipt className="mr-2 text-brand-500" size={20} /> Order Summary</h3>
          <div className="space-y-4 mb-4">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded bg-orange-50 text-brand-600 font-bold text-sm flex items-center justify-center shrink-0">
                    {item.quantity}x
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{item.name}</p>
                    {item.variantName && <p className="text-xs text-gray-500">{item.variantName}</p>}
                  </div>
                </div>
                <span className="font-semibold text-gray-900">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-dashed border-gray-200 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Item Total</span>
              <span className="font-medium">₹260</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery & Taxes</span>
              <span className="font-medium">₹33</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-bold text-gray-900">Grand Total</span>
              <span className="font-black text-lg text-brand-600">₹{order.total}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-sm font-medium text-gray-600">
            <span className="bg-gray-100 px-2 py-1 rounded text-xs mr-2">{order.paymentMethod}</span>
            Payment Successful
          </div>
        </div>

        {/* Delivery Details */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Delivery Details</h3>
          <div className="flex items-start space-x-3 mb-4">
            <MapPin className="text-gray-400 mt-1" size={20} />
            <div>
              <p className="text-sm font-bold text-gray-800">{order.location}</p>
              <p className="text-xs text-gray-500 mt-1">Contact: +91 9876543210</p>
            </div>
          </div>
          {order.customerNotes && (
            <div className="bg-orange-50 rounded-xl p-3 flex items-start space-x-2 text-sm">
              <MessageSquare size={16} className="text-brand-500 mt-0.5 shrink-0" />
              <span className="text-gray-700 italic">"{order.customerNotes}"</span>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Cancel Order">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Please select a reason for cancellation. Note that cancellation is only possible before food preparation begins.</p>
          <div className="space-y-2">
            {['Ordered by mistake', 'Want to change delivery address', 'Want to change items', 'Delivery taking too long'].map(reason => (
              <label key={reason} className="flex items-center space-x-3 p-3 border rounded-xl cursor-pointer">
                <input type="radio" name="cancelReason" checked={cancelReason === reason} onChange={() => setCancelReason(reason)} />
                <span className="text-sm font-medium text-gray-800">{reason}</span>
              </label>
            ))}
          </div>
          <Button variant="danger" className="w-full" disabled={!cancelReason} onClick={handleCancel}>
            Confirm Cancellation
          </Button>
        </div>
      </Modal>
    </div>
  );
}
