'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { Package, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function InventoryPage() {
  const { data: products, error, mutate } = useSWR('/api/vendor/products', fetcher);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/vendor/products/${id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentStatus })
      });
      mutate();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllUnavailable = async () => {
    if (confirm('EMERGENCY: Are you sure you want to mark ALL products as unavailable? This will stop all new orders.')) {
      setIsUpdating(true);
      try {
        await fetch('/api/vendor/inventory/disable-all', { method: 'POST' });
        mutate();
      } catch (err) {
        console.error(err);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  if (error) return <div className="p-6">Error loading inventory.</div>;
  if (!products) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quick Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Toggle item availability to temporarily hide them from customers.</p>
        </div>
        <button 
          onClick={markAllUnavailable}
          disabled={isUpdating}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-red-200 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
        >
          <AlertTriangle className="-ml-1 mr-2 h-4 w-4" />
          Mark All Unavailable
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product: any) => (
          <div key={product.id} className={`flex items-center justify-between p-4 rounded-lg border ${product.isAvailable ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300'}`}>
            <div className="flex items-center">
              <Package className={`w-5 h-5 mr-3 ${product.isAvailable ? 'text-gray-400' : 'text-gray-300'}`} />
              <div>
                <p className={`font-medium ${product.isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>{product.name}</p>
                <p className="text-xs text-gray-500">{product.category?.name || 'Item'}</p>
              </div>
            </div>
            <button 
              onClick={() => toggleAvailability(product.id, product.isAvailable)}
              className={`p-1 rounded-full focus:outline-none ${product.isAvailable ? 'text-green-500' : 'text-gray-400'}`}
            >
              {product.isAvailable ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
