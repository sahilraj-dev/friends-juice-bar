'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Plus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  isVeg: boolean;
  bestseller?: boolean;
  popular?: boolean;
  categorySlug?: string;
}

export const ProductCard = ({ product }: { product: Product }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await fetch('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, quantity: 1 })
      });
      // Trigger toast or global cart update here
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link href={`/product/${product.id}`} className="block w-[160px] min-w-[160px] bg-white rounded-2xl shadow-card overflow-hidden flex flex-col relative">
      <button 
        onClick={toggleFavorite}
        className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 transition-colors"
      >
        <Heart size={18} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
      </button>
      
      <div className="h-32 w-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center relative">
        <span className="text-5xl">🥤</span>
        {(product.bestseller || product.popular) && (
          <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500 text-white shadow-sm">
            {product.bestseller ? 'BESTSELLER' : 'POPULAR'}
          </span>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-center space-x-1 mb-1">
          <div className={`w-3 h-3 rounded-sm border ${product.isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center`}>
            <div className={`w-1.5 h-1.5 rounded-full ${product.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
          </div>
          <span className="text-xs font-semibold text-gray-800 line-clamp-1">{product.name}</span>
        </div>
        
        <p className="text-[10px] text-gray-500 line-clamp-1 mb-1">{product.description}</p>
        
        <div className="flex items-center text-xs text-gray-600 mb-2">
          <span className="text-yellow-400 mr-1">⭐</span> {product.rating}
        </div>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="font-bold text-gray-900">₹{product.price}</span>
          <button 
            onClick={handleAdd}
            disabled={isAdding}
            className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center hover:bg-orange-600 shadow-sm disabled:opacity-50"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
};
