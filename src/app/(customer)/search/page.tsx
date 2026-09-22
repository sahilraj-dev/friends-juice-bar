'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon, ArrowLeft, Clock, X, TrendingUp } from 'lucide-react';
import useSWR from 'swr';
import { ProductCard } from '@/components/customer/ProductCard';
import { EmptyState, Skeleton } from '@/components/ui';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  }, [recentSearches]);

  const { data, isLoading } = useSWR(
    debouncedQuery ? `/api/products?search=${encodeURIComponent(debouncedQuery)}` : null,
    fetcher
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    saveRecentSearch(query);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const popularSearches = ['Mango Shake', 'Cold Coffee', 'Chaat'];

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="bg-white px-4 py-4 shadow-sm z-10 sticky top-0 flex items-center space-x-3">
        <button onClick={() => router.back()} className="p-2 text-gray-600 hover:bg-gray-50 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <form onSubmit={handleSearch} className="flex-1 relative">
          <SearchIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search food & drinks..."
            className="w-full bg-gray-100 rounded-xl py-3 pl-10 pr-10 outline-none text-sm font-medium focus:ring-2 focus:ring-brand-500"
          />
          {query && (
            <button 
              type="button" 
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </form>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-5 overflow-y-auto">
        {!debouncedQuery ? (
          <div className="space-y-8">
            {recentSearches.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center">
                    <Clock size={18} className="mr-2 text-gray-400" /> Recent Searches
                  </h3>
                  <button onClick={clearRecent} className="text-xs font-semibold text-brand-500">Clear</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map(term => (
                    <button 
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-bold text-gray-900 flex items-center mb-4">
                <TrendingUp size={18} className="mr-2 text-brand-500" /> Popular Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map(term => (
                  <button 
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-4 py-2 bg-orange-50 border border-orange-100 rounded-full text-sm font-medium text-brand-700"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[220px] rounded-2xl" />)}
          </div>
        ) : data?.products?.length > 0 ? (
          <div>
            <p className="text-sm text-gray-500 mb-4 font-medium">Found {data.products.length} results</p>
            <div className="grid grid-cols-2 gap-4">
              {data.products.map((p: any) => (
                <div key={p.id} className="w-full">
                  <ProductCard product={{...p, className: 'w-full min-w-0'}} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-20">
            <EmptyState 
              icon={<SearchIcon size={40} />}
              title="No results found"
              description={`We couldn't find anything matching "${debouncedQuery}". Try searching for something else.`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
