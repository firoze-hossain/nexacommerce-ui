// app/components/roles/role-table.tsx
'use client';

import { Role } from '@/app/lib/types/role';
import { Button } from '@/app/components/ui/button';
import { formatDate } from '@/app/lib/utils/formatters';

interface RolesTableProps {
    roles: Role[];
    onEdit: (role: Role) => void;
    onDelete: (id: number) => void;
    onManagePermissions: (role: Role) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
}

export default function RolesTable({
                                       roles,
                                       onEdit,
                                       onDelete,
                                       onManagePermissions,
                                       currentPage,
                                       totalPages,
                                       onPageChange,
                                       totalItems,
                                   }: RolesTableProps) {
    if (roles.length === 0) {
        return (
            <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No roles found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new role.</p>
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
                            Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Permissions
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
                    {roles.map((role) => (
                        <tr key={role.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                    <div className="text-sm font-medium text-gray-900">{role.name}</div>
                                    {role.description && (
                                        <div className="text-sm text-gray-500">{role.description}</div>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                    {role.permissions.slice(0, 3).map((permission) => (
                                        <span
                                            key={permission.id}
                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                        >
                        {permission.name}
                      </span>
                                    ))}
                                    {role.permissions.length > 3 && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        +{role.permissions.length - 3} more
                      </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(role.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(role)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onManagePermissions(role)}
                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                >
                                    Permissions
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDelete(role.id)}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    disabled={role.name === 'SUPERADMIN'} // Prevent deleting SUPERADMIN role
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
                                Showing <span className="font-medium">{(currentPage * 20) + 1}</span> to{' '}
                                <span className="font-medium">{Math.min((currentPage + 1) * 20, totalItems)}</span> of{' '}
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