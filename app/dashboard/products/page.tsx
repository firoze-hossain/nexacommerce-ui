// app/dashboard/products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { ProductService } from '@/app/lib/api/product-service';
import { Product, ProductsResponse } from '@/app/lib/types/product';
import ProductsTable from '@/app/components/products/product-table';
import ProductDetailModal from '@/app/components/products/product-detail-modal';
import ProductCreateModal from '@/app/components/products/product-create-modal';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [pagination, setPagination] = useState({
        totalItems: 0,
        currentPage: 0,
        pageSize: 12,
        totalPages: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    // Load products from API
    const loadProducts = async (page: number = 0) => {
        try {
            setLoading(true);
            setError('');

            let response: ProductsResponse;

            if (statusFilter) {
                response = await ProductService.getProductsByStatus(
                    statusFilter,
                    page,
                    pagination.pageSize
                );
            } else {
                response = await ProductService.getAllProducts(
                    page,
                    pagination.pageSize,
                    'createdAt',
                    'desc'
                );
            }

            console.log('Products API Response:', response);

            if (response.success && response.data) {
                setProducts(response.data.items || []);
                setPagination({
                    totalItems: response.data.totalItems || 0,
                    currentPage: response.data.currentPage || 0,
                    pageSize: response.data.pageSize || 12,
                    totalPages: response.data.totalPages || 0
                });
            } else {
                setError(response.message || 'Failed to load products');
            }
        } catch (err) {
            console.error('Error loading products:', err);
            setError(err instanceof Error ? err.message : 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts(pagination.currentPage);
    }, [pagination.currentPage, pagination.pageSize, statusFilter]);

    const handleViewProduct = (product: Product) => {
        setSelectedProduct(product);
        setModalMode('view');
        setIsDetailModalOpen(true);
    };

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product);
        setModalMode('edit');
        setIsDetailModalOpen(true);
    };

    const handleDeleteProduct = async (id: number) => {
        if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            try {
                await ProductService.deleteProduct(id);
                await loadProducts(pagination.currentPage);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete product');
            }
        }
    };

    const handleStatusChange = async (id: number, status: string) => {
        try {
            await ProductService.updateProductStatus(id, status);
            await loadProducts(pagination.currentPage);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update product status');
        }
    };

    const handleStockUpdate = async (id: number, stock: number) => {
        try {
            await ProductService.updateProductStock(id, stock);
            await loadProducts(pagination.currentPage);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update product stock');
        }
    };

    const handleCreateSuccess = () => {
        loadProducts(pagination.currentPage);
    };

    const handleModalClose = (refresh: boolean = false) => {
        setIsDetailModalOpen(false);
        setSelectedProduct(null);
        if (refresh) {
            loadProducts(pagination.currentPage);
        }
    };

    const handleCreateModalClose = (success: boolean = false) => {
        setIsCreateModalOpen(false);
        if (success) {
            loadProducts(pagination.currentPage);
        }
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handlePageSizeChange = (size: number) => {
        setPagination(prev => ({ ...prev, pageSize: size, currentPage: 0 }));
    };

    const handleSearch = async () => {
        if (searchTerm.trim()) {
            try {
                setLoading(true);
                const response = await ProductService.searchProducts(
                    searchTerm,
                    0,
                    pagination.pageSize
                );

                if (response.success && response.data) {
                    setProducts(response.data.items || []);
                    setPagination({
                        totalItems: response.data.totalItems || 0,
                        currentPage: response.data.currentPage || 0,
                        pageSize: response.data.pageSize || 12,
                        totalPages: response.data.totalPages || 0
                    });
                }
            } catch (err) {
                console.error('Error searching products:', err);
                setError(err instanceof Error ? err.message : 'Failed to search products');
            } finally {
                setLoading(false);
            }
        } else {
            loadProducts(0);
        }
    };

    // Filter products based on search term
    const filteredProducts = products.filter(product => {
        const name = product.name || '';
        const sku = product.sku || '';
        const description = product.description || '';

        return (
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.id.toString().includes(searchTerm)
        );
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h2>
                    <p className="text-gray-600">Manage your product catalog and inventory</p>
                </div>
                <div className="space-x-3">
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        Create Product
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
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="w-full sm:w-64">
                            <Input
                                type="text"
                                placeholder="Search by name, SKU, or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full"
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            variant="outline"
                            className="whitespace-nowrap"
                        >
                            Search
                        </Button>
                    </div>

                    <div className="flex items-center space-x-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Status</option>
                            <option value="DRAFT">Draft</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="OUT_OF_STOCK">Out of Stock</option>
                            <option value="DISCONTINUED">Discontinued</option>
                        </select>

                        <select
                            value={pagination.pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value={12}>12 per page</option>
                            <option value={24}>24 per page</option>
                            <option value={48}>48 per page</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <ProductsTable
                        products={filteredProducts}
                        onView={handleViewProduct}
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteProduct}
                        onStatusChange={handleStatusChange}
                        onStockUpdate={handleStockUpdate}
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                        totalItems={pagination.totalItems}
                        pageSize={pagination.pageSize}
                    />
                )}
            </div>

            {/* Product Create Modal */}
            <ProductCreateModal
                isOpen={isCreateModalOpen}
                onClose={handleCreateModalClose}
                onSuccess={handleCreateSuccess}
            />

            {/* Product Detail Modal */}
            <ProductDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleModalClose}
                product={selectedProduct}
                mode={modalMode}
            />
        </div>
    );
}