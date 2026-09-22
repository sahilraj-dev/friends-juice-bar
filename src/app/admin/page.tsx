'use client';

import useSWR from 'swr';
import { Users, Store, ShoppingCart, IndianRupee } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminDashboard() {
  const { data, error } = useSWR('/api/admin/stats', fetcher);

  // Fallback data if API not fully implemented yet
  const stats = data || {
    totalUsers: 1250,
    totalVendors: 1,
    totalOrders: 3450,
    totalRevenue: 450000
  };

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center text-gray-500 mb-4">
            <Users className="h-6 w-6 mr-3 text-blue-500" />
            <span className="text-base font-medium">Total Users</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center text-gray-500 mb-4">
            <Store className="h-6 w-6 mr-3 text-indigo-500" />
            <span className="text-base font-medium">Total Vendors</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalVendors}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center text-gray-500 mb-4">
            <ShoppingCart className="h-6 w-6 mr-3 text-orange-500" />
            <span className="text-base font-medium">Total Orders</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalOrders}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center text-gray-500 mb-4">
            <IndianRupee className="h-6 w-6 mr-3 text-green-500" />
            <span className="text-base font-medium">Total Revenue</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">System Activity</h2>
        </div>
        <div className="p-6 text-center text-gray-500">
          Activity feed will be displayed here.
        </div>
      </div>
    </div>
  );
}
