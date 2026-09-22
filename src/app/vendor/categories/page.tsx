'use client';

import useSWR from 'swr';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CategoriesPage() {
  const { data: categories, error, mutate } = useSWR('/api/vendor/categories', fetcher);

  const deleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await fetch(`/api/vendor/categories/${id}`, { method: 'DELETE' });
        mutate();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (error) return <div className="p-6">Error loading categories.</div>;
  if (!categories) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-500 hover:bg-brand-600">
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Category
        </button>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {categories.map((cat: any) => (
            <li key={cat.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center">
                {cat.icon && <span className="text-2xl mr-3">{cat.icon}</span>}
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{cat.name}</h3>
                  <p className="text-sm text-gray-500">{cat._count?.products || 0} products</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button className="text-gray-400 hover:text-brand-600"><Edit2 className="h-5 w-5" /></button>
                <button onClick={() => deleteCategory(cat.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-5 w-5" /></button>
              </div>
            </li>
          ))}
          {categories.length === 0 && (
            <li className="p-6 text-center text-gray-500">No categories found.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
