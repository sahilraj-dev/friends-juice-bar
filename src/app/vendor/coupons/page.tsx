'use client';

import useSWR from 'swr';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CouponsPage() {
  const { data: coupons, error, mutate } = useSWR('/api/vendor/coupons', fetcher);

  if (error) return <div className="p-6">Error loading coupons.</div>;
  if (!coupons) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-500 hover:bg-brand-600">
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Coupon
        </button>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {coupons.map((coupon: any) => (
              <tr key={coupon.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-brand-600">{coupon.code}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `₹${coupon.value}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {coupon.usageCount} / {coupon.usageLimit || '∞'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-400 hover:text-brand-600 mr-3"><Edit2 className="h-5 w-5" /></button>
                  <button className="text-gray-400 hover:text-red-600"><Trash2 className="h-5 w-5" /></button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No coupons found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
