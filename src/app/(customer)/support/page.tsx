'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Mail, Phone, ChevronDown, Send } from 'lucide-react';
import { Button, Input } from '@/components/ui';

export default function SupportPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: 'How can I track my order?', a: 'You can track your order in real-time by navigating to the Orders tab and clicking on "Track" for your active order.' },
    { q: 'Can I cancel my order?', a: 'Orders can only be cancelled before food preparation begins (usually within 1-2 minutes of placing the order). Go to Order Details to check if cancellation is available.' },
    { q: 'What payment methods are accepted?', a: 'We accept UPI (Google Pay, PhonePe, Paytm, etc.) and Cash on Delivery (COD).' },
    { q: 'I received the wrong item. What should I do?', a: 'We apologize for the inconvenience. Please raise a support ticket below with your Order ID, and we will resolve it immediately.' }
  ];

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-brand-500 px-4 py-4 z-10 sticky top-0 flex items-center text-white shadow-md">
        <button onClick={() => router.back()} className="p-2 text-white hover:bg-white/10 rounded-full mr-3">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Help & Support</h1>
      </header>

      <div className="flex-1 pb-6">
        {/* Contact Info Header */}
        <div className="bg-brand-500 px-5 pt-2 pb-10 rounded-b-[40px] text-white">
          <p className="text-orange-100 text-sm mb-6">How can we help you today?</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col items-center justify-center text-center">
              <Phone className="mb-2" size={24} />
              <p className="text-xs font-semibold mb-1">Call Us</p>
              <p className="text-[10px] text-orange-200">10AM - 10PM</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col items-center justify-center text-center">
              <Mail className="mb-2" size={24} />
              <p className="text-xs font-semibold mb-1">Email</p>
              <p className="text-[10px] text-orange-200">help@friendsjuice.com</p>
            </div>
          </div>
        </div>

        <div className="px-5 -mt-6 space-y-6">
          {/* Ticket Form */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <MessageSquare size={20} className="mr-2 text-brand-500" /> Send a Message
            </h3>
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Order ID (Optional)</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-500">
                  <option value="">Select an order</option>
                  <option value="ORD12345">ORD12345 - Today</option>
                  <option value="ORD12340">ORD12340 - Yesterday</option>
                </select>
              </div>
              <Input placeholder="Subject" />
              <textarea
                placeholder="Describe your issue in detail..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-500 resize-none h-32"
              />
              <Button className="w-full" size="md">
                <Send size={16} className="mr-2" /> Submit Ticket
              </Button>
            </form>
          </div>

          {/* FAQs */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 text-lg px-2">Frequently Asked Questions</h3>
            <div className="bg-white rounded-3xl p-2 shadow-sm">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-100 last:border-0">
                  <button 
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-semibold text-gray-800 text-sm pr-4">{faq.q}</span>
                    <ChevronDown size={20} className={`text-gray-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === index && (
                    <div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed animate-in fade-in slide-in-from-top-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
