'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Check, Navigation, MapPin } from 'lucide-react';
import { Button } from '@/components/ui';

export default function OrderConfirmedPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Small delay to trigger animation
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-brand-500 flex flex-col items-center justify-center p-6 text-white text-center">
      
      <div className={`transition-all duration-700 transform ${show ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
          <Check size={64} className="text-fresh-500" strokeWidth={3} />
        </div>
        
        <h1 className="text-3xl font-black mb-2">ORDER PLACED!</h1>
        <p className="text-orange-100 font-medium mb-8 text-lg">Order #{id}</p>
        
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-8 w-full max-w-sm mx-auto border border-white/20">
          <div className="flex items-center justify-center space-x-2 text-orange-100 mb-2">
            <Navigation size={18} />
            <span className="font-medium">Estimated Time</span>
          </div>
          <div className="text-4xl font-bold mb-6">15-25 min</div>
          
          <div className="h-px w-full bg-white/20 mb-6" />
          
          <div className="flex items-center justify-center space-x-2 text-sm text-white">
            <MapPin size={16} className="text-orange-200" />
            <span>Delivering to: <span className="font-bold">Girls Hostel Gate</span></span>
          </div>
        </div>
      </div>
      
      <div className={`w-full max-w-sm space-y-4 transition-all duration-700 delay-300 transform ${show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <Button 
          variant="secondary" 
          className="w-full bg-white text-brand-600 hover:bg-gray-50 border-none" 
          size="lg"
          onClick={() => router.push(`/orders/${id}`)}
        >
          Track Order
        </Button>
        <Button 
          variant="ghost" 
          className="w-full text-white hover:bg-white/10 border border-white/30" 
          size="lg"
          onClick={() => router.push('/')}
        >
          Back to Home
        </Button>
      </div>
      
      {/* Confetti effect background layer could go here */}
    </div>
  );
}
