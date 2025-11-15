// app/dashboard/hero/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { HeroContent } from '@/app/lib/types/hero';
import { HeroService } from '@/app/lib/api/hero-service';
import HeroTable from '@/app/components/hero/hero-table';
import HeroCreateModal from '@/app/components/hero/hero-create-modal';
import HeroDetailModal from '@/app/components/hero/hero-detail-modal';
import HeroAnalytics from '@/app/components/hero/hero-analytics';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

export default function HeroManagementPage() {
    const [heroContents, setHeroContents] = useState<HeroContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Modal states
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedHero, setSelectedHero] = useState<HeroContent | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

    // Analytics state
    const [showAnalytics, setShowAnalytics] = useState(false);

    const pageSize = 10;

    useEffect(() => {
        loadHeroContents();
    }, [currentPage, filterType, filterStatus]);

    const loadHeroContents = async () => {
        try {
            setLoading(true);
            const response = await HeroService.getHeroContents(currentPage, pageSize);

            if (response.success && response.data) {
                let filteredItems = response.data.items || [];

                // Apply filters
                if (filterType !== 'ALL') {
                    filteredItems = filteredItems.filter(item => item.type === filterType);
                }
                if (filterStatus !== 'ALL') {
                    filteredItems = filteredItems.filter(item =>
                        filterStatus === 'ACTIVE' ? item.active : !item.active
                    );
                }
                if (searchTerm) {
                    filteredItems = filteredItems.filter(item =>
                        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }

                setHeroContents(filteredItems);
                setTotalPages(response.data.totalPages || 0);
                setTotalItems(response.data.totalItems || 0);
            } else {
                // Handle case where response doesn't have expected structure
                setHeroContents([]);
                setTotalPages(0);
                setTotalItems(0);
            }
        } catch (err) {
            console.error('Error loading hero contents:', err);
            setError('Failed to load hero contents');
            setHeroContents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSuccess = () => {
        setCreateModalOpen(false);
        loadHeroContents();
    };

    const handleView = (hero: HeroContent) => {
        setSelectedHero(hero);
        setModalMode('view');
        setDetailModalOpen(true);
    };

    const handleEdit = (hero: HeroContent) => {
        setSelectedHero(hero);
        setModalMode('edit');
        setDetailModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this hero content? This action cannot be undone.')) {
            return;
        }

        try {
            await HeroService.deleteHeroContent(id);
            loadHeroContents();
        } catch (err) {
            console.error('Error deleting hero content:', err);
            setError('Failed to delete hero content');
        }
    };

    const handleToggleStatus = async (id: number) => {
        try {
            await HeroService.toggleHeroContentStatus(id);
            loadHeroContents();
        } catch (err) {
            console.error('Error toggling hero content status:', err);
            setError('Failed to update hero content status');
        }
    };

    const handleModalClose = (refresh = false) => {
        setDetailModalOpen(false);
        setSelectedHero(null);
        if (refresh) {
            loadHeroContents();
        }
    };

    const handleDeactivateExpired = async () => {
        try {
            await HeroService.deactivateExpiredContent();
            loadHeroContents();
        } catch (err) {
            console.error('Error deactivating expired content:', err);
            setError('Failed to deactivate expired content');
        }
    };

    // Fix: Check if heroContents exists before accessing length
    if (loading && (!heroContents || heroContents.length === 0)) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Hero Content Management</h2>
                    <p className="text-gray-600 mt-1">
                        Manage banner content displayed on the homepage
                    </p>
                </div>
                <div className="flex space-x-3">
                    <Button
                        variant="outline"
                        onClick={() => setShowAnalytics(!showAnalytics)}
                    >
                        {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleDeactivateExpired}
                    >
                        Deactivate Expired
                    </Button>
                    <Button
                        onClick={() => setCreateModalOpen(true)}
                    >
                        Create Hero Content
                    </Button>
                </div>
            </div>

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

            {/* Analytics Section */}
            {showAnalytics && (
                <HeroAnalytics />
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <Input
                            type="text"
                            placeholder="Search by title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') loadHeroContents();
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="ALL">All Types</option>
                            <option value="MAIN_BANNER">Main Banner</option>
                            <option value="PROMOTIONAL">Promotional</option>
                            <option value="SEASONAL">Seasonal</option>
                            <option value="PRODUCT_HIGHLIGHT">Product Highlight</option>
                            <option value="BRAND_SPOTLIGHT">Brand Spotlight</option>
                            <option value="FLASH_SALE">Flash Sale</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <Button
                            onClick={loadHeroContents}
                            className="w-full"
                        >
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </div>

            {/* Hero Content Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <HeroTable
                    heroContents={heroContents}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    loading={loading}
                />
            </div>

            {/* Modals */}
            <HeroCreateModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />

            {selectedHero && (
                <HeroDetailModal
                    isOpen={detailModalOpen}
                    onClose={handleModalClose}
                    hero={selectedHero}
                    mode={modalMode}
                />
            )}
        </div>
    );
}