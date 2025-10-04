// app/components/permissions/permission-table.tsx
'use client';

import { Permission } from '@/app/lib/types/role';
import { Button } from '@/app/components/ui/button';
import { formatDate } from '@/app/lib/utils/formatters';

interface PermissionsTableProps {
    permissions: Permission[];
    onEdit: (permission: Permission) => void;
    onDelete: (id: number) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
}

export default function PermissionsTable({
                                             permissions,
                                             onEdit,
                                             onDelete,
                                             currentPage,
                                             totalPages,
                                             onPageChange,
                                             totalItems,
                                         }: PermissionsTableProps) {
    if (permissions.length === 0) {
        return (
            <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No permissions found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new permission.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Permission
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {permissions.map((permission) => (
                        <tr key={permission.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">
                                    {permission.name}
                                </code>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 max-w-md">
                                    {permission.description || 'No description provided'}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(permission.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(permission)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDelete(permission.id)}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(currentPage * 50) + 1}</span> to{' '}
                                <span className="font-medium">{Math.min((currentPage + 1) * 50, totalItems)}</span> of{' '}
                                <span className="font-medium">{totalItems}</span> results
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 0}
                                onClick={() => onPageChange(currentPage - 1)}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage >= totalPages - 1}
                                onClick={() => onPageChange(currentPage + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}