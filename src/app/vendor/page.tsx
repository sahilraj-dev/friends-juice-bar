'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { 
  IndianRupee, 
  ShoppingBag, 
  TrendingUp, 
  Clock,
  Plus,
  ListOrdered,
  ChefHat,
  Package
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function VendorDashboard() {
  const { data, error, isLoading } = useSWR('/api/analytics/overview', fetcher);

  if (error) return <div className="p-6 text-red-500">Failed to load dashboard data.</div>;
  if (isLoading) return <div className="p-6">Loading dashboard...</div>;

  const stats = data?.stats || {
    todayOrders: 0,
    revenue: 0,
    avgOrderValue: 0,
    pending: 0,
    preparing: 0,
    ready: 0,
    delivered: 0
  };

  const recentOrders = data?.recentOrders || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link href="/vendor/menu/new" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-500 hover:bg-brand-600">
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Product
          </Link>
          <Link href="/vendor/orders" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <ListOrdered className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            View Orders
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div className="flex items-center text-gray-500 mb-2">
            <ShoppingBag className="h-5 w-5 mr-2 text-orange-500" />
            <span className="text-sm font-medium">Today's Orders</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.todayOrders}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div className="flex items-center text-gray-500 mb-2">
            <IndianRupee className="h-5 w-5 mr-2 text-green-500" />
            <span className="text-sm font-medium">Revenue</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">₹{stats.revenue}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div className="flex items-center text-gray-500 mb-2">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
            <span className="text-sm font-medium">Avg Order Value</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">₹{stats.avgOrderValue}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div className="flex items-center text-gray-500 mb-2">
            <Clock className="h-5 w-5 mr-2 text-purple-500" />
            <span className="text-sm font-medium">Current Status</span>
          </div>
          <div className="flex space-x-4 text-sm mt-1">
            <div className="flex flex-col"><span className="text-gray-500 text-xs">Pending</span><span className="font-bold text-red-600">{stats.pending}</span></div>
            <div className="flex flex-col"><span className="text-gray-500 text-xs">Prep</span><span className="font-bold text-orange-600">{stats.preparing}</span></div>
            <div className="flex flex-col"><span className="text-gray-500 text-xs">Ready</span><span className="font-bold text-green-600">{stats.ready}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm border border-gray-100 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
              <Link href="/vendor/orders" className="text-sm text-brand-500 hover:text-brand-600 font-medium">View all</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No orders yet today.</div>
              ) : (
                recentOrders.map((order: any) => (
                  <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-gray-900">#{order.orderNumber}</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        order.status === 'PENDING' ? 'bg-red-100 text-red-800' :
                        order.status === 'PREPARING' ? 'bg-orange-100 text-orange-800' :
                        order.status === 'READY' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      {order.customerName} • {order.itemsCount} items
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-gray-900">₹{order.totalAmount}</div>
                      <Link href={`/vendor/orders/${order.id}`} className="text-sm text-brand-500 hover:text-brand-600">Details</Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-brand-50 rounded-lg p-6 border border-brand-100">
            <h3 className="text-lg font-medium text-brand-900 mb-2">Quick Actions</h3>
            <div className="space-y-3 mt-4">
              <Link href="/vendor/kitchen" className="flex items-center p-3 bg-white rounded-md shadow-sm border border-brand-200 hover:border-brand-300 transition-colors">
                <ChefHat className="h-5 w-5 text-brand-500 mr-3" />
                <span className="font-medium text-gray-800">Kitchen Display</span>
              </Link>
              <Link href="/vendor/inventory" className="flex items-center p-3 bg-white rounded-md shadow-sm border border-brand-200 hover:border-brand-300 transition-colors">
                <Package className="h-5 w-5 text-brand-500 mr-3" />
                <span className="font-medium text-gray-800">Update Inventory</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
