// app/components/brands/brand-detail-modal.tsx
'use client';

import {Brand, BrandUpdateRequest, BrandWithProductsResponse} from '@/app/lib/types/brand';
import {BrandService} from '@/app/lib/api/brand-service';
import {Button} from '@/app/components/ui/button';
import {Input} from '@/app/components/ui/input';
import {formatDate} from '@/app/lib/utils/formatters';
import {useEffect, useState} from 'react';

interface BrandDetailModalProps {
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
    brand: Brand | null;
    mode: 'view' | 'edit';
}

export default function BrandDetailModal({
                                             isOpen,
                                             onClose,
                                             brand,
                                             mode
                                         }: BrandDetailModalProps) {
    const [brandDetail, setBrandDetail] = useState<BrandWithProductsResponse | null>(null);
    const [formData, setFormData] = useState<BrandUpdateRequest>({});
    const [loading, setLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState('');

    // Load full brand details when modal opens
    useEffect(() => {
        if (isOpen && brand) {
            loadBrandDetail(brand.id);
        }
    }, [isOpen, brand]);

    const loadBrandDetail = async (brandId: number) => {
        try {
            setDetailLoading(true);
            const response = await BrandService.getBrandWithProducts(brandId);
            setBrandDetail(response.data);

            // Initialize form data for edit mode
            if (mode === 'edit') {
                setFormData({
                    name: response.data.name,
                    description: response.data.description || '',
                    slug: response.data.slug || '',
                    logoUrl: response.data.logoUrl || '',
                    websiteUrl: response.data.websiteUrl || '',
                    featured: response.data.featured,
                    active: response.data.active,
                });
            }
        } catch (err) {
            console.error('Error loading brand details:', err);
            setError('Failed to load brand details');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!brand) return;

        setLoading(true);
        setError('');

        try {
            await BrandService.updateBrand(brand.id, formData);
            onClose(true);
        } catch (err) {
            console.error('Error updating brand:', err);
            setError(err instanceof Error ? err.message : 'Failed to update brand');
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
        setBrandDetail(null);
        setFormData({});
        setError('');
        onClose();
    };

    if (!isOpen || !brand) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {mode === 'view' ? 'Brand Details' : 'Edit Brand'}
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
                    ) : brandDetail ? (
                        mode === 'view' ? (
                            // View Mode
                            <div className="space-y-6">
                                {/* Brand Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Basic Information</h4>
                                        <dl className="space-y-2">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Name</dt>
                                                <dd className="text-sm text-gray-900">{brandDetail.name}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Description</dt>
                                                <dd className="text-sm text-gray-900">
                                                    {brandDetail.description || 'No description'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Slug</dt>
                                                <dd className="text-sm text-gray-900">{brandDetail.slug || 'Not set'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Website</dt>
                                                <dd className="text-sm text-gray-900">
                                                    {brandDetail.websiteUrl ? (
                                                        <a href={brandDetail.websiteUrl} target="_blank"
                                                           rel="noopener noreferrer"
                                                           className="text-blue-600 hover:text-blue-800">
                                                            {brandDetail.websiteUrl}
                                                        </a>
                                                    ) : 'Not set'}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Settings</h4>
                                        <dl className="space-y-2">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Status</dt>
                                                <dd className="text-sm">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                            brandDetail.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {brandDetail.active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Featured</dt>
                                                <dd className="text-sm">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                            brandDetail.featured ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {brandDetail.featured ? 'Yes' : 'No'}
                                                    </span>
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Product Count</dt>
                                                <dd className="text-sm text-gray-900">{brandDetail.products?.length || 0}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>

                                {/* Logo */}
                                {brandDetail.logoUrl && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Brand Logo</h4>
                                        <div className="mt-1">
                                            <img
                                                src={brandDetail.logoUrl}
                                                alt={brandDetail.name}
                                                className="h-32 w-32 object-contain rounded-lg border border-gray-200"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Products */}
                                {brandDetail.products && brandDetail.products.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-3">Products
                                            ({brandDetail.products.length})</h4>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {brandDetail.products.map((product) => (
                                                    <div key={product.id}
                                                         className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                                                        {product.imageUrl && (
                                                            <img
                                                                src={product.imageUrl}
                                                                alt={product.name}
                                                                className="h-12 w-12 object-cover rounded"
                                                            />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                                            <p className="text-sm text-gray-500">{product.sku}</p>
                                                            <span
                                                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                                                                    product.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {product.published ? 'Published' : 'Draft'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Timestamps */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Created At</dt>
                                        <dd className="text-sm text-gray-900">{formatDate(brandDetail.createdAt)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Updated At</dt>
                                        <dd className="text-sm text-gray-900">{formatDate(brandDetail.updatedAt)}</dd>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Edit Mode
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
                                        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                                            Slug
                                        </label>
                                        <Input
                                            id="slug"
                                            name="slug"
                                            type="text"
                                            value={formData.slug || ''}
                                            onChange={handleChange}
                                            disabled={loading}
                                            placeholder="brand-slug"
                                        />
                                    </div>
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
                                        <label htmlFor="logoUrl"
                                               className="block text-sm font-medium text-gray-700 mb-1">
                                            Logo URL
                                        </label>
                                        <Input
                                            id="logoUrl"
                                            name="logoUrl"
                                            type="url"
                                            value={formData.logoUrl || ''}
                                            onChange={handleChange}
                                            disabled={loading}
                                            placeholder="https://example.com/logo.png"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="websiteUrl"
                                               className="block text-sm font-medium text-gray-700 mb-1">
                                            Website URL
                                        </label>
                                        <Input
                                            id="websiteUrl"
                                            name="websiteUrl"
                                            type="url"
                                            value={formData.websiteUrl || ''}
                                            onChange={handleChange}
                                            disabled={loading}
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                        <input
                                            id="featured"
                                            name="featured"
                                            type="checkbox"
                                            checked={formData.featured || false}
                                            onChange={handleChange}
                                            disabled={loading}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                                            Featured Brand
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="active"
                                            name="active"
                                            type="checkbox"
                                            checked={formData.active || false}
                                            onChange={handleChange}
                                            disabled={loading}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                                            Active
                                        </label>
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
                                            'Update Brand'
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
                            <p className="text-gray-500">Loading brand details...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}