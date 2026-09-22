'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart } from 'lucide-react';
import useSWR from 'swr';
import { ProductCard } from '@/components/customer/ProductCard';
import { Skeleton, EmptyState } from '@/components/ui';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function FavoritesPage() {
  const router = useRouter();
  
  const { data, isLoading } = useSWR('/api/favorites', fetcher, {
    fallbackData: {
      favorites: [
        { id: '1', name: 'Oreo Milkshake', description: 'Thick shake with crushed oreos', price: 90, rating: 4.8, isVeg: true, bestseller: true },
        { id: '2', name: 'Masala Fries', description: 'Crispy potato fries', price: 60, rating: 4.4, isVeg: true }
      ]
    }
  });

  return (
    <div className="min-h-screen bg-cream flex flex-col pb-6">
      <header className="bg-white px-4 py-4 shadow-sm z-10 sticky top-0 flex items-center">
        <button onClick={() => router.back()} className="p-2 text-gray-600 hover:bg-gray-50 rounded-full mr-3">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Favorites</h1>
      </header>

      <div className="p-5">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[220px] rounded-2xl" />)}
          </div>
        ) : data?.favorites?.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {data.favorites.map((p: any) => (
              <div key={p.id} className="w-full">
                <ProductCard product={{...p, className: 'w-full min-w-0'}} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-20">
            <EmptyState 
              icon={<Heart size={40} className="text-red-500 fill-red-500/20" />}
              title="No favorites yet"
              description="Save your favourite items here ❤️"
            />
          </div>
        )}
      </div>
    </div>
  );
}
