'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Phone, MessageSquare, CreditCard, Banknote, Navigation } from 'lucide-react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { Button, Input } from '@/components/ui';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [location, setLocation] = useState('Girls Hostel Gate');
  const [customLocation, setCustomLocation] = useState('');
  const [phone, setPhone] = useState('9876543210');
  const [notes, setNotes] = useState('');
  const [payment, setPayment] = useState('UPI');

  const { data: locationsData } = useSWR('/api/vendor/delivery-locations', fetcher);
  const locations = locationsData || ['Girls Hostel Gate', 'Boys Hostel Gate', 'Library', 'Main Canteen'];

  const { data: cart } = useSWR('/api/cart', fetcher, {
    fallbackData: { total: 293, items: [{id: '1', name: 'Oreo Milkshake'}] }
  });

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: customLocation || location,
          phone,
          notes,
          paymentMethod: payment,
          total: cart.total
        })
      });
      // Mock successful order
      setTimeout(() => {
        router.push('/order-confirmed/ORD12345');
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between px-8 mb-8 relative">
      <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-gray-200 -z-10 -translate-y-1/2" />
      <div className="absolute top-1/2 left-8 h-0.5 bg-brand-500 -z-10 -translate-y-1/2 transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }} />
      {[1, 2, 3, 4].map(s => (
        <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${s <= step ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
          {s}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-white px-4 py-4 shadow-sm z-10 sticky top-0 flex items-center">
        <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="p-2 text-gray-600 hover:bg-gray-50 rounded-full mr-3">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
      </header>

      <div className="flex-1 p-5 overflow-y-auto pb-[100px]">
        {renderStepIndicator()}

        <div className="bg-white rounded-3xl p-6 shadow-sm min-h-[300px]">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold flex items-center mb-4"><MapPin className="mr-2 text-brand-500" /> Delivery Location</h2>
              <div className="space-y-3">
                {locations.map((loc: string) => (
                  <label key={loc} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${location === loc && !customLocation ? 'border-brand-500 bg-orange-50' : 'border-gray-100'}`}>
                    <input type="radio" name="location" checked={location === loc && !customLocation} onChange={() => {setLocation(loc); setCustomLocation('');}} className="hidden" />
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${location === loc && !customLocation ? 'border-brand-500' : 'border-gray-300'}`}>
                      {location === loc && !customLocation && <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />}
                    </div>
                    <span className="font-medium text-gray-800">{loc}</span>
                  </label>
                ))}
                
                <div className="relative mt-4">
                  <Input 
                    placeholder="Other location..." 
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    onFocus={() => setLocation('')}
                    iconPrefix={<Navigation size={18} />}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold flex items-center mb-4"><Phone className="mr-2 text-brand-500" /> Contact Info</h2>
              <Input label="Name" defaultValue={session?.user?.name || ''} />
              <Input label="Phone Number" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold flex items-center mb-4"><MessageSquare className="mr-2 text-brand-500" /> Delivery Instructions</h2>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g., Call me when you reach, leave at reception..."
                className="w-full bg-white border-2 border-gray-100 rounded-xl p-4 text-sm focus:outline-none focus:border-brand-500 resize-none h-32"
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold flex items-center mb-4"><CreditCard className="mr-2 text-brand-500" /> Payment Method</h2>
              <div className="space-y-3">
                {[
                  { id: 'UPI', label: 'UPI (GPay, PhonePe, Paytm)', icon: <CreditCard size={20} /> },
                  { id: 'COD', label: 'Cash on Delivery', icon: <Banknote size={20} /> }
                ].map(opt => (
                  <label key={opt.id} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${payment === opt.id ? 'border-brand-500 bg-orange-50' : 'border-gray-100'}`}>
                    <input type="radio" name="payment" checked={payment === opt.id} onChange={() => setPayment(opt.id)} className="hidden" />
                    <div className="text-brand-500 mr-3">{opt.icon}</div>
                    <span className="font-medium text-gray-800 flex-1">{opt.label}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payment === opt.id ? 'border-brand-500' : 'border-gray-300'}`}>
                      {payment === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />}
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="mt-6 bg-gray-50 p-4 rounded-xl border border-gray-100 border-dashed">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Amount to Pay</span>
                  <span className="text-xl font-black text-gray-900">₹{cart?.total}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 p-4 pb-safe z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {step < 4 ? (
          <Button className="w-full shadow-lg shadow-brand-500/30" size="lg" onClick={() => setStep(step + 1)}>
            Continue
          </Button>
        ) : (
          <Button className="w-full shadow-lg shadow-brand-500/30 text-lg" size="lg" onClick={handlePlaceOrder} isLoading={isLoading}>
            Place Order • ₹{cart?.total}
          </Button>
        )}
      </div>
    </div>
  );
}
