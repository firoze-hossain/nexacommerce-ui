// app/components/permissions/permission-modal.tsx
'use client';

import { useEffect, useState } from 'react';
import { Permission, PermissionRequest } from '@/app/lib/types/role';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

interface PermissionModalProps {
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
    permission: Permission | null;
}

export default function PermissionModal({ isOpen, onClose, permission }: PermissionModalProps) {
    const [formData, setFormData] = useState<PermissionRequest>({
        name: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (permission) {
            setFormData({
                name: permission.name,
                description: permission.description || '',
            });
        } else {
            setFormData({
                name: '',
                description: '',
            });
        }
        setError('');
    }, [permission, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate permission name format (uppercase with underscores)
        const permissionNameRegex = /^[A-Z_]+$/;
        if (!permissionNameRegex.test(formData.name)) {
            setError('Permission name must be uppercase with underscores only (e.g., USER_READ, PRODUCT_WRITE)');
            setLoading(false);
            return;
        }

        try {
            const { PermissionService } = await import('@/app/lib/api/permission-service');

            if (permission) {
                await PermissionService.updatePermission(permission.id, formData);
            } else {
                await PermissionService.createPermission(formData);
            }
            onClose(true);
        } catch (err) {
            console.error('Error saving permission:', err);
            setError(err instanceof Error ? err.message : 'Failed to save permission');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {permission ? 'Edit Permission' : 'Create New Permission'}
                        </h3>
                        <button
                            onClick={() => onClose()}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-red-800 text-sm font-medium">{error}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Permission Name *
                            </label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                placeholder="e.g., USER_READ, PRODUCT_WRITE"
                                className="font-mono uppercase"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Must be uppercase with underscores only
                            </p>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                disabled={loading}
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Describe what this permission allows"
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onClose()}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </div>
                                ) : (
                                    permission ? 'Update Permission' : 'Create Permission'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}