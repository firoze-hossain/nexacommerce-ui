// app/components/products/product-create-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import { ProductCreateRequest } from '@/app/lib/types/product';
import { ProductService } from '@/app/lib/api/product-service';
import { CategoryService } from '@/app/lib/api/category-service';
import { Category } from '@/app/lib/types/category';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

interface ProductCreateModalProps {
    isOpen: boolean;
    onClose: (success?: boolean) => void;
    onSuccess?: () => void;
}

export default function ProductCreateModal({
                                               isOpen,
                                               onClose,
                                               onSuccess
                                           }: ProductCreateModalProps) {
    const [formData, setFormData] = useState<ProductCreateRequest>({
        categoryId: 0,
        name: '',
        description: '',
        shortDescription: '',
        price: 0,
        stock: 0,
        sku: '',
        trackQuantity: true,
        allowBackorder: false,
        status: 'DRAFT',
        featured: false,
        published: false,
        images: [],
        attributes: []
    });
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadCategories();
        }
    }, [isOpen]);

    const loadCategories = async () => {
        try {
            const response = await CategoryService.getCategories(0, 100);
            setCategories(response.data?.items || []);
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await ProductService.createProduct(formData);
            onClose(true);
            onSuccess?.();
        } catch (err) {
            console.error('Error creating product:', err);
            setError(err instanceof Error ? err.message : 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? Number(value) : value,
        }));
    };

    const handleClose = () => {
        setFormData({
            categoryId: 0,
            name: '',
            description: '',
            shortDescription: '',
            price: 0,
            stock: 0,
            sku: '',
            trackQuantity: true,
            allowBackorder: false,
            status: 'DRAFT',
            featured: false,
            published: false,
            images: [],
            attributes: []
        });
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Create New Product
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-red-800 text-sm font-medium">{error}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Name *
                                </label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="Enter product name"
                                />
                            </div>

                            <div>
                                <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                                    SKU *
                                </label>
                                <Input
                                    id="sku"
                                    name="sku"
                                    type="text"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="Enter SKU"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                                Category *
                            </label>
                            <select
                                id="categoryId"
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value={0}>Select a category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                    Price *
                                </label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                                    Stock *
                                </label>
                                <Input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                disabled={loading}
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter product description"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center">
                                <input
                                    id="featured"
                                    name="featured"
                                    type="checkbox"
                                    checked={formData.featured}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                                    Featured
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="published"
                                    name="published"
                                    type="checkbox"
                                    checked={formData.published}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                                    Published
                                </label>
                            </div>

                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
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
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </div>
                                ) : (
                                    'Create Product'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}