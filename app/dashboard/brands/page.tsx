// app/dashboard/brands/page.tsx
'use client';

import {useEffect, useState} from 'react';
import {BrandService} from '@/app/lib/api/brand-service';
import {Brand, BrandsResponse} from '@/app/lib/types/brand';
import BrandsTable from '@/app/components/brands/brand-table';
import BrandDetailModal from '@/app/components/brands/brand-detail-modal';
import BrandCreateModal from '@/app/components/brands/brand-create-modal';
import {Button} from '@/app/components/ui/button';
import {Input} from '@/app/components/ui/input';

export default function BrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
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
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
    const [searchTerm, setSearchTerm] = useState('');

    // Load brands from API
    const loadBrands = async (page: number = 0) => {
        try {
            setLoading(true);
            setError('');
            const response: BrandsResponse = await BrandService.getBrands(
                page,
                pagination.pageSize,
                'name',
                'asc'
            );

            console.log('Brands API Response:', response);

            if (response.success && response.data) {
                setBrands(response.data.items || []);
                setPagination({
                    totalItems: response.data.totalItems || 0,
                    currentPage: response.data.currentPage || 0,
                    pageSize: response.data.pageSize || 10,
                    totalPages: response.data.totalPages || 0
                });
            } else {
                setError(response.message || 'Failed to load brands');
            }
        } catch (err) {
            console.error('Error loading brands:', err);
            setError(err instanceof Error ? err.message : 'Failed to load brands');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBrands(pagination.currentPage);
    }, [pagination.currentPage, pagination.pageSize]);

    const handleViewBrand = (brand: Brand) => {
        setSelectedBrand(brand);
        setModalMode('view');
        setIsDetailModalOpen(true);
    };

    const handleEditBrand = (brand: Brand) => {
        setSelectedBrand(brand);
        setModalMode('edit');
        setIsDetailModalOpen(true);
    };

    const handleDeleteBrand = async (id: number) => {
        if (confirm('Are you sure you want to delete this brand? This action cannot be undone.')) {
            try {
                await BrandService.deleteBrand(id);
                await loadBrands(pagination.currentPage);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete brand');
            }
        }
    };

    const handleToggleStatus = async (id: number) => {
        try {
            await BrandService.toggleBrandStatus(id);
            await loadBrands(pagination.currentPage);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update brand status');
        }
    };

    const handleCreateSuccess = () => {
        loadBrands(pagination.currentPage);
    };

    const handleModalClose = (refresh: boolean = false) => {
        setIsDetailModalOpen(false);
        setSelectedBrand(null);
        if (refresh) {
            loadBrands(pagination.currentPage);
        }
    };

    const handleCreateModalClose = (success: boolean = false) => {
        setIsCreateModalOpen(false);
        if (success) {
            loadBrands(pagination.currentPage);
        }
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({...prev, currentPage: page}));
    };

    const handlePageSizeChange = (size: number) => {
        setPagination(prev => ({...prev, pageSize: size, currentPage: 0}));
    };

    // Filter brands based on search term
    const filteredBrands = brands.filter(brand => {
        const name = brand.name || '';
        const description = brand.description || '';
        const website = brand.websiteUrl || '';

        return (
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            website.toLowerCase().includes(searchTerm.toLowerCase()) ||
            brand.id.toString().includes(searchTerm)
        );
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Brand Management</h2>
                    <p className="text-gray-600">Manage product brands and their information</p>
                </div>
                <div className="space-x-3">
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Create Brand
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
                            placeholder="Search by name, description, website, or ID..."
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

            {/* Brands Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <BrandsTable
                        brands={filteredBrands}
                        onView={handleViewBrand}
                        onEdit={handleEditBrand}
                        onDelete={handleDeleteBrand}
                        onToggleStatus={handleToggleStatus}
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                        totalItems={pagination.totalItems}
                        pageSize={pagination.pageSize}
                    />
                )}
            </div>

            {/* Brand Create Modal */}
            <BrandCreateModal
                isOpen={isCreateModalOpen}
                onClose={handleCreateModalClose}
                onSuccess={handleCreateSuccess}
            />

            {/* Brand Detail Modal */}
            <BrandDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleModalClose}
                brand={selectedBrand}
                mode={modalMode}
            />
        </div>
    );
}