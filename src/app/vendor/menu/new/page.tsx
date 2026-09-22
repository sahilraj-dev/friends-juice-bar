'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CreateProductPage() {
  const router = useRouter();
  const { data: categories } = useSWR('/api/vendor/categories', fetcher);
  
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    price: '',
    prepTime: '15',
    isVeg: true,
    isAvailable: true,
    isFeatured: false,
    calories: '',
    variants: [] as any[],
    addons: [] as any[]
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/vendor/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          prepTime: parseInt(formData.prepTime),
          calories: formData.calories ? parseInt(formData.calories) : null
        })
      });
      if (res.ok) {
        router.push('/vendor/menu');
      } else {
        alert('Error creating product');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link href="/vendor/menu" className="mr-4 p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Product Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select name="categoryId" required value={formData.categoryId} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500">
                <option value="">Select Category</option>
                {categories?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Base Price (₹)</label>
              <input type="number" name="price" required min="0" step="0.01" value={formData.price} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Prep Time (mins)</label>
              <input type="number" name="prepTime" value={formData.prepTime} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Calories (optional)</label>
              <input type="number" name="calories" value={formData.calories} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Properties</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input id="isVeg" name="isVeg" type="checkbox" checked={formData.isVeg} onChange={handleChange} className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded" />
              <label htmlFor="isVeg" className="ml-2 block text-sm text-gray-900">Vegetarian</label>
            </div>
            <div className="flex items-center">
              <input id="isFeatured" name="isFeatured" type="checkbox" checked={formData.isFeatured} onChange={handleChange} className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded" />
              <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">Featured Product (shows on home page)</label>
            </div>
            <div className="flex items-center">
              <input id="isAvailable" name="isAvailable" type="checkbox" checked={formData.isAvailable} onChange={handleChange} className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded" />
              <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">Available (in stock)</label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Link href="/vendor/menu" className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
