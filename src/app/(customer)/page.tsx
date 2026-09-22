'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, MapPin, ChevronRight, Search as SearchIcon } from 'lucide-react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { BottomSheet, Skeleton } from '@/components/ui';
import { ProductCard } from '@/components/customer/ProductCard';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Girls Hostel Gate');

  const { data: categories, isLoading: catLoading } = useSWR('/api/categories', fetcher);
  const { data: popularProducts, isLoading: popLoading } = useSWR('/api/products?bestseller=true', fetcher);
  const { data: featuredProducts, isLoading: featLoading } = useSWR('/api/products?featured=true', fetcher);
  const { data: deliveryLocations } = useSWR('/api/vendor/delivery-locations', fetcher);

  const userName = session?.user?.name?.split(' ')[0] || 'Guest';

  return (
    <div className="pb-6">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 bg-white rounded-b-3xl shadow-sm z-10 relative">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-brand-600 font-bold text-lg">
              {userName.charAt(0)}
            </div>
            <div>
              <p className="text-xs text-gray-500">Good Morning 👋</p>
              <h1 className="text-lg font-bold text-gray-900">{userName}</h1>
            </div>
          </div>
          <Link href="/notifications" className="relative p-2 text-gray-600 bg-gray-50 rounded-full">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </Link>
        </div>

        {/* Location Selector */}
        <button 
          onClick={() => setIsLocationOpen(true)}
          className="flex items-center space-x-2 text-left w-full mb-5"
        >
          <div className="p-1.5 bg-orange-100 text-brand-500 rounded-full">
            <MapPin size={16} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-medium">Deliver to</p>
            <p className="text-sm font-bold text-gray-900 flex items-center">
              {selectedLocation} <ChevronRight size={14} className="ml-1 text-gray-400" />
            </p>
          </div>
        </button>

        {/* Search Bar */}
        <div 
          onClick={() => router.push('/search')}
          className="bg-gray-100 rounded-2xl p-3.5 flex items-center space-x-3 text-gray-500 cursor-text"
        >
          <SearchIcon size={20} className="text-gray-400" />
          <span className="text-sm font-medium">Search food & drinks...</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-5 mt-6 space-y-8">
        
        {/* Promo Banner */}
        <div className="bg-gradient-to-r from-brand-500 to-orange-400 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <span className="bg-white/20 px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm inline-block mb-2">PROMO</span>
            <h2 className="text-xl font-bold mb-1">50% off on first order!</h2>
            <p className="text-sm opacity-90 mb-3">Use code FIRST50 at checkout</p>
            <button className="bg-white text-brand-600 text-xs font-bold px-4 py-2 rounded-xl shadow-sm">
              Claim Now
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 text-8xl opacity-20 transform -rotate-12">🍔</div>
        </div>

        {/* Categories */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 text-lg">Categories</h3>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
            {catLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col items-center space-y-2 min-w-[72px]">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <Skeleton className="w-12 h-3" />
                </div>
              ))
            ) : (
              (categories || [{id: 1, name: 'Shakes', slug: 'shakes', emoji: '🥤'}, {id: 2, name: 'Juices', slug: 'juices', emoji: '🍹'}, {id: 3, name: 'Snacks', slug: 'snacks', emoji: '🥪'}, {id: 4, name: 'Coffee', slug: 'coffee', emoji: '☕'}]).map((cat: any) => (
                <Link key={cat.id} href={`/category/${cat.slug}`} className="flex flex-col items-center space-y-2 min-w-[72px]">
                  <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-3xl border border-gray-100">
                    {cat.emoji}
                  </div>
                  <span className="text-xs font-medium text-gray-700">{cat.name}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Popular Picks */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 text-lg">Popular Picks 🔥</h3>
            <Link href="/category/popular" className="text-sm font-semibold text-brand-500">See all</Link>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-4 pt-1 scrollbar-hide -mx-5 px-5">
            {popLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="w-[160px] h-[220px] rounded-2xl" />)
            ) : (
              (popularProducts?.products || [
                { id: '1', name: 'Oreo Shake', description: 'Thick shake with crushed oreos', price: 90, rating: 4.8, isVeg: true, bestseller: true },
                { id: '2', name: 'Cold Coffee', description: 'Classic frappe', price: 80, rating: 4.5, isVeg: true, popular: true }
              ]).map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))
            )}
          </div>
        </div>

        {/* Featured */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 text-lg">Featured Items</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {featLoading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[220px] rounded-2xl" />)
            ) : (
              (featuredProducts?.products || [
                { id: '3', name: 'Mixed Fruit Juice', description: 'Fresh fruits', price: 60, rating: 4.2, isVeg: true },
                { id: '4', name: 'Cheese Sandwich', description: 'Grilled to perfection', price: 70, rating: 4.6, isVeg: true },
                { id: '5', name: 'Mango Shake', description: 'Seasonal special', price: 100, rating: 4.9, isVeg: true, bestseller: true },
                { id: '6', name: 'Masala Fries', description: 'Crispy potato fries', price: 60, rating: 4.4, isVeg: true }
              ]).map((p: any) => (
                <div key={p.id} className="w-full">
                  <ProductCard product={{...p, className: 'w-full min-w-0'}} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Location Bottom Sheet */}
      <BottomSheet isOpen={isLocationOpen} onClose={() => setIsLocationOpen(false)}>
        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Select Delivery Location</h3>
          <div className="space-y-3">
            {(deliveryLocations || ['Girls Hostel Gate', 'Boys Hostel Gate', 'Library', 'Main Canteen']).map((loc: string) => (
              <button 
                key={loc}
                onClick={() => {
                  setSelectedLocation(loc);
                  setIsLocationOpen(false);
                }}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${selectedLocation === loc ? 'border-brand-500 bg-orange-50' : 'border-gray-100 bg-white hover:border-brand-200'}`}
              >
                <div className="flex items-center space-x-3">
                  <MapPin size={20} className={selectedLocation === loc ? 'text-brand-500' : 'text-gray-400'} />
                  <span className={`font-medium ${selectedLocation === loc ? 'text-brand-700' : 'text-gray-700'}`}>{loc}</span>
                </div>
                {selectedLocation === loc && (
                  <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
