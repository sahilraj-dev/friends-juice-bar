'use client';

import { useState } from 'react';
import { Save, Bell, Clock, Building2 } from 'lucide-react';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    storeName: 'Friends Juice Bar',
    phone: '+91 9876543210',
    description: 'Fresh juices, smoothies and healthy snacks.',
    minOrderAmount: '100',
    deliveryFee: '20',
    freeDeliveryThreshold: '500',
    taxRate: '5',
    defaultPrepTime: '15',
    isHolidayMode: false,
    soundNotifications: true
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // API call simulation
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Store Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <Building2 className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Store Information</h3>
            </div>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Store Name</label>
                <input type="text" name="storeName" value={formData.storeName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500 sm:text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500 sm:text-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <Clock className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Ordering & Delivery</h3>
            </div>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Minimum Order Amount (₹)</label>
                <input type="number" name="minOrderAmount" value={formData.minOrderAmount} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Delivery Fee (₹)</label>
                <input type="number" name="deliveryFee" value={formData.deliveryFee} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Free Delivery Above (₹)</label>
                <input type="number" name="freeDeliveryThreshold" value={formData.freeDeliveryThreshold} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Prep Time (mins)</label>
                <input type="number" name="defaultPrepTime" value={formData.defaultPrepTime} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500 sm:text-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <Bell className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Preferences</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input id="soundNotifications" name="soundNotifications" type="checkbox" checked={formData.soundNotifications} onChange={handleChange} className="focus:ring-brand-500 h-4 w-4 text-brand-600 border-gray-300 rounded" />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="soundNotifications" className="font-medium text-gray-700">Sound Notifications</label>
                  <p className="text-gray-500">Play a beep sound when a new order arrives.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input id="isHolidayMode" name="isHolidayMode" type="checkbox" checked={formData.isHolidayMode} onChange={handleChange} className="focus:ring-brand-500 h-4 w-4 text-brand-600 border-gray-300 rounded" />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="isHolidayMode" className="font-medium text-gray-700">Holiday Mode</label>
                  <p className="text-gray-500">Temporarily stop accepting any new orders.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
            <Save className="-ml-1 mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
