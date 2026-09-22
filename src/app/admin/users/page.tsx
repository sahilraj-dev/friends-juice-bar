'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { Search, MoreVertical, Shield, UserX, UserCheck } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function UsersManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: users, error, mutate } = useSWR('/api/admin/users', fetcher);

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      await fetch(`/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' })
      });
      mutate();
    } catch (err) {
      console.error(err);
    }
  };

  const changeRole = async (id: string, role: string) => {
    try {
      await fetch(`/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      mutate();
    } catch (err) {
      console.error(err);
    }
  };

  if (error) return <div className="p-6">Error loading users.</div>;
  
  // mock fallback for now
  const displayUsers = users || [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'USER', status: 'ACTIVE' },
    { id: '2', name: 'Vendor 1', email: 'vendor@example.com', role: 'VENDOR', status: 'ACTIVE' },
    { id: '3', name: 'Admin', email: 'admin@example.com', role: 'ADMIN', status: 'ACTIVE' }
  ];

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayUsers.map((user: any) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name || 'No Name'}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select 
                      value={user.role} 
                      onChange={(e) => changeRole(user.id, e.target.value)}
                      className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="USER">USER</option>
                      <option value="VENDOR">VENDOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => toggleStatus(user.id, user.status)}
                      className={`text-${user.status === 'ACTIVE' ? 'red' : 'green'}-600 hover:text-${user.status === 'ACTIVE' ? 'red' : 'green'}-900 flex items-center justify-end w-full`}
                    >
                      {user.status === 'ACTIVE' ? (
                        <><UserX className="w-4 h-4 mr-1" /> Suspend</>
                      ) : (
                        <><UserCheck className="w-4 h-4 mr-1" /> Activate</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
