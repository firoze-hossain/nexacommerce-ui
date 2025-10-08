// app/components/products/product-detail-modal.tsx
'use client';

import {Product, ProductUpdateRequest} from '@/app/lib/types/product';
import {ProductService} from '@/app/lib/api/product-service';
import {Button} from '@/app/components/ui/button';
import {Input} from '@/app/components/ui/input';
import {formatCurrency, formatDate} from '@/app/lib/utils/formatters';
import {useEffect, useState} from 'react';

interface ProductDetailModalProps {
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
    product: Product | null;
    mode: 'view' | 'edit';
}

export default function ProductDetailModal({
                                               isOpen,
                                               onClose,
                                               product,
                                               mode
                                           }: ProductDetailModalProps) {
    const [productDetail, setProductDetail] = useState<Product | null>(null);
    const [formData, setFormData] = useState<ProductUpdateRequest>({});
    const [loading, setLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState('');

    // Load full product details when modal opens
    useEffect(() => {
        if (isOpen && product) {
            loadProductDetail(product.id);
        }
    }, [isOpen, product]);

    const loadProductDetail = async (productId: number) => {
        try {
            setDetailLoading(true);
            const response = await ProductService.getProductById(productId);
            setProductDetail(response.data);

            // Initialize form data for edit mode
            if (mode === 'edit') {
                setFormData({
                    name: response.data.name,
                    description: response.data.description || '',
                    shortDescription: response.data.shortDescription || '',
                    price: response.data.price,
                    compareAtPrice: response.data.compareAtPrice || undefined,
                    stock: response.data.stock,
                    lowStockThreshold: response.data.lowStockThreshold || undefined,
                    barcode: response.data.barcode || '',
                    trackQuantity: response.data.trackQuantity,
                    allowBackorder: response.data.allowBackorder,
                    weight: response.data.weight || undefined,
                    weightUnit: response.data.weightUnit || '',
                    status: response.data.status,
                    featured: response.data.featured,
                    published: response.data.published,
                    metaTitle: response.data.metaTitle || '',
                    metaDescription: response.data.metaDescription || '',
                    tags: response.data.tags || '',
                    images: response.data.images || [],
                    attributes: response.data.attributes || []
                });
            }
        } catch (err) {
            console.error('Error loading product details:', err);
            setError('Failed to load product details');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;

        setLoading(true);
        setError('');

        try {
            await ProductService.updateProduct(product.id, formData);
            onClose(true);
        } catch (err) {
            console.error('Error updating product:', err);
            setError(err instanceof Error ? err.message : 'Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value, type} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? Number(value) : value,
        }));
    };

    const handleClose = () => {
        setProductDetail(null);
        setFormData({});
        setError('');
        onClose();
    };

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {mode === 'view' ? 'Product Details' : 'Edit Product'}
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
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

                    {detailLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : productDetail ? (
                        mode === 'view' ? (
                            // View Mode
                            <div className="space-y-6">
                                {/* Product Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Basic Information</h4>
                                        <dl className="space-y-2">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Name</dt>
                                                <dd className="text-sm text-gray-900">{productDetail.name}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">SKU</dt>
                                                <dd className="text-sm text-gray-900">{productDetail.sku}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Description</dt>
                                                <dd className="text-sm text-gray-900">
                                                    {productDetail.description || 'No description'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Category</dt>
                                                <dd className="text-sm text-gray-900">{productDetail.categoryName}</dd>
                                            </div>
                                            {/* NEW: Brand Information */}
                                            {productDetail.brandName && (
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Brand</dt>
                                                    <dd className="text-sm text-gray-900">{productDetail.brandName}</dd>
                                                </div>
                                            )}
                                        </dl>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Pricing & Inventory</h4>
                                        <dl className="space-y-2">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Price</dt>
                                                <dd className="text-sm text-gray-900">{formatCurrency(productDetail.price)}</dd>
                                            </div>
                                            {productDetail.compareAtPrice && (
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Compare Price</dt>
                                                    <dd className="text-sm text-gray-900 line-through">
                                                        {formatCurrency(productDetail.compareAtPrice)}
                                                    </dd>
                                                </div>
                                            )}
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Stock</dt>
                                                <dd className="text-sm text-gray-900">{productDetail.stock}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Status</dt>
                                                <dd className="text-sm">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                            productDetail.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                                productDetail.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                                                                    productDetail.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                                                                        productDetail.status === 'OUT_OF_STOCK' ? 'bg-orange-100 text-orange-800' :
                                                                            'bg-purple-100 text-purple-800'
                                                        }`}>
                                                        {productDetail.status}
                                                    </span>
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>

                                {/* Images */}
                                {productDetail.images && productDetail.images.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Product Images</h4>
                                        <div className="flex space-x-2 overflow-x-auto">
                                            {productDetail.images.map((image, index) => (
                                                <img
                                                    key={image.id}
                                                    src={image.imageUrl}
                                                    alt={image.altText || `Product image ${index + 1}`}
                                                    className="h-20 w-20 object-cover rounded-lg"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Attributes */}
                                {productDetail.attributes && productDetail.attributes.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Attributes</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {productDetail.attributes.map((attribute) => (
                                                <div key={attribute.id} className="flex justify-between">
                                                    <span
                                                        className="text-sm font-medium text-gray-500">{attribute.name}:</span>
                                                    <span className="text-sm text-gray-900">{attribute.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Vendor Info */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Vendor Information</h4>
                                    <dl className="space-y-2">
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Vendor</dt>
                                            <dd className="text-sm text-gray-900">{productDetail.vendorName}</dd>
                                        </div>
                                    </dl>
                                </div>

                                {/* Timestamps */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Created At</dt>
                                        <dd className="text-sm text-gray-900">{formatDate(productDetail.createdAt)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Updated At</dt>
                                        <dd className="text-sm text-gray-900">{formatDate(productDetail.updatedAt)}</dd>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Edit Mode - Simplified for example
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Name *
                                        </label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={formData.name || ''}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                            Price *
                                        </label>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            step="0.01"
                                            value={formData.price || 0}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                {/* NEW: Brand field in edit mode */}
                                <div>
                                    <label htmlFor="brandId" className="block text-sm font-medium text-gray-700 mb-1">
                                        Brand
                                    </label>
                                    <select
                                        id="brandId"
                                        name="brandId"
                                        value={formData.brandId || ''}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">No brand</option>
                                        {/* You might want to load brands here as well for edit mode */}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="description"
                                           className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description || ''}
                                        onChange={handleChange}
                                        disabled={loading}
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                                            Stock
                                        </label>
                                        <Input
                                            id="stock"
                                            name="stock"
                                            type="number"
                                            value={formData.stock || 0}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="status"
                                               className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={formData.status || 'DRAFT'}
                                            onChange={handleChange}
                                            disabled={loading}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="DRAFT">Draft</option>
                                            <option value="ACTIVE">Active</option>
                                            <option value="INACTIVE">Inactive</option>
                                            <option value="OUT_OF_STOCK">Out of Stock</option>
                                            <option value="DISCONTINUED">Discontinued</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleClose}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <div className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none"
                                                     viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10"
                                                            stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor"
                                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Updating...
                                            </div>
                                        ) : (
                                            'Update Product'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-3">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <p className="text-gray-500">Loading product details...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}