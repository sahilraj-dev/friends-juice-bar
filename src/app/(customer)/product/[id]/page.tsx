'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Heart, Clock, AlertCircle } from 'lucide-react';
import useSWR from 'swr';
import { Button, QuantitySelector, Skeleton } from '@/components/ui';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const { data: product, isLoading } = useSWR(`/api/products/${id}`, fetcher, {
    // For demo purposes, provide fallback data if api fails
    fallbackData: {
      id,
      name: 'Oreo Milkshake',
      description: 'Thick shake made with crushed Oreos, vanilla ice cream, and milk. Topped with whipped cream.',
      price: 90,
      rating: 4.8,
      reviewsCount: 124,
      isVeg: true,
      prepTime: 10,
      imageEmoji: '🥤',
      variants: [
        { id: 'v1', name: '350 ML', price: 90 },
        { id: 'v2', name: '500 ML', price: 130 }
      ],
      addons: [
        { id: 'a1', name: 'Extra Chocolate', price: 15 },
        { id: 'a2', name: 'Whipped Cream', price: 20 },
        { id: 'a3', name: 'Ice Cream Scoop', price: 30 }
      ]
    }
  });

  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0]?.id);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col p-4 space-y-4">
        <Skeleton className="w-full h-[250px] rounded-3xl" />
        <Skeleton className="w-3/4 h-8" />
        <Skeleton className="w-1/4 h-6" />
        <Skeleton className="w-full h-24" />
      </div>
    );
  }

  if (!product) return <div>Product not found</div>;

  const currentVariant = product.variants?.find((v: any) => v.id === selectedVariant);
  const basePrice = currentVariant ? currentVariant.price : product.price;
  
  const addonsTotal = product.addons?.reduce((sum: number, addon: any) => {
    return selectedAddons.includes(addon.id) ? sum + addon.price : sum;
  }, 0) || 0;

  const totalPrice = (basePrice + addonsTotal) * quantity;

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await fetch('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant,
          addonIds: selectedAddons,
          instructions,
          quantity
        })
      });
      router.back();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-[100px]">
      {/* Header Image Area */}
      <div className="relative h-[280px] w-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center rounded-b-[40px] shadow-sm">
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <button onClick={() => router.back()} className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-700 shadow-sm">
            <ArrowLeft size={24} />
          </button>
          <button onClick={() => setIsFavorite(!isFavorite)} className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-700 shadow-sm">
            <Heart size={20} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
          </button>
        </div>
        <span className="text-8xl drop-shadow-xl">{product.imageEmoji || '🍔'}</span>
      </div>

      <div className="p-6 flex-1 -mt-6 bg-white rounded-t-[40px] relative z-10">
        {/* Title & Meta */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-4 h-4 rounded-sm border-2 ${product.isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center`}>
                <div className={`w-2 h-2 rounded-full ${product.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
              </div>
              <span className="text-yellow-400 flex items-center text-sm font-bold">
                ⭐ {product.rating} <span className="text-gray-400 font-medium ml-1">({product.reviewsCount})</span>
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>
          </div>
          <div className="text-right ml-4">
            <div className="text-2xl font-black text-brand-500">₹{basePrice}</div>
          </div>
        </div>

        <p className="text-gray-500 text-sm leading-relaxed mb-4">
          {product.description}
        </p>

        <div className="flex items-center space-x-2 text-sm font-medium text-gray-600 bg-orange-50 px-3 py-2 rounded-lg inline-flex mb-6">
          <Clock size={16} className="text-orange-500" />
          <span>Prep time: ~{product.prepTime} mins</span>
        </div>

        <div className="w-full h-px bg-gray-100 mb-6" />

        {/* Size Selector */}
        {product.variants && product.variants.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Choose Size</h3>
            <div className="space-y-3">
              {product.variants.map((variant: any) => (
                <label key={variant.id} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors cursor-pointer ${selectedVariant === variant.id ? 'border-brand-500 bg-orange-50' : 'border-gray-100 bg-white hover:border-orange-100'}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedVariant === variant.id ? 'border-brand-500' : 'border-gray-300'}`}>
                      {selectedVariant === variant.id && <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />}
                    </div>
                    <span className="font-semibold text-gray-800">{variant.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">₹{variant.price}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Addons */}
        {product.addons && product.addons.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Add-ons</h3>
            <div className="space-y-3">
              {product.addons.map((addon: any) => {
                const isSelected = selectedAddons.includes(addon.id);
                return (
                  <label key={addon.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-brand-500 border-brand-500' : 'border-gray-300'}`}>
                        {isSelected && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span className="font-medium text-gray-700">{addon.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">+₹{addon.price}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Special Instructions */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
            <AlertCircle size={18} className="mr-2 text-gray-400" /> Special Instructions
          </h3>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="E.g. Less ice, extra sweet..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none h-24"
          />
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 p-4 pb-safe flex items-center space-x-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
        <QuantitySelector 
          value={quantity} 
          onChange={setQuantity}
          className="scale-110 origin-left"
        />
        <Button 
          className="flex-1 shadow-lg shadow-brand-500/30"
          size="lg"
          onClick={handleAddToCart}
          isLoading={isAdding}
        >
          <div className="flex items-center justify-between w-full px-2">
            <span>Add to Cart</span>
            <span className="font-bold">₹{totalPrice}</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
