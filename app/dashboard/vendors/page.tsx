// app/dashboard/vendors/page.tsx
'use client';

import {useEffect, useState} from 'react';
import {VendorService} from '@/app/lib/api/vendor-service';
import {Vendor, VendorsResponse, VendorStatus} from '@/app/lib/types/vendor';
import VendorsTable from '@/app/components/vendors/vendor-table';
import VendorDetailModal from '@/app/components/vendors/vendor-detail-modal';
import VendorRegistrationModal from '@/app/components/vendors/vendor-registration-modal';
import {Button} from '@/app/components/ui/button';
import {Input} from '@/app/components/ui/input';

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
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
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'approval'>('view');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<VendorStatus | 'ALL'>('ALL');

    // Load vendors from API
    const loadVendors = async (page: number = 0) => {
        try {
            setLoading(true);
            setError('');

            let response: VendorsResponse;

            if (statusFilter !== 'ALL') {
                response = await VendorService.getVendorsByStatus(statusFilter, page, pagination.pageSize);
            } else {
                response = await VendorService.getVendors(page, pagination.pageSize, 'createdAt', 'desc');
            }

            console.log('Vendors API Response:', response);

            if (response.success && response.data) {
                setVendors(response.data.items || []);
                setPagination({
                    totalItems: response.data.totalItems || 0,
                    currentPage: response.data.currentPage || 0,
                    pageSize: response.data.pageSize || 10,
                    totalPages: response.data.totalPages || 0
                });
            } else {
                setError(response.message || 'Failed to load vendors');
            }
        } catch (err) {
            console.error('Error loading vendors:', err);
            setError(err instanceof Error ? err.message : 'Failed to load vendors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVendors(pagination.currentPage);
    }, [pagination.currentPage, pagination.pageSize, statusFilter]);

    const handleViewVendor = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setModalMode('view');
        setIsDetailModalOpen(true);
    };

    const handleEditVendor = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setModalMode('edit');
        setIsDetailModalOpen(true);
    };

    const handleApproveVendor = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setModalMode('approval');
        setIsDetailModalOpen(true);
    };

    const handleRejectVendor = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setModalMode('approval');
        setIsDetailModalOpen(true);
    };

    const handleDeleteVendor = async (id: number) => {
        if (confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
            try {
                await VendorService.deleteVendor(id);
                await loadVendors(pagination.currentPage);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete vendor');
            }
        }
    };

    const handleRegistrationSuccess = () => {
        loadVendors(pagination.currentPage);
    };

    const handleModalClose = (refresh: boolean = false) => {
        setIsDetailModalOpen(false);
        setSelectedVendor(null);
        if (refresh) {
            loadVendors(pagination.currentPage);
        }
    };

    const handleRegistrationModalClose = (success: boolean = false) => {
        setIsRegistrationModalOpen(false);
        if (success) {
            loadVendors(pagination.currentPage);
        }
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({...prev, currentPage: page}));
    };

    const handlePageSizeChange = (size: number) => {
        setPagination(prev => ({...prev, pageSize: size, currentPage: 0}));
    };

    // Filter vendors based on search term
    const filteredVendors = vendors.filter(vendor => {
        const searchLower = searchTerm.toLowerCase();
        return (
            vendor.companyName.toLowerCase().includes(searchLower) ||
            vendor.businessEmail.toLowerCase().includes(searchLower) ||
            vendor.phone.toLowerCase().includes(searchLower) ||
            vendor.id.toString().includes(searchTerm)
        );
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Vendor Management</h2>
                    <p className="text-gray-600">Manage vendor accounts, approvals, and performance</p>
                </div>
                <div className="space-x-3">
                    <Button
                        onClick={() => setIsRegistrationModalOpen(true)}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        Register Vendor
                    </Button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"/>
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
                            placeholder="Search vendors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as VendorStatus | 'ALL')}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="ALL">All Status</option>
                            <option value={VendorStatus.PENDING}>Pending</option>
                            <option value={VendorStatus.APPROVED}>Approved</option>
                            <option value={VendorStatus.REJECTED}>Rejected</option>
                            <option value={VendorStatus.SUSPENDED}>Suspended</option>
                        </select>
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

            {/* Vendors Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <VendorsTable
                        vendors={filteredVendors}
                        onView={handleViewVendor}
                        onEdit={handleEditVendor}
                        onApprove={handleApproveVendor}
                        onReject={handleRejectVendor}
                        onDelete={handleDeleteVendor}
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                        totalItems={pagination.totalItems}
                    />
                )}
            </div>

            {/* Vendor Registration Modal */}
            <VendorRegistrationModal
                isOpen={isRegistrationModalOpen}
                onClose={handleRegistrationModalClose}
                onSuccess={handleRegistrationSuccess}
            />

            {/* Vendor Detail Modal */}
            <VendorDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleModalClose}
                vendor={selectedVendor}
                mode={modalMode}
            />
        </div>
    );
}