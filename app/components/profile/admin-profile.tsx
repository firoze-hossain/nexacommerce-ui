// app/components/profile/admin-profile.tsx
'use client';

import { useState } from 'react';
import { User } from '@/app/lib/types/user';
import { UserService } from '@/app/lib/api/user-service';

interface AdminProfileProps {
    userData: User | null;
    onProfileUpdate: () => void;
}

export default function AdminProfile({ userData, onProfileUpdate }: AdminProfileProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: userData?.name || '',
        email: userData?.email || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await UserService.updateUser(userData!.id, formData);

            if (response.success) {
                setIsEditing(false);
                onProfileUpdate();
            } else {
                setError(response.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating admin profile:', error);
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (!userData) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600">No user data found.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Admin Profile</h2>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red-800 text-sm font-medium">{error}</span>
                    </div>
                </div>
            )}

            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Role Information (Read-only) */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Role Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        value={userData.role.name}
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Role Description
                                    </label>
                                    <input
                                        type="text"
                                        value={userData.role.description}
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-6">
                    {/* Admin Information */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <p className="text-gray-900">{userData.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <p className="text-gray-900">{userData.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full ${userData.active ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                                    <span className={`font-medium ${userData.active ? 'text-green-600' : 'text-red-600'}`}>
                                        {userData.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                                <p className="text-gray-900">
                                    {new Date(userData.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Role Information */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Role Information</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <p className="text-gray-900 font-medium">{userData.role.name}</p>
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <p className="text-gray-900">{userData.role.description}</p>
                            </div>
                            {userData.role.permissions && userData.role.permissions.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                                    <div className="flex flex-wrap gap-2">
                                        {userData.role.permissions.slice(0, 10).map((permission) => (
                                            <span
                                                key={permission.id}
                                                className="bg-white border border-gray-200 px-2 py-1 rounded text-xs text-gray-600"
                                            >
                                                {permission.name}
                                            </span>
                                        ))}
                                        {userData.role.permissions.length > 10 && (
                                            <span className="bg-white border border-gray-200 px-2 py-1 rounded text-xs text-gray-600">
                                                +{userData.role.permissions.length - 10} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Account Information */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Created</label>
                                <p className="text-gray-900">
                                    {new Date(userData.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                                <p className="text-gray-900">
                                    {new Date(userData.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}