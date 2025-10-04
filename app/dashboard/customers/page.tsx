// app/dashboard/customers/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { CustomerService } from '@/app/lib/api/customer-service';
import { Customer, CustomersResponse } from '@/app/lib/types/customer';
import CustomersTable from '@/app/components/customers/customer-table';
import CustomerDetailModal from '@/app/components/customers/customer-detail-modal';
import CustomerRegistrationModal from '@/app/components/customers/customer-registration-modal';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [pagination, setPagination] = useState({
        totalItems: 0,
        currentPage: 0,
        pageSize: 10,
        totalPages: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
    const [searchTerm, setSearchTerm] = useState('');

    // Load customers from API
    const loadCustomers = async (page: number = 0) => {
        try {
            setLoading(true);
            setError('');
            const response: CustomersResponse = await CustomerService.getCustomers(
                page,
                pagination.pageSize,
                'createdAt',
                'desc'
            );

            console.log('Customers API Response:', response);

            if (response.success && response.data) {
                setCustomers(response.data.items || []);
                setPagination({
                    totalItems: response.data.totalItems || 0,
                    currentPage: response.data.currentPage || 0,
                    pageSize: response.data.pageSize || 10,
                    totalPages: response.data.totalPages || 0
                });
            } else {
                setError(response.message || 'Failed to load customers');
            }
        } catch (err) {
            console.error('Error loading customers:', err);
            setError(err instanceof Error ? err.message : 'Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers(pagination.currentPage);
    }, [pagination.currentPage, pagination.pageSize]);

    const handleViewCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setModalMode('view');
        setIsDetailModalOpen(true);
    };

    const handleEditCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setModalMode('edit');
        setIsDetailModalOpen(true);
    };

    const handleDeleteCustomer = async (id: number) => {
        if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
            try {
                await CustomerService.deleteCustomer(id);
                await loadCustomers(pagination.currentPage);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete customer');
            }
        }
    };

    const handleRegistrationSuccess = () => {
        loadCustomers(pagination.currentPage);
    };

    const handleModalClose = (refresh: boolean = false) => {
        setIsDetailModalOpen(false);
        setSelectedCustomer(null);
        if (refresh) {
            loadCustomers(pagination.currentPage);
        }
    };

    const handleRegistrationModalClose = (success: boolean = false) => {
        setIsRegistrationModalOpen(false);
        if (success) {
            loadCustomers(pagination.currentPage);
        }
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handlePageSizeChange = (size: number) => {
        setPagination(prev => ({ ...prev, pageSize: size, currentPage: 0 }));
    };

    // Filter customers based on search term - safe access
    const filteredCustomers = customers.filter(customer => {
        const phone = customer.phone || '';

        return (
            phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.id.toString().includes(searchTerm)
        );
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Customer Management</h2>
                    <p className="text-gray-600">Manage customer accounts and profiles</p>
                </div>
                <div className="space-x-3">
                    <Button
                        onClick={() => setIsRegistrationModalOpen(true)}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        Register Customer
                    </Button>
                </div>
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
                            placeholder="Search by phone or ID..."
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
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <CustomersTable
                        customers={filteredCustomers}
                        onView={handleViewCustomer}
                        onEdit={handleEditCustomer}
                        onDelete={handleDeleteCustomer}
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                        totalItems={pagination.totalItems}
                    />
                )}
            </div>

            {/* Customer Registration Modal */}
            <CustomerRegistrationModal
                isOpen={isRegistrationModalOpen}
                onClose={handleRegistrationModalClose}
                onSuccess={handleRegistrationSuccess}
            />

            {/* Customer Detail Modal */}
            <CustomerDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleModalClose}
                customer={selectedCustomer}
                mode={modalMode}
            />
        </div>
    );
}