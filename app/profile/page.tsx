// app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import CustomerProfile from '@/app/components/profile/customer-profile';
import AdminProfile from '@/app/components/profile/admin-profile';
import { CustomerService } from '@/app/lib/api/customer-service';
import { UserService } from '@/app/lib/api/user-service';
import { CustomerDetail } from '@/app/lib/types/customer';
import { User } from '@/app/lib/types/user';

export default function ProfilePage() {
    const { user, isAuthenticated } = useAuth();
    const [customerData, setCustomerData] = useState<CustomerDetail | null>(null);
    const [adminUserData, setAdminUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isCustomer = user?.role?.name === 'CUSTOMER';

    useEffect(() => {
        if (isAuthenticated && user) {
            loadProfileData();
        }
    }, [isAuthenticated, user]);

    const loadProfileData = async () => {
        try {
            setLoading(true);
            setError(null);

            if (isCustomer) {
                // Load customer profile data
                const response = await CustomerService.getCustomerByUserId(user.id);
                if (response.success && response.data) {
                    setCustomerData(response.data);
                } else {
                    setError('Failed to load customer profile');
                }
            } else {
                // Load admin user data
                const response = await UserService.getUserById(user.id);
                if (response.success && response.data) {
                    setAdminUserData(response.data);
                } else {
                    setError('Failed to load user profile');
                }
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
            setError('Failed to load profile data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = () => {
        // Refresh profile data after update
        loadProfileData();
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h2>
                    <p className="text-gray-600">You need to be logged in to access this page.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                            <p className="text-gray-600 mt-1">
                                {isCustomer ? 'Manage your customer account' : 'Manage your admin account'}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                                {user?.role?.name}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-800 text-sm font-medium">{error}</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-white text-2xl font-bold">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
                                <p className="text-gray-600 text-sm">{user?.email}</p>
                                <p className="text-indigo-600 text-sm font-medium mt-1">{user?.role?.name}</p>
                            </div>

                            <nav className="space-y-2">
                                <button className="w-full text-left px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg font-medium">
                                    Profile Information
                                </button>
                                {isCustomer && (
                                    <>
                                        <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                            Order History
                                        </button>
                                        <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                            Wishlist
                                        </button>
                                        <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                            Address Book
                                        </button>
                                        <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                            Payment Methods
                                        </button>
                                    </>
                                )}
                                {!isCustomer && (
                                    <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                        Account Settings
                                    </button>
                                )}
                                <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                    Security
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Profile Content */}
                    <div className="lg:col-span-2">
                        {isCustomer ? (
                            <CustomerProfile
                                customerData={customerData}
                                onProfileUpdate={handleProfileUpdate}
                            />
                        ) : (
                            <AdminProfile
                                userData={adminUserData}
                                onProfileUpdate={handleProfileUpdate}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}