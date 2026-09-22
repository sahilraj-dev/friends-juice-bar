'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MenuManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: products, error, mutate } = useSWR('/api/vendor/products', fetcher);

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

  const deleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await fetch(`/api/vendor/products/${id}`, { method: 'DELETE' });
        mutate();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (error) return <div className="p-6">Error loading menu.</div>;
  if (!products) return <div className="p-6">Loading...</div>;

  const filteredProducts = products.filter((p: any) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-4 sm:p-6 lg:p-8 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <Link href="/vendor/menu/new" className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-500 hover:bg-brand-600">
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product: any) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {product.name}
                          {product.isVeg ? (
                            <span className="ml-2 w-3 h-3 border border-green-600 flex items-center justify-center p-[1px]">
                              <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                            </span>
                          ) : (
                            <span className="ml-2 w-3 h-3 border border-red-600 flex items-center justify-center p-[1px]">
                              <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {product.category?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button 
                      onClick={() => toggleAvailability(product.id, product.isAvailable)}
                      className={`inline-flex items-center p-1 rounded-full ${product.isAvailable ? 'text-green-500' : 'text-gray-400'}`}
                    >
                      {product.isAvailable ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/vendor/menu/${product.id}/edit`} className="text-brand-600 hover:text-brand-900 mr-4">
                      <Edit2 className="w-5 h-5 inline" />
                    </Link>
                    <button onClick={() => deleteProduct(product.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
