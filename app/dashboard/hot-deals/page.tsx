// app/dashboard/hot-deals/page.tsx
'use client';

import {useEffect, useState} from 'react';
import {HotDealService} from '@/app/lib/api/hot-deal-service';
import {HotDeal, HotDealsResponse} from '@/app/lib/types/hot-deal';
import HotDealsTable from '@/app/components/hot-deals/hot-deals-table';
import HotDealDetailModal from '@/app/components/hot-deals/hot-deal-detail-modal';
import HotDealCreateModal from '@/app/components/hot-deals/hot-deal-create-modal';
import {Button} from '@/app/components/ui/button';
import {Input} from '@/app/components/ui/input';

export default function HotDealsPage() {
    const [hotDeals, setHotDeals] = useState<HotDeal[]>([]);
    const [pagination, setPagination] = useState({
        totalItems: 0,
        currentPage: 0,
        pageSize: 10,
        totalPages: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedHotDeal, setSelectedHotDeal] = useState<HotDeal | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
    const [searchTerm, setSearchTerm] = useState('');

    // Load hot deals from API
    const loadHotDeals = async (page: number = 0) => {
        try {
            setLoading(true);
            setError('');
            const response: HotDealsResponse = await HotDealService.getHotDeals(
                page,
                pagination.pageSize,
                'createdAt',
                'desc'
            );

            console.log('Hot Deals API Response:', response);

            if (response.success && response.data) {
                setHotDeals(response.data.items || []);
                setPagination({
                    totalItems: response.data.totalItems || 0,
                    currentPage: response.data.currentPage || 0,
                    pageSize: response.data.pageSize || 10,
                    totalPages: response.data.totalPages || 0
                });
            } else {
                setError(response.message || 'Failed to load hot deals');
            }
        } catch (err) {
            console.error('Error loading hot deals:', err);
            setError(err instanceof Error ? err.message : 'Failed to load hot deals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHotDeals(pagination.currentPage);
    }, [pagination.currentPage, pagination.pageSize]);

    const handleViewHotDeal = (hotDeal: HotDeal) => {
        setSelectedHotDeal(hotDeal);
        setModalMode('view');
        setIsDetailModalOpen(true);
    };

    const handleEditHotDeal = (hotDeal: HotDeal) => {
        setSelectedHotDeal(hotDeal);
        setModalMode('edit');
        setIsDetailModalOpen(true);
    };

    const handleDeleteHotDeal = async (id: number) => {
        if (confirm('Are you sure you want to delete this hot deal? This action cannot be undone.')) {
            try {
                await HotDealService.deleteHotDeal(id);
                await loadHotDeals(pagination.currentPage);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete hot deal');
            }
        }
    };

    const handleToggleStatus = async (id: number, isActive: boolean) => {
        try {
            await HotDealService.updateHotDealStatus(id, isActive);
            await loadHotDeals(pagination.currentPage);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update hot deal status');
        }
    };

    const handleCreateSuccess = () => {
        loadHotDeals(pagination.currentPage);
    };

    const handleModalClose = (refresh: boolean = false) => {
        setIsDetailModalOpen(false);
        setSelectedHotDeal(null);
        if (refresh) {
            loadHotDeals(pagination.currentPage);
        }
    };

    const handleCreateModalClose = (success: boolean = false) => {
        setIsCreateModalOpen(false);
        if (success) {
            loadHotDeals(pagination.currentPage);
        }
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({...prev, currentPage: page}));
    };

    const handlePageSizeChange = (size: number) => {
        setPagination(prev => ({...prev, pageSize: size, currentPage: 0}));
    };

    // Filter hot deals based on search term
    const filteredHotDeals = hotDeals.filter(hotDeal => {
        const productName = hotDeal.product?.name || '';
        const productSku = hotDeal.product?.sku || '';

        return (
            productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hotDeal.id.toString().includes(searchTerm) ||
            hotDeal.discountType.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Hot Deals Management</h2>
                    <p className="text-gray-600">Manage limited-time offers and discounts</p>
                </div>
                <div className="space-x-3">
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        Create Hot Deal
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
                            placeholder="Search by product name, SKU, or discount type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <select
                            value={pagination.pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Hot Deals Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    </div>
                ) : (
                    <HotDealsTable
                        hotDeals={filteredHotDeals}
                        onView={handleViewHotDeal}
                        onEdit={handleEditHotDeal}
                        onDelete={handleDeleteHotDeal}
                        onToggleStatus={handleToggleStatus}
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                        totalItems={pagination.totalItems}
                        pageSize={pagination.pageSize}
                    />
                )}
            </div>

            {/* Hot Deal Create Modal */}
            <HotDealCreateModal
                isOpen={isCreateModalOpen}
                onClose={handleCreateModalClose}
                onSuccess={handleCreateSuccess}
            />

            {/* Hot Deal Detail Modal */}
            <HotDealDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleModalClose}
                hotDeal={selectedHotDeal}
                mode={modalMode}
            />
        </div>
    );
}