// app/components/roles/role-modal.tsx
'use client';

import { useEffect, useState } from 'react';
import { Role, RoleRequest, Permission } from '@/app/lib/types/role';
import { PermissionService } from '@/app/lib/api/permission-service';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

interface RoleModalProps {
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
    role: Role | null;
}

export default function RoleModal({ isOpen, onClose, role }: RoleModalProps) {
    const [formData, setFormData] = useState<RoleRequest>({
        name: '',
        description: '',
        permissionIds: [],
    });
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [permissionsLoading, setPermissionsLoading] = useState(false);

    // Load permissions when modal opens
    useEffect(() => {
        if (isOpen) {
            loadPermissions();
        }
    }, [isOpen]);

    // Load available permissions from API
    const loadPermissions = async () => {
        try {
            setPermissionsLoading(true);
            const response = await PermissionService.getPermissions(0, 100);
            if (response.success && response.data) {
                setPermissions(response.data.items || []);
            }
        } catch (err) {
            console.error('Error loading permissions:', err);
        } finally {
            setPermissionsLoading(false);
        }
    };

    // Initialize form data when role changes
    useEffect(() => {
        if (role) {
            setFormData({
                name: role.name,
                description: role.description || '',
                permissionIds: role.permissions?.map(p => p.id) || [],
            });
        } else {
            setFormData({
                name: '',
                description: '',
                permissionIds: [],
            });
        }
        setError('');
    }, [role, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Import RoleService here to avoid circular dependency
            const { RoleService } = await import('@/app/lib/api/role-service');

            if (role) {
                // Update existing role
                await RoleService.updateRole(role.id, formData);
            } else {
                // Create new role
                await RoleService.createRole(formData);
            }
            onClose(true); // Close and refresh
        } catch (err) {
            console.error('Error saving role:', err);
            setError(err instanceof Error ? err.message : 'Failed to save role');
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

    const handlePermissionChange = (permissionId: number, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            permissionIds: checked
                ? [...prev.permissionIds, permissionId]
                : prev.permissionIds.filter(id => id !== permissionId),
        }));
    };

    const selectAllPermissions = () => {
        setFormData(prev => ({
            ...prev,
            permissionIds: permissions.map(p => p.id),
        }));
    };

    const clearAllPermissions = () => {
        setFormData(prev => ({
            ...prev,
            permissionIds: [],
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {role ? 'Edit Role' : 'Create New Role'}
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
                        {/* Role Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Role Name *
                            </label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                placeholder="e.g., ADMIN, MANAGER, VIEWER"
                            />
                        </div>

                        {/* Role Description */}
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
                                placeholder="Describe the role's purpose and responsibilities"
                            />
                        </div>

                        {/* Permissions Section */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Permissions
                                </label>
                                <div className="space-x-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={selectAllPermissions}
                                        disabled={permissionsLoading}
                                    >
                                        Select All
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={clearAllPermissions}
                                        disabled={permissionsLoading}
                                    >
                                        Clear All
                                    </Button>
                                </div>
                            </div>

                            {permissionsLoading ? (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : (
                                <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                        {permissions.map((permission) => (
                                            <div key={permission.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`permission-${permission.id}`}
                                                    checked={formData.permissionIds.includes(permission.id)}
                                                    onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                                                    disabled={loading}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <label
                                                    htmlFor={`permission-${permission.id}`}
                                                    className="ml-2 block text-sm text-gray-900"
                                                >
                                                    <div className="font-medium">{permission.name}</div>
                                                    {permission.description && (
                                                        <div className="text-gray-500 text-xs">{permission.description}</div>
                                                    )}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
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
                                    role ? 'Update Role' : 'Create Role'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}