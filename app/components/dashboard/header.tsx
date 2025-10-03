// components/dashboard/header.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';

export default function DashboardHeader() {
  const { user, logout, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  const getDashboardTitle = () => {
    const role = user?.role?.name;
    switch(role) {
      case 'SUPERADMIN':
        return 'Super Admin Dashboard';
      case 'ADMIN':
        return 'Admin Dashboard';
      case 'VENDOR':
        return 'Vendor Dashboard';
      case 'CUSTOMER':
        return 'Customer Dashboard';
      default:
        return 'Dashboard';
    }
  };

  return (
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex justify-between items-center py-4 px-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getDashboardTitle()}</h1>
            <p className="text-gray-600">
              Welcome back, {user?.name} ({user?.role?.name})
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button
                onClick={handleLogout}
                disabled={isLoggingOut || loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              {isLoggingOut ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Logging out...</span>
                  </>
              ) : (
                  <span>Logout</span>
              )}
            </button>
          </div>
        </div>
      </header>
  );
}