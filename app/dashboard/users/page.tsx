'use client';

import { useState, useEffect } from 'react';
import { UserService } from '@/app/lib/api/user-service';
import { User, PaginatedUsers } from '@/app/lib/types/user';
import UsersTable from '@/app/components/users/users-table';
import UserModal from '@/app/components/users/user-modal';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

export default function UsersPage() {
    const [users, setUsers] = useState<PaginatedUsers | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const loadUsers = async (page: number = 0) => {
        try {
            setLoading(true);
            setError('');
            const response = await UserService.getUsers(page, pageSize, 'createdAt', 'desc');
            if (response.success) {
                setUsers(response.data);
            } else {
                setError(response.message || 'Failed to load users');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers(currentPage);
    }, [currentPage, pageSize]);

    const handleCreateUser = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteUser = async (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await UserService.deleteUser(id);
                await loadUsers(currentPage); // Reload current page
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete user');
            }
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            if (currentStatus) {
                await UserService.deactivateUser(id);
            } else {
                await UserService.activateUser(id);
            }
            await loadUsers(currentPage); // Reload current page
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update user status');
        }
    };

    const handleModalClose = (refresh: boolean = false) => {
        setIsModalOpen(false);
        setSelectedUser(null);
        if (refresh) {
            loadUsers(currentPage);
        }
    };

    const filteredUsers = users?.items.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">User Management</h2>
                    <p className="text-gray-600">Manage system users and their permissions</p>
                </div>
                <Button onClick={handleCreateUser} className="bg-indigo-600 hover:bg-indigo-700">
                    Add New User
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
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <UsersTable
                        users={filteredUsers || []}
                        onEdit={handleEditUser}
                        onDelete={handleDeleteUser}
                        onToggleStatus={handleToggleStatus}
                        currentPage={currentPage}
                        totalPages={users?.totalPages || 0}
                        onPageChange={setCurrentPage}
                        totalItems={users?.totalItems || 0}
                    />
                )}
            </div>

            {/* User Modal */}
            <UserModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                user={selectedUser}
            />
        </div>
    );
}