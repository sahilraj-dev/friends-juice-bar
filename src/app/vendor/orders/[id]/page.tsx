'use client';

import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, MapPin, Clock, FileText, CreditCard } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: order, error, mutate } = useSWR(`/api/vendor/orders/${params.id}`, fetcher);

  if (error) return <div className="p-6 text-red-500">Error loading order</div>;
  if (!order) return <div className="p-6">Loading...</div>;

  const updateStatus = async (status: string) => {
    try {
      await fetch(`/api/vendor/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      mutate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center">
        <button onClick={() => router.back()} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
        <span className="ml-4 px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold border-b border-gray-100 pb-3 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div>
                    <div className="font-medium flex items-center">
                      <span className="w-6 h-6 rounded bg-gray-100 text-gray-700 flex items-center justify-center text-xs mr-3">
                        {item.quantity}x
                      </span>
                      {item.productName}
                    </div>
                    {item.variantName && <div className="text-sm text-gray-500 ml-9">Variant: {item.variantName}</div>}
                    {item.addons?.length > 0 && (
                      <div className="text-sm text-gray-500 ml-9">Addons: {item.addons.join(', ')}</div>
                    )}
                    {item.specialInstructions && (
                      <div className="text-sm text-orange-600 ml-9 italic bg-orange-50 p-1 rounded mt-1 inline-block">
                        Note: {item.specialInstructions}
                      </div>
                    )}
                  </div>
                  <div className="font-medium text-gray-900">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>₹{order.deliveryFee}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>₹{order.taxAmount}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold border-b border-gray-100 pb-3 mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 mr-3 flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Order Placed</div>
                  <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                </div>
              </div>
              {/* You can map actual timeline events here if API provides them */}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold border-b border-gray-100 pb-3 mb-4">Customer Details</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Name</div>
                <div className="font-medium">{order.customerName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Phone</div>
                <div className="font-medium flex items-center justify-between">
                  {order.customerPhone}
                  <a href={`tel:${order.customerPhone}`} className="text-blue-600 p-1 hover:bg-blue-50 rounded">
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold border-b border-gray-100 pb-3 mb-4">Delivery Info</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">{order.deliveryLocation?.name || 'N/A'}</div>
                  <div className="text-sm text-gray-600">{order.deliveryNotes || 'No specific delivery notes.'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold border-b border-gray-100 pb-3 mb-4">Payment</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-gray-400 mr-2" />
                <span className="font-medium">{order.paymentMethod || 'CASH_ON_DELIVERY'}</span>
              </div>
              <div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
                  order.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {order.paymentStatus || 'PENDING'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {order.status === 'PENDING' && (
                <button onClick={() => updateStatus('ACCEPTED')} className="w-full py-2 bg-brand-500 text-white rounded-md text-sm font-medium">Accept Order</button>
              )}
              {order.status === 'ACCEPTED' && (
                <button onClick={() => updateStatus('PREPARING')} className="w-full py-2 bg-orange-500 text-white rounded-md text-sm font-medium">Start Prep</button>
              )}
              {order.status === 'PREPARING' && (
                <button onClick={() => updateStatus('READY')} className="w-full py-2 bg-green-500 text-white rounded-md text-sm font-medium">Mark Ready</button>
              )}
              {order.status === 'READY' && (
                <button onClick={() => updateStatus('OUT_FOR_DELIVERY')} className="w-full py-2 bg-blue-500 text-white rounded-md text-sm font-medium">Out for Delivery</button>
              )}
              {order.status === 'OUT_FOR_DELIVERY' && (
                <button onClick={() => updateStatus('DELIVERED')} className="w-full py-2 bg-gray-900 text-white rounded-md text-sm font-medium">Mark Delivered</button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
