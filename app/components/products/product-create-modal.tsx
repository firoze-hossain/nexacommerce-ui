// app/components/products/product-create-modal.tsx
'use client';

import {useEffect, useState} from 'react';
import {
    ProductAttributeRequest,
    ProductCreateRequest,
    ProductImageRequest,
    ProductUpdateRequest
} from '@/app/lib/types/product';
import {ProductService} from '@/app/lib/api/product-service';
import {CategoryService} from '@/app/lib/api/category-service';
import {BrandService} from '@/app/lib/api/brand-service';
import {Category} from '@/app/lib/types/category';
import {Button} from '@/app/components/ui/button';
import {Input} from '@/app/components/ui/input';
import {Brand} from '@/app/lib/types/brand';

interface ProductCreateModalProps {
    isOpen: boolean;
    onClose: (success?: boolean) => void;
    onSuccess?: () => void;
    product?: any; // For edit mode
    mode?: 'create' | 'edit';
}

export default function ProductCreateModal({
                                               isOpen,
                                               onClose,
                                               onSuccess,
                                               product,
                                               mode = 'create'
                                           }: ProductCreateModalProps) {
    const [formData, setFormData] = useState<ProductCreateRequest | ProductUpdateRequest>({
        categoryId: 0,
        brandId: undefined,
        name: '',
        description: '',
        shortDescription: '',
        price: 0,
        compareAtPrice: undefined,
        stock: 0,
        lowStockThreshold: undefined,
        sku: '',
        barcode: '',
        trackQuantity: true,
        allowBackorder: false,
        weight: undefined,
        weightUnit: '',
        status: 'DRAFT',
        featured: false,
        published: false,
        metaTitle: '',
        metaDescription: '',
        tags: '',
        images: [],
        attributes: []
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageInput, setImageInput] = useState('');
    const [attributeInput, setAttributeInput] = useState({name: '', value: '', displayType: 'TEXT'});

    useEffect(() => {
        if (isOpen) {
            loadCategories();
            loadBrands();
            if (mode === 'edit' && product) {
                initializeEditData();
            }
        }
    }, [isOpen, mode, product]);

    const loadCategories = async () => {
        try {
            const response = await CategoryService.getCategories(0, 100);
            setCategories(response.data?.items || []);
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    };
    const loadBrands = async () => {
        try {
            const response = await BrandService.getBrands(0, 100);
            setBrands(response.data?.items || []);
        } catch (err) {
            console.error('Error loading brands:', err);
        }
    };
    const initializeEditData = () => {
        if (product) {
            setFormData({
                categoryId: product.categoryId || 0,
                brandId: product.brandId || undefined,
                name: product.name || '',
                description: product.description || '',
                shortDescription: product.shortDescription || '',
                price: product.price || 0,
                compareAtPrice: product.compareAtPrice || undefined,
                stock: product.stock || 0,
                lowStockThreshold: product.lowStockThreshold || undefined,
                sku: product.sku || '',
                barcode: product.barcode || '',
                trackQuantity: product.trackQuantity ?? true,
                allowBackorder: product.allowBackorder ?? false,
                weight: product.weight || undefined,
                weightUnit: product.weightUnit || '',
                status: product.status || 'DRAFT',
                featured: product.featured || false,
                published: product.published || false,
                metaTitle: product.metaTitle || '',
                metaDescription: product.metaDescription || '',
                tags: product.tags || '',
                images: product.images || [],
                attributes: product.attributes || []
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (mode === 'create') {
                await ProductService.createProduct(formData as ProductCreateRequest);
            } else if (mode === 'edit' && product) {
                await ProductService.updateProduct(product.id, formData as ProductUpdateRequest);
            }
            onClose(true);
            onSuccess?.();
        } catch (err) {
            console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} product:`, err);
            setError(err instanceof Error ? err.message : `Failed to ${mode === 'create' ? 'create' : 'update'} product`);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value, type} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? (value === '' ? undefined : Number(value)) : value,
        }));
    };

    const handleAddImage = () => {
        if (imageInput.trim()) {
            const newImage: ProductImageRequest = {
                imageUrl: imageInput.trim(),
                altText: '',
                displayOrder: (formData.images?.length || 0) + 1,
                isPrimary: (formData.images?.length || 0) === 0
            };

            setFormData(prev => ({
                ...prev,
                images: [...(prev.images || []), newImage]
            }));
            setImageInput('');
        }
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index) || []
        }));
    };

    const handleAddAttribute = () => {
        if (attributeInput.name.trim() && attributeInput.value.trim()) {
            const newAttribute: ProductAttributeRequest = {
                name: attributeInput.name.trim(),
                value: attributeInput.value.trim(),
                displayType: attributeInput.displayType,
                displayOrder: (formData.attributes?.length || 0) + 1
            };

            setFormData(prev => ({
                ...prev,
                attributes: [...(prev.attributes || []), newAttribute]
            }));
            setAttributeInput({name: '', value: '', displayType: 'TEXT'});
        }
    };

    const handleRemoveAttribute = (index: number) => {
        setFormData(prev => ({
            ...prev,
            attributes: prev.attributes?.filter((_, i) => i !== index) || []
        }));
    };

    const handleClose = () => {
        setFormData({
            categoryId: 0,
            name: '',
            description: '',
            shortDescription: '',
            price: 0,
            compareAtPrice: undefined,
            stock: 0,
            lowStockThreshold: undefined,
            sku: '',
            barcode: '',
            trackQuantity: true,
            allowBackorder: false,
            weight: undefined,
            weightUnit: '',
            status: 'DRAFT',
            featured: false,
            published: false,
            metaTitle: '',
            metaDescription: '',
            tags: '',
            images: [],
            attributes: []
        });
        setImageInput('');
        setAttributeInput({name: '', value: '', displayType: 'TEXT'});
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {mode === 'create' ? 'Create New Product' : 'Edit Product'}
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
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Product Name *
                                    </label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name || ''}
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
                                        value={formData.sku || ''}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        placeholder="Enter SKU"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="categoryId"
                                           className="block text-sm font-medium text-gray-700 mb-1">
                                        Category *
                                    </label>
                                    <select
                                        id="categoryId"
                                        name="categoryId"
                                        value={formData.categoryId || 0}
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
                                {/* NEW: Brand Selection */}
                                <div>
                                    <label htmlFor="brandId"
                                           className="block text-sm font-medium text-gray-700 mb-1">
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
                                        <option value="">Select a brand (optional)</option>
                                        {brands.map((brand) => (
                                            <option key={brand.id} value={brand.id}>
                                                {brand.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">
                                        Barcode
                                    </label>
                                    <Input
                                        id="barcode"
                                        name="barcode"
                                        type="text"
                                        value={formData.barcode || ''}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder="Enter barcode"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label htmlFor="shortDescription"
                                       className="block text-sm font-medium text-gray-700 mb-1">
                                    Short Description
                                </label>
                                <textarea
                                    id="shortDescription"
                                    name="shortDescription"
                                    value={formData.shortDescription || ''}
                                    onChange={handleChange}
                                    disabled={loading}
                                    rows={2}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Brief product description"
                                />
                            </div>

                            <div className="mt-4">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description || ''}
                                    onChange={handleChange}
                                    disabled={loading}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Detailed product description"
                                />
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Pricing</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                        Price *
                                    </label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price || 0}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="compareAtPrice"
                                           className="block text-sm font-medium text-gray-700 mb-1">
                                        Compare Price
                                    </label>
                                    <Input
                                        id="compareAtPrice"
                                        name="compareAtPrice"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.compareAtPrice || ''}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder="Original price"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Inventory */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Inventory</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                                        Stock Quantity *
                                    </label>
                                    <Input
                                        id="stock"
                                        name="stock"
                                        type="number"
                                        min="0"
                                        value={formData.stock || 0}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="lowStockThreshold"
                                           className="block text-sm font-medium text-gray-700 mb-1">
                                        Low Stock Threshold
                                    </label>
                                    <Input
                                        id="lowStockThreshold"
                                        name="lowStockThreshold"
                                        type="number"
                                        min="0"
                                        value={formData.lowStockThreshold || ''}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder="Alert when stock is low"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="flex items-center">
                                    <input
                                        id="trackQuantity"
                                        name="trackQuantity"
                                        type="checkbox"
                                        checked={formData.trackQuantity || false}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="trackQuantity" className="ml-2 block text-sm text-gray-900">
                                        Track Quantity
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="allowBackorder"
                                        name="allowBackorder"
                                        type="checkbox"
                                        checked={formData.allowBackorder || false}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="allowBackorder" className="ml-2 block text-sm text-gray-900">
                                        Allow Backorders
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Shipping */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Shipping</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                                        Weight
                                    </label>
                                    <Input
                                        id="weight"
                                        name="weight"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.weight || ''}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="weightUnit"
                                           className="block text-sm font-medium text-gray-700 mb-1">
                                        Weight Unit
                                    </label>
                                    <select
                                        id="weightUnit"
                                        name="weightUnit"
                                        value={formData.weightUnit || ''}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select unit</option>
                                        <option value="kg">kg</option>
                                        <option value="g">g</option>
                                        <option value="lb">lb</option>
                                        <option value="oz">oz</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Product Images</h4>
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <Input
                                        type="url"
                                        value={imageInput}
                                        onChange={(e) => setImageInput(e.target.value)}
                                        placeholder="Enter image URL"
                                        className="flex-1"
                                        disabled={loading}
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleAddImage}
                                        disabled={loading || !imageInput.trim()}
                                        variant="outline"
                                    >
                                        Add Image
                                    </Button>
                                </div>

                                {formData.images && formData.images.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {formData.images.map((image, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={image.imageUrl}
                                                    alt={image.altText || `Product image ${index + 1}`}
                                                    className="h-20 w-20 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    disabled={loading}
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor"
                                                         viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Attributes */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Product Attributes</h4>
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                    <Input
                                        type="text"
                                        value={attributeInput.name}
                                        onChange={(e) => setAttributeInput(prev => ({...prev, name: e.target.value}))}
                                        placeholder="Attribute name"
                                        disabled={loading}
                                    />
                                    <Input
                                        type="text"
                                        value={attributeInput.value}
                                        onChange={(e) => setAttributeInput(prev => ({...prev, value: e.target.value}))}
                                        placeholder="Attribute value"
                                        disabled={loading}
                                    />
                                    <select
                                        value={attributeInput.displayType}
                                        onChange={(e) => setAttributeInput(prev => ({
                                            ...prev,
                                            displayType: e.target.value
                                        }))}
                                        disabled={loading}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="TEXT">Text</option>
                                        <option value="COLOR">Color</option>
                                        <option value="IMAGE">Image</option>
                                        <option value="SIZE">Size</option>
                                    </select>
                                    <Button
                                        type="button"
                                        onClick={handleAddAttribute}
                                        disabled={loading || !attributeInput.name.trim() || !attributeInput.value.trim()}
                                        variant="outline"
                                    >
                                        Add Attribute
                                    </Button>
                                </div>

                                {formData.attributes && formData.attributes.length > 0 && (
                                    <div className="space-y-2">
                                        {formData.attributes.map((attr, index) => (
                                            <div key={index}
                                                 className="flex items-center justify-between bg-white p-3 rounded-lg border">
                                                <div className="flex-1">
                                                    <span className="font-medium text-sm">{attr.name}: </span>
                                                    <span className="text-sm text-gray-600">{attr.value}</span>
                                                    <span
                                                        className="text-xs text-gray-400 ml-2">({attr.displayType})</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAttribute(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                    disabled={loading}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                         viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SEO & Settings */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">SEO & Settings</h4>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                                        Meta Title
                                    </label>
                                    <Input
                                        id="metaTitle"
                                        name="metaTitle"
                                        type="text"
                                        value={formData.metaTitle || ''}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder="SEO meta title"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="metaDescription"
                                           className="block text-sm font-medium text-gray-700 mb-1">
                                        Meta Description
                                    </label>
                                    <textarea
                                        id="metaDescription"
                                        name="metaDescription"
                                        value={formData.metaDescription || ''}
                                        onChange={handleChange}
                                        disabled={loading}
                                        rows={2}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="SEO meta description"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tags
                                    </label>
                                    <Input
                                        id="tags"
                                        name="tags"
                                        type="text"
                                        value={formData.tags || ''}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder="tag1, tag2, tag3"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                            Featured Product
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="published"
                                            name="published"
                                            type="checkbox"
                                            checked={formData.published || false}
                                            onChange={handleChange}
                                            disabled={loading}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                                            Published
                                        </label>
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
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-4 border-t">
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
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none"
                                             viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {mode === 'create' ? 'Creating...' : 'Updating...'}
                                    </div>
                                ) : (
                                    mode === 'create' ? 'Create Product' : 'Update Product'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}