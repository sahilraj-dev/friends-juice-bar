'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, ArrowRight, Tag } from 'lucide-react';
import useSWR from 'swr';
import { Button, QuantitySelector, Skeleton, EmptyState } from '@/components/ui';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function CartPage() {
  const router = useRouter();
  const [coupon, setCoupon] = useState('');
  
  const { data: cart, isLoading, mutate } = useSWR('/api/cart', fetcher, {
    fallbackData: {
      items: [
        {
          id: '1',
          productId: 'p1',
          name: 'Oreo Milkshake',
          imageEmoji: '🥤',
          variantName: '500 ML',
          addons: ['Extra Chocolate', 'Whipped Cream'],
          instructions: 'Less ice please',
          price: 130,
          quantity: 2
        }
      ],
      subtotal: 260,
      discount: 0,
      deliveryFee: 20,
      tax: 13,
      total: 293
    }
  });

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    // Optimistic update logic would go here
    await fetch(`/api/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: newQuantity })
    });
    mutate();
  };

  const removeItem = async (itemId: string) => {
    await fetch(`/api/cart/items/${itemId}`, { method: 'DELETE' });
    mutate();
  };

  if (isLoading) {
    return <div className="p-4 space-y-4 pt-8"><Skeleton className="h-10 w-40" /><Skeleton className="h-32 w-full rounded-2xl" /></div>;
  }

  if (!cart?.items?.length) {
    return (
      <div className="min-h-screen bg-cream flex flex-col pt-8">
        <h1 className="text-2xl font-bold text-gray-900 px-6 mb-8">My Cart</h1>
        <EmptyState 
          icon={<span className="text-4xl">🛒</span>}
          title="Your cart is feeling lonely"
          description="Add something delicious from the menu!"
          action={<Button onClick={() => router.push('/')}>Browse Menu</Button>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col pb-[120px]">
      <div className="bg-white px-6 py-6 pb-8 rounded-b-[40px] shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Cart</h1>
        
        <div className="space-y-6">
          {cart.items.map((item: any) => (
            <div key={item.id} className="flex space-x-4">
              <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                {item.imageEmoji}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{item.name}</h3>
                    {item.variantName && <p className="text-xs text-gray-500">{item.variantName}</p>}
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                {item.addons?.length > 0 && (
                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-1 border-l-2 border-brand-200 pl-2">
                    + {item.addons.join(', ')}
                  </p>
                )}
                {item.instructions && (
                  <p className="text-[10px] text-orange-600 mt-1 bg-orange-50 p-1.5 rounded line-clamp-1 italic">
                    Note: {item.instructions}
                  </p>
                )}
                
                <div className="flex justify-between items-center mt-3">
                  <div className="font-bold text-brand-600">₹{item.price}</div>
                  <QuantitySelector 
                    value={item.quantity} 
                    onChange={(val) => updateQuantity(item.id, val)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-6">
        {/* Coupon */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center space-x-3">
          <Tag size={20} className="text-brand-500" />
          <input 
            type="text" 
            placeholder="Apply Coupon Code" 
            value={coupon}
            onChange={e => setCoupon(e.target.value.toUpperCase())}
            className="flex-1 outline-none text-sm font-semibold uppercase placeholder:normal-case"
          />
          <button className="text-sm font-bold text-brand-500 px-3 py-1 bg-orange-50 rounded-lg">
            Apply
          </button>
        </div>

        {/* Bill Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Bill Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Item Total</span>
              <span className="font-medium">₹{cart.subtotal}</span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Item Discount</span>
                <span className="font-medium">-₹{cart.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span className="font-medium">₹{cart.deliveryFee}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Taxes & Charges</span>
              <span className="font-medium">₹{cart.tax}</span>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
              <span className="font-bold text-gray-900">Grand Total</span>
              <span className="font-black text-lg text-gray-900">₹{cart.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Checkout Button */}
      <div className="fixed bottom-[80px] left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 p-4 flex items-center justify-between z-40">
        <div>
          <p className="text-xs text-gray-500 font-medium">TOTAL</p>
          <p className="text-xl font-black text-gray-900">₹{cart.total}</p>
        </div>
        <Button 
          onClick={() => router.push('/checkout')}
          className="shadow-lg shadow-brand-500/30 px-8"
        >
          Checkout <ArrowRight size={18} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
