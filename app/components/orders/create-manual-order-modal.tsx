// app/components/orders/create-manual-order-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { OrderService } from '@/app/lib/api/order-service';
import { ManualOrderRequest, OrderItemRequest } from '@/app/lib/types/admin-order';

interface CreateManualOrderModalProps {
    onClose: () => void;
    onOrderCreated: () => void;
}

interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    sku: string;
}

export default function CreateManualOrderModal({ onClose, onOrderCreated }: CreateManualOrderModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);

    const [formData, setFormData] = useState({
        customerId: '',
        shippingAddressId: '',
        billingAddressId: '',
        useShippingAsBilling: true,
        customerNotes: '',
        internalNotes: '',
        shippingAmount: '0',
        taxAmount: '0',
        discountAmount: '0',
        couponCode: ''
    });

    const [orderItems, setOrderItems] = useState<OrderItemRequest[]>([]);

    useEffect(() => {
        // In a real app, you would fetch products from an API
        // For now, we'll use mock data
        setProducts([
            { id: 1, name: 'Premium Headphones', price: 199.99, stock: 50, sku: 'PH-001' },
            { id: 2, name: 'Wireless Mouse', price: 29.99, stock: 100, sku: 'WM-002' },
            { id: 3, name: 'Mechanical Keyboard', price: 89.99, stock: 25, sku: 'MK-003' },
            { id: 4, name: 'Monitor Stand', price: 49.99, stock: 75, sku: 'MS-004' },
        ]);
    }, []);

    const handleAddItem = () => {
        if (!selectedProduct || quantity < 1) return;

        const existingItemIndex = orderItems.findIndex(item => item.productId === selectedProduct.id);

        if (existingItemIndex >= 0) {
            // Update quantity if product already exists
            const updatedItems = [...orderItems];
            updatedItems[existingItemIndex].quantity += quantity;
            setOrderItems(updatedItems);
        } else {
            // Add new item
            setOrderItems(prev => [...prev, {
                productId: selectedProduct.id,
                quantity: quantity
            }]);
        }

        setSelectedProduct(null);
        setQuantity(1);
    };

    const handleRemoveItem = (productId: number) => {
        setOrderItems(prev => prev.filter(item => item.productId !== productId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (orderItems.length === 0) {
            setError('Please add at least one product to the order');
            return;
        }

        if (!formData.customerId || !formData.shippingAddressId) {
            setError('Customer ID and Shipping Address ID are required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const request: ManualOrderRequest = {
                customerId: parseInt(formData.customerId),
                shippingAddressId: parseInt(formData.shippingAddressId),
                billingAddressId: formData.billingAddressId ? parseInt(formData.billingAddressId) : undefined,
                useShippingAsBilling: formData.useShippingAsBilling,
                customerNotes: formData.customerNotes,
                internalNotes: formData.internalNotes,
                shippingAmount: parseFloat(formData.shippingAmount) || 0,
                taxAmount: parseFloat(formData.taxAmount) || 0,
                discountAmount: parseFloat(formData.discountAmount) || 0,
                couponCode: formData.couponCode || undefined,
                items: orderItems,
                source: 'ADMIN_PANEL'
            };

            const response = await OrderService.createManualOrder(request);

            if (response.success) {
                onOrderCreated();
            } else {
                setError(response.message || 'Failed to create order');
            }
        } catch (err) {
            console.error('Error creating manual order:', err);
            setError('Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    const getProductById = (productId: number) => {
        return products.find(p => p.id === productId);
    };

    const calculateSubtotal = () => {
        return orderItems.reduce((total, item) => {
            const product = getProductById(item.productId);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const shipping = parseFloat(formData.shippingAmount) || 0;
        const tax = parseFloat(formData.taxAmount) || 0;
        const discount = parseFloat(formData.discountAmount) || 0;

        return subtotal + shipping + tax - discount;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Create Manual Order</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-red-800">{error}</span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Customer ID *
                                </label>
                                <Input
                                    type="number"
                                    value={formData.customerId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                                    required
                                    placeholder="Enter customer ID"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Shipping Address ID *
                                </label>
                                <Input
                                    type="number"
                                    value={formData.shippingAddressId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, shippingAddressId: e.target.value }))}
                                    required
                                    placeholder="Enter shipping address ID"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Billing Address ID
                                </label>
                                <Input
                                    type="number"
                                    value={formData.billingAddressId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, billingAddressId: e.target.value }))}
                                    placeholder="Enter billing address ID (optional)"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="useShippingAsBilling"
                                    checked={formData.useShippingAsBilling}
                                    onChange={(e) => setFormData(prev => ({ ...prev, useShippingAsBilling: e.target.checked }))}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="useShippingAsBilling" className="ml-2 text-sm text-gray-700">
                                    Use shipping address as billing address
                                </label>
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900">Order Details</h3>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Shipping
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.shippingAmount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, shippingAmount: e.target.value }))}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tax
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.taxAmount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, taxAmount: e.target.value }))}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Discount
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.discountAmount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, discountAmount: e.target.value }))}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Coupon Code
                                </label>
                                <Input
                                    value={formData.couponCode}
                                    onChange={(e) => setFormData(prev => ({ ...prev, couponCode: e.target.value }))}
                                    placeholder="Enter coupon code (optional)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Customer Notes
                                </label>
                                <Textarea
                                    value={formData.customerNotes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, customerNotes: e.target.value }))}
                                    placeholder="Enter customer notes (optional)"
                                    rows={2}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Internal Notes
                                </label>
                                <Textarea
                                    value={formData.internalNotes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, internalNotes: e.target.value }))}
                                    placeholder="Enter internal notes (optional)"
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>

                        {/* Add Item Form */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product
                                    </label>
                                    <select
                                        value={selectedProduct?.id || ''}
                                        onChange={(e) => {
                                            const product = products.find(p => p.id === parseInt(e.target.value));
                                            setSelectedProduct(product || null);
                                        }}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select a product</option>
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>
                                                {product.name} - ${product.price} (Stock: {product.stock})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantity
                                    </label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                        disabled={!selectedProduct}
                                    />
                                </div>

                                <div className="flex items-end">
                                    <Button
                                        type="button"
                                        onClick={handleAddItem}
                                        disabled={!selectedProduct || quantity < 1}
                                        className="w-full"
                                    >
                                        Add Item
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Items List */}
                        {orderItems.length > 0 ? (
                            <div className="space-y-3">
                                {orderItems.map((item, index) => {
                                    const product = getProductById(item.productId);
                                    if (!product) return null;

                                    return (
                                        <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{product.name}</p>
                                                <p className="text-sm text-gray-500">SKU: {product.sku} | Price: ${product.price}</p>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className="text-gray-600">Qty: {item.quantity}</span>
                                                <span className="font-medium text-gray-900">
                                                    ${(product.price * item.quantity).toFixed(2)}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRemoveItem(item.productId)}
                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6" />
                                </svg>
                                <p className="mt-2 text-sm text-gray-500">No items added yet</p>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    {orderItems.length > 0 && (
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping:</span>
                                        <span className="font-medium">${(parseFloat(formData.shippingAmount) || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax:</span>
                                        <span className="font-medium">${(parseFloat(formData.taxAmount) || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Discount:</span>
                                        <span className="font-medium text-green-600">-${(parseFloat(formData.discountAmount) || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-gray-200 pt-2">
                                        <span className="font-semibold text-gray-900">Total:</span>
                                        <span className="font-bold text-lg text-gray-900">${calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || orderItems.length === 0}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                'Create Order'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}