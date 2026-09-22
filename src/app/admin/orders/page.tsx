'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminOrdersPage() {
  const { data: orders, error } = useSWR('/api/admin/orders', fetcher);

  if (error) return <div className="p-6">Error loading orders.</div>;
  if (!orders) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Orders</h1>
      
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((o: any) => (
              <tr key={o.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">#{o.orderNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{o.customerName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">₹{o.totalAmount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100">{o.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
