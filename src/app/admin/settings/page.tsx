'use client';

export default function AdminSettingsPage() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Settings</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form className="space-y-6 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700">Platform Name</label>
            <input type="text" defaultValue="Friends Juice Bar" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Support Email</label>
            <input type="email" defaultValue="support@friendsjuicebar.com" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">System Announcement</label>
            <textarea rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" placeholder="Show a banner to all users..." />
          </div>
          <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}
