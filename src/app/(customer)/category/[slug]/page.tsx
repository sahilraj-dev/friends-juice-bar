'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import useSWR from 'swr';
import { ProductCard } from '@/components/customer/ProductCard';
import { Skeleton, BottomSheet } from '@/components/ui';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [sort, setSort] = useState('popular');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const { data: categoryData } = useSWR(`/api/categories/${slug}`, fetcher);
  const { data: productsData, isLoading } = useSWR(`/api/products?category=${slug}&sort=${sort}`, fetcher);

  const categoryName = categoryData?.name || (slug.charAt(0).toUpperCase() + slug.slice(1));

  const sortOptions = [
    { id: 'popular', label: 'Popular' },
    { id: 'price-asc', label: 'Price: Low to High' },
    { id: 'price-desc', label: 'Price: High to Low' }
  ];

  return (
    <div className="min-h-screen bg-cream flex flex-col pb-20">
      {/* Header */}
      <header className="bg-white px-4 py-4 shadow-sm z-10 sticky top-0 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={() => router.back()} className="p-2 text-gray-600 hover:bg-gray-50 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">{categoryName}</h1>
        </div>
        <button 
          onClick={() => setIsSortOpen(true)}
          className="p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center"
        >
          <SlidersHorizontal size={20} />
        </button>
      </header>

      {/* Main Content */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-[220px] rounded-2xl" />)
          ) : (
            (productsData?.products || []).map((p: any) => (
              <div key={p.id} className="w-full">
                <ProductCard product={{...p, className: 'w-full min-w-0'}} />
              </div>
            ))
          )}
        </div>
        
        {!isLoading && productsData?.products?.length === 0 && (
          <div className="col-span-2 text-center py-20 text-gray-500">
            No items found in this category.
          </div>
        )}
      </div>

      <BottomSheet isOpen={isSortOpen} onClose={() => setIsSortOpen(false)}>
        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Sort By</h3>
          <div className="space-y-3">
            {sortOptions.map(option => (
              <button
                key={option.id}
                onClick={() => {
                  setSort(option.id);
                  setIsSortOpen(false);
                }}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${sort === option.id ? 'border-brand-500 bg-orange-50' : 'border-gray-100 bg-white'}`}
              >
                <span className={`font-medium ${sort === option.id ? 'text-brand-700' : 'text-gray-700'}`}>
                  {option.label}
                </span>
                {sort === option.id && (
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
