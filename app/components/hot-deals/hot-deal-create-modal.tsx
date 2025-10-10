// app/components/hot-deals/hot-deal-create-modal.tsx
'use client';

import {useState, useEffect} from 'react';
import {HotDealCreateRequest} from '@/app/lib/types/hot-deal';
import {HotDealService} from '@/app/lib/api/hot-deal-service';
import {ProductService} from '@/app/lib/api/product-service';
import {Product} from '@/app/lib/types/product';
import {Button} from '@/app/components/ui/button';
import {Input} from '@/app/components/ui/input';

interface HotDealCreateModalProps {
    isOpen: boolean;
    onClose: (success?: boolean) => void;
    onSuccess?: () => void;
}

export default function HotDealCreateModal({
                                               isOpen,
                                               onClose,
                                               onSuccess
                                           }: HotDealCreateModalProps) {
    const [formData, setFormData] = useState<HotDealCreateRequest>({
        productId: 0,
        discountType: 'PERCENTAGE',
        discountValue: 0,
        startDate: '',
        endDate: '',
        stockLimit: undefined,
    });
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [productsLoading, setProductsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadProducts();
        }
    }, [isOpen]);

    const loadProducts = async () => {
        try {
            setProductsLoading(true);
            const response = await ProductService.getAllProducts(0, 100);
            if (response.success && response.data) {
                setProducts(response.data.items || []);
            }
        } catch (err) {
            console.error('Error loading products:', err);
            setError('Failed to load products');
        } finally {
            setProductsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await HotDealService.createHotDeal(formData);
            onClose(true);
            onSuccess?.();
        } catch (err) {
            console.error('Error creating hot deal:', err);
            setError(err instanceof Error ? err.message : 'Failed to create hot deal');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value, type} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const productId = Number(e.target.value);
        setFormData(prev => ({...prev, productId}));

        const product = products.find(p => p.id === productId) || null;
        setSelectedProduct(product);
    };

    const handleClose = () => {
        setFormData({
            productId: 0,
            discountType: 'PERCENTAGE',
            discountValue: 0,
            startDate: '',
            endDate: '',
            stockLimit: undefined,
        });
        setSelectedProduct(null);
        setError('');
        onClose();
    };

    const calculateDealPrice = () => {
        if (!selectedProduct || !formData.discountValue) return null;

        if (formData.discountType === 'PERCENTAGE') {
            const discountAmount = selectedProduct.price * (formData.discountValue / 100);
            return Math.max(selectedProduct.price - discountAmount, 0);
        } else {
            return Math.max(selectedProduct.price - formData.discountValue, 0);
        }
    };

    if (!isOpen) return null;

    const dealPrice = calculateDealPrice();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Create New Hot Deal
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

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Product Selection */}
                        <div>
                            <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-1">
                                Product *
                            </label>
                            <select
                                id="productId"
                                name="productId"
                                value={formData.productId}
                                onChange={handleProductChange}
                                required
                                disabled={loading || productsLoading}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value={0}>Select a product</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} - ${product.price} (SKU: {product.sku})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedProduct && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    {selectedProduct.images?.[0]?.imageUrl && (
                                        <img
                                            src={selectedProduct.images[0].imageUrl}
                                            alt={selectedProduct.name}
                                            className="h-12 w-12 object-cover rounded"
                                        />
                                    )}
                                    <div>
                                        <div className="font-medium text-gray-900">{selectedProduct.name}</div>
                                        <div className="text-sm text-gray-500">SKU: {selectedProduct.sku}</div>
                                        <div className="text-sm font-medium text-gray-900">
                                            Original Price: ${selectedProduct.price}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Discount Type */}
                            <div>
                                <label htmlFor="discountType" className="block text-sm font-medium text-gray-700 mb-1">
                                    Discount Type *
                                </label>
                                <select
                                    id="discountType"
                                    name="discountType"
                                    value={formData.discountType}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    <option value="PERCENTAGE">Percentage</option>
                                    <option value="FIXED_AMOUNT">Fixed Amount</option>
                                </select>
                            </div>

                            {/* Discount Value */}
                            <div>
                                <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700 mb-1">
                                    Discount Value *
                                    {formData.discountType === 'PERCENTAGE' && (
                                        <span className="text-xs text-gray-500 ml-1">(%)</span>
                                    )}
                                    {formData.discountType === 'FIXED_AMOUNT' && (
                                        <span className="text-xs text-gray-500 ml-1">($)</span>
                                    )}
                                </label>
                                <Input
                                    id="discountValue"
                                    name="discountValue"
                                    type="number"
                                    step={formData.discountType === 'PERCENTAGE' ? 1 : 0.01}
                                    min="0"
                                    max={formData.discountType === 'PERCENTAGE' ? 100 : undefined}
                                    value={formData.discountValue}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Calculated Deal Price */}
                        {dealPrice !== null && selectedProduct && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-green-800">Deal Price:</span>
                                    <div className="text-right">
                                        <span className="text-lg font-bold text-green-900">
                                            ${dealPrice.toFixed(2)}
                                        </span>
                                        <span className="text-sm text-green-700 line-through ml-2">
                                            ${selectedProduct.price}
                                        </span>
                                        <div className="text-xs text-green-600">
                                            You save: ${(selectedProduct.price - dealPrice).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Start Date */}
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date *
                                </label>
                                <Input
                                    id="startDate"
                                    name="startDate"
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date *
                                </label>
                                <Input
                                    id="endDate"
                                    name="endDate"
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Stock Limit */}
                        <div>
                            <label htmlFor="stockLimit" className="block text-sm font-medium text-gray-700 mb-1">
                                Stock Limit (Optional)
                            </label>
                            <Input
                                id="stockLimit"
                                name="stockLimit"
                                type="number"
                                min="1"
                                value={formData.stockLimit || ''}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="Leave empty for unlimited stock"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Set a limit for flash sales. Leave empty for no limit.
                            </p>
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
                                disabled={loading || !formData.productId}
                                className="bg-red-600 hover:bg-red-700"
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
                                        Creating...
                                    </div>
                                ) : (
                                    'Create Hot Deal'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}