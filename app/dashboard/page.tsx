'use client';

import { useAuth } from '@/app/hooks/useAuth';
import StatsCards from '@/app/components/dashboard/stats-cards';

export default function DashboardPage() {
    const { user } = useAuth();

    const getWelcomeMessage = () => {
        const role = user?.role?.name;
        switch(role) {
            case 'SUPERADMIN':
                return 'Full system control with all permissions';
            case 'ADMIN':
                return 'Administrative access to manage platform operations';
            case 'VENDOR':
                return 'Manage your products, orders and inventory';
            case 'CUSTOMER':
                return 'Browse products and manage your orders';
            default:
                return 'Welcome to your dashboard';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
                <p className="text-gray-600">{getWelcomeMessage()}</p>
            </div>

            <StatsCards />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="text-center py-8">
                        <div className="text-gray-400 mb-3">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-500">No recent activity</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        {user?.role?.name === 'SUPERADMIN' && (
                            <>
                                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="font-medium text-gray-900">Manage Users</div>
                                    <div className="text-sm text-gray-500">View and manage system users</div>
                                </button>
                                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="font-medium text-gray-900">Role Management</div>
                                    <div className="text-sm text-gray-500">Configure roles and permissions</div>
                                </button>
                            </>
                        )}
                        {(user?.role?.name === 'SUPERADMIN' || user?.role?.name === 'ADMIN') && (
                            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="font-medium text-gray-900">System Settings</div>
                                <div className="text-sm text-gray-500">Configure platform settings</div>
                            </button>
                        )}
                        <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="font-medium text-gray-900">View Products</div>
                            <div className="text-sm text-gray-500">Browse all products</div>
                        </button>
                        <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="font-medium text-gray-900">Order Management</div>
                            <div className="text-sm text-gray-500">Process and track orders</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}