// app/dashboard/categories/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { CategoryService } from '@/app/lib/api/category-service';
import { Category, CategoriesResponse } from '@/app/lib/types/category';
import CategoriesTable from '@/app/components/categories/category-table';
import CategoryDetailModal from '@/app/components/categories/category-detail-modal';
import CategoryCreateModal from '@/app/components/categories/category-create-modal';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
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
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
    const [searchTerm, setSearchTerm] = useState('');

    // Load categories from API
    const loadCategories = async (page: number = 0) => {
        try {
            setLoading(true);
            setError('');
            const response: CategoriesResponse = await CategoryService.getCategories(
                page,
                pagination.pageSize,
                'name',
                'asc'
            );

            console.log('Categories API Response:', response);

            if (response.success && response.data) {
                setCategories(response.data.items || []);
                setPagination({
                    totalItems: response.data.totalItems || 0,
                    currentPage: response.data.currentPage || 0,
                    pageSize: response.data.pageSize || 10,
                    totalPages: response.data.totalPages || 0
                });
            } else {
                setError(response.message || 'Failed to load categories');
            }
        } catch (err) {
            console.error('Error loading categories:', err);
            setError(err instanceof Error ? err.message : 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories(pagination.currentPage);
    }, [pagination.currentPage, pagination.pageSize]);

    const handleViewCategory = (category: Category) => {
        setSelectedCategory(category);
        setModalMode('view');
        setIsDetailModalOpen(true);
    };

    const handleEditCategory = (category: Category) => {
        setSelectedCategory(category);
        setModalMode('edit');
        setIsDetailModalOpen(true);
    };

    const handleDeleteCategory = async (id: number) => {
        if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            try {
                await CategoryService.deleteCategory(id);
                await loadCategories(pagination.currentPage);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete category');
            }
        }
    };

    const handleToggleStatus = async (id: number) => {
        try {
            await CategoryService.toggleCategoryStatus(id);
            await loadCategories(pagination.currentPage);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update category status');
        }
    };

    const handleCreateSuccess = () => {
        loadCategories(pagination.currentPage);
    };

    const handleModalClose = (refresh: boolean = false) => {
        setIsDetailModalOpen(false);
        setSelectedCategory(null);
        if (refresh) {
            loadCategories(pagination.currentPage);
        }
    };

    const handleCreateModalClose = (success: boolean = false) => {
        setIsCreateModalOpen(false);
        if (success) {
            loadCategories(pagination.currentPage);
        }
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handlePageSizeChange = (size: number) => {
        setPagination(prev => ({ ...prev, pageSize: size, currentPage: 0 }));
    };

    // Filter categories based on search term
    const filteredCategories = categories.filter(category => {
        const name = category.name || '';
        const description = category.description || '';

        return (
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.id.toString().includes(searchTerm)
        );
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Category Management</h2>
                    <p className="text-gray-600">Manage product categories and hierarchy</p>
                </div>
                <div className="space-x-3">
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        Create Category
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
                            placeholder="Search by name, description, or ID..."
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

            {/* Categories Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <CategoriesTable
                        categories={filteredCategories}
                        onView={handleViewCategory}
                        onEdit={handleEditCategory}
                        onDelete={handleDeleteCategory}
                        onToggleStatus={handleToggleStatus}
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                        totalItems={pagination.totalItems}
                        pageSize={pagination.pageSize}
                    />
                )}
            </div>

            {/* Category Create Modal */}
            <CategoryCreateModal
                isOpen={isCreateModalOpen}
                onClose={handleCreateModalClose}
                onSuccess={handleCreateSuccess}
            />

            {/* Category Detail Modal */}
            <CategoryDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleModalClose}
                category={selectedCategory}
                mode={modalMode}
            />
        </div>
    );
}