// app/dashboard/permissions/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { PermissionService } from '@/app/lib/api/permission-service';
import { Permission, PermissionsResponse } from '@/app/lib/types/role';
import PermissionsTable from '@/app/components/permissions/permission-table';
import PermissionModal from '@/app/components/permissions/permission-modal';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

export default function PermissionsPage() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [pagination, setPagination] = useState({
        totalItems: 0,
        currentPage: 0,
        pageSize: 50,
        totalPages: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Load permissions from API
    const loadPermissions = async (page: number = 0) => {
        try {
            setLoading(true);
            setError('');
            const response: PermissionsResponse = await PermissionService.getPermissions(page, pagination.pageSize, 'name', 'asc');

            console.log('Permissions API Response:', response);

            if (response.success && response.data) {
                setPermissions(response.data.items || []);
                setPagination({
                    totalItems: response.data.totalItems || 0,
                    currentPage: response.data.currentPage || 0,
                    pageSize: response.data.pageSize || 50,
                    totalPages: response.data.totalPages || 0
                });
            } else {
                setError(response.message || 'Failed to load permissions');
            }
        } catch (err) {
            console.error('Error loading permissions:', err);
            setError(err instanceof Error ? err.message : 'Failed to load permissions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPermissions(pagination.currentPage);
    }, [pagination.currentPage, pagination.pageSize]);

    const handleCreatePermission = () => {
        setSelectedPermission(null);
        setIsModalOpen(true);
    };

    const handleEditPermission = (permission: Permission) => {
        setSelectedPermission(permission);
        setIsModalOpen(true);
    };

    const handleDeletePermission = async (id: number) => {
        if (confirm('Are you sure you want to delete this permission? This may affect roles that use this permission.')) {
            try {
                await PermissionService.deletePermission(id);
                await loadPermissions(pagination.currentPage);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete permission');
            }
        }
    };

    const handleModalClose = (refresh: boolean = false) => {
        setIsModalOpen(false);
        setSelectedPermission(null);
        if (refresh) {
            loadPermissions(pagination.currentPage);
        }
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handlePageSizeChange = (size: number) => {
        setPagination(prev => ({ ...prev, pageSize: size, currentPage: 0 }));
    };

    // Filter permissions based on search term
    const filteredPermissions = permissions.filter(permission =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Permission Management</h2>
                    <p className="text-gray-600">Manage system permissions and access controls</p>
                </div>
                <Button onClick={handleCreatePermission} className="bg-indigo-600 hover:bg-indigo-700">
                    Create New Permission
                </Button>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red-800 text-sm font-medium">{error}</span>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="w-full sm:w-64">
                        <Input
                            type="text"
                            placeholder="Search permissions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <select
                            value={pagination.pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                            <option value={100}>100 per page</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Permissions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <PermissionsTable
                        permissions={filteredPermissions}
                        onEdit={handleEditPermission}
                        onDelete={handleDeletePermission}
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                        totalItems={pagination.totalItems}
                    />
                )}
            </div>

            {/* Permission Modal */}
            <PermissionModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                permission={selectedPermission}
            />
        </div>
    );
}