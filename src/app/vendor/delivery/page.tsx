'use client';

import useSWR from 'swr';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DeliveryLocationsPage() {
  const { data: locations, error, mutate } = useSWR('/api/vendor/delivery-locations', fetcher);

  if (error) return <div className="p-6">Error loading locations.</div>;
  if (!locations) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Locations</h1>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-500 hover:bg-brand-600">
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Location
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc: any) => (
          <div key={loc.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm relative">
            <div className="absolute top-4 right-4 flex space-x-2">
              <button className="text-gray-400 hover:text-brand-600"><Edit2 className="h-4 w-4" /></button>
              <button className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">{loc.icon || '📍'}</span>
              <h3 className="text-lg font-medium text-gray-900">{loc.name}</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">{loc.description}</p>
            <div className="flex justify-between items-center text-sm">
              <span className={`px-2 py-1 rounded-full ${loc.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {loc.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
