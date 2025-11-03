// app/components/orders/create-manual-order-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { OrderService } from '@/app/lib/api/order-service';
import { CustomerService } from '@/app/lib/api/customer-service';
import { AddressService } from '@/app/lib/api/address-service';
import { ProductService } from '@/app/lib/api/product-service';
import { ManualOrderRequest, OrderItemRequest } from '@/app/lib/types/admin-order';
import { CustomerWithUserInfo, CustomerDetail, CustomerRegistrationRequest } from '@/app/lib/types/customer';
import { Address, AddressRequest } from '@/app/lib/types/address';
import { Product } from '@/app/lib/types/product';

interface CreateManualOrderModalProps {
    onClose: () => void;
    onOrderCreated: () => void;
}

// Enhanced Address Form Component
function NewAddressForm({
                            onSubmit,
                            onCancel,
                            popularAreas,
                            editingAddress = null,
                            customerName = ''
                        }: {
    onSubmit: (data: AddressRequest) => void;
    onCancel: () => void;
    popularAreas: string[];
    editingAddress?: Address | null;
    customerName?: string;
}) {
    const [formData, setFormData] = useState({
        addressType: editingAddress?.addressType || 'HOME',
        fullName: editingAddress?.fullName || customerName || '',
        phone: editingAddress?.phone || '',
        area: editingAddress?.area || '',
        addressLine: editingAddress?.addressLine || '',
        city: editingAddress?.city || 'Dhaka',
        landmark: editingAddress?.landmark || '',
        isDefault: editingAddress?.isDefault || false,
        addressZone: editingAddress?.addressZone || 'INSIDE_DHAKA',
        isInsideDhaka: editingAddress?.isInsideDhaka ?? true
    });

    const handleLocationChange = (isInsideDhaka: boolean) => {
        setFormData(prev => ({
            ...prev,
            isInsideDhaka,
            addressZone: isInsideDhaka ? 'INSIDE_DHAKA' : 'OUTSIDE_DHAKA',
            city: isInsideDhaka ? 'Dhaka' : prev.city
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50 mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingAddress ? 'Edit Address' : 'Add New Address for Customer'}
            </h3>

            <div className="space-y-4">
                {/* Location Type Selection */}
                <div>
                    <label className="block text-sm font-medium mb-2">Location Type *</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => handleLocationChange(true)}
                            className={`p-3 border-2 rounded-lg text-center transition-all ${
                                formData.isInsideDhaka
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                    : 'border-gray-200 text-gray-700 hover:border-indigo-300'
                            }`}
                        >
                            <div className="font-medium">Inside Dhaka</div>
                            <div className="text-xs mt-1">1-2 days delivery • ৳60</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleLocationChange(false)}
                            className={`p-3 border-2 rounded-lg text-center transition-all ${
                                !formData.isInsideDhaka
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                    : 'border-gray-200 text-gray-700 hover:border-indigo-300'
                            }`}
                        >
                            <div className="font-medium">Outside Dhaka</div>
                            <div className="text-xs mt-1">3-5 days delivery • ৳120</div>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Full Name *</label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => handleChange('fullName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Phone Number *</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="01XXXXXXXXX"
                            required
                        />
                    </div>
                </div>

                {!formData.isInsideDhaka && (
                    <div>
                        <label className="block text-sm font-medium mb-2">City *</label>
                        <select
                            value={formData.city}
                            onChange={(e) => handleChange('city', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        >
                            <option value="Dhaka">Dhaka</option>
                            <option value="Chittagong">Chittagong</option>
                            <option value="Sylhet">Sylhet</option>
                            <option value="Rajshahi">Rajshahi</option>
                            <option value="Khulna">Khulna</option>
                            <option value="Barisal">Barisal</option>
                            <option value="Rangpur">Rangpur</option>
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-2">
                        {formData.isInsideDhaka ? 'Area in Dhaka *' : 'Area/Location *'}
                    </label>
                    <select
                        value={formData.area}
                        onChange={(e) => handleChange('area', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    >
                        <option value="">Select {formData.isInsideDhaka ? 'Area' : 'Location'}</option>
                        {popularAreas.map(area => (
                            <option key={area} value={area}>{area}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Address Line *</label>
                    <textarea
                        value={formData.addressLine}
                        onChange={(e) => handleChange('addressLine', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="House #, Road #, Building Name, Floor, Flat No"
                        rows={3}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Landmark (Optional)</label>
                    <input
                        type="text"
                        value={formData.landmark}
                        onChange={(e) => handleChange('landmark', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Near mosque, school, market, etc."
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={formData.isDefault}
                        onChange={(e) => handleChange('isDefault', e.target.checked)}
                        className="mr-2"
                    />
                    <label>Set as default address</label>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        {editingAddress ? 'Update Address' : 'Save Address'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

// Customer Registration Form Component
function CustomerRegistrationForm({
                                      onSubmit,
                                      onCancel,
                                      onSuccess
                                  }: {
    onSubmit: (data: CustomerRegistrationRequest) => void;
    onCancel: () => void;
    onSuccess?: (customer: CustomerWithUserInfo) => void;
}) {
    const [formData, setFormData] = useState<CustomerRegistrationRequest>({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        dateOfBirth: '',
        newsletterSubscribed: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await CustomerService.register(formData);
            if (response.success) {
                const newCustomer: CustomerWithUserInfo = {
                    id: response.data.customer.id,
                    phone: formData.phone,
                    profileImage: null,
                    dateOfBirth: formData.dateOfBirth || null,
                    loyaltyPoints: 0,
                    totalOrders: 0,
                    totalSpent: 0,
                    currency: null,
                    language: null,
                    newsletterSubscribed: formData.newsletterSubscribed,
                    wishlistCount: 0,
                    reviewCount: 0,
                    status: 'ACTIVE',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    userInfo: {
                        userId: response.data.customer.id,
                        name: formData.fullName,
                        email: formData.email,
                        active: true
                    },
                    name: formData.fullName,
                    email: formData.email,
                    active: true
                };

                onSuccess?.(newCustomer);
                onSubmit(formData);
            } else {
                setError(response.message || 'Failed to register customer');
            }
        } catch (err) {
            console.error('Error registering customer:', err);
            setError(err instanceof Error ? err.message : 'Failed to register customer');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    return (
        <div className="border-2 border-dashed border-green-300 p-4 rounded-lg bg-green-50 mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Register New Customer
            </h3>

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

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                    </label>
                    <Input
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        placeholder="Enter full name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                    </label>
                    <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        placeholder="Enter email address"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password *
                    </label>
                    <Input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        placeholder="Enter password (min 6 characters)"
                        minLength={6}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                    </label>
                    <Input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        placeholder="Enter phone number"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                    </label>
                    <Input
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                <div className="flex items-center">
                    <input
                        id="newsletterSubscribed"
                        name="newsletterSubscribed"
                        type="checkbox"
                        checked={formData.newsletterSubscribed}
                        onChange={handleChange}
                        disabled={loading}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="newsletterSubscribed" className="ml-2 block text-sm text-gray-900">
                        Subscribe to newsletter
                    </label>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Registering...
                            </div>
                        ) : (
                            'Register Customer'
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

// Professional Product Search and Selection Component
function ProductSearchAndSelection({
                                       products,
                                       selectedProduct,
                                       onProductSelect,
                                       quantity,
                                       onQuantityChange,
                                       onAddItem,
                                       disabled = false
                                   }: {
    products: Product[];
    selectedProduct: Product | null;
    onProductSelect: (product: Product | null) => void;
    quantity: number;
    onQuantityChange: (quantity: number) => void;
    onAddItem: () => void;
    disabled?: boolean;
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleProductSelect = (product: Product) => {
        onProductSelect(product);
        setSearchTerm(product.name);
        setShowDropdown(false);
    };

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
        if (stock <= 10) return { text: 'Low Stock', color: 'text-orange-600 bg-orange-100' };
        return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
    };

    const stockStatus = selectedProduct ? getStockStatus(selectedProduct.stock) : null;

    return (
        <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Product Search */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Search Product *
                    </label>
                    <div className="relative">
                        <Input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            placeholder="Search by product name, SKU..."
                            disabled={disabled}
                            className="w-full"
                        />
                        {showDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map(product => {
                                        const status = getStockStatus(product.stock);
                                        return (
                                            <div
                                                key={product.id}
                                                onClick={() => handleProductSelect(product)}
                                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900">{product.name}</div>
                                                        <div className="text-sm text-gray-600">SKU: {product.sku}</div>
                                                        <div className="text-sm font-semibold text-indigo-600">
                                                            ৳{product.price}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end space-y-1">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                            {status.text}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            Stock: {product.stock}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-3 text-gray-500 text-center">
                                        No products found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quantity Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity *
                    </label>
                    <Input
                        type="number"
                        min="1"
                        max={selectedProduct?.stock || 1}
                        value={quantity}
                        onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
                        disabled={!selectedProduct || disabled}
                        className="w-full"
                    />
                    {selectedProduct && (
                        <div className="mt-1 space-y-1">
                            <p className="text-xs text-gray-500">
                                Available: {selectedProduct.stock}
                            </p>
                            {stockStatus && (
                                <p className={`text-xs font-medium ${stockStatus.color} px-2 py-1 rounded`}>
                                    {stockStatus.text}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Add Item Button */}
                <div className="flex items-end">
                    <Button
                        type="button"
                        onClick={onAddItem}
                        disabled={!selectedProduct || quantity < 1 || quantity > (selectedProduct?.stock || 0) || disabled}
                        className="w-full"
                    >
                        Add to Order
                    </Button>
                </div>
            </div>

            {/* Selected Product Details */}
            {selectedProduct && (
                <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{selectedProduct.name}</h4>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                <div>
                                    <span className="text-gray-600">SKU:</span>
                                    <span className="ml-2 font-medium">{selectedProduct.sku}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Price:</span>
                                    <span className="ml-2 font-semibold text-indigo-600">৳{selectedProduct.price}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Stock:</span>
                                    <span className="ml-2 font-medium">{selectedProduct.stock}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`ml-2 font-medium ${getStockStatus(selectedProduct.stock).color} px-2 py-1 rounded text-xs`}>
                                        {getStockStatus(selectedProduct.stock).text}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {selectedProduct.images && selectedProduct.images.length > 0 && (
                            <img
                                src={selectedProduct.images[0].imageUrl}
                                alt={selectedProduct.name}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Professional Order Items List Component
function OrderItemsList({
                            items,
                            products,
                            onRemoveItem,
                            onUpdateQuantity
                        }: {
    items: OrderItemRequest[];
    products: Product[];
    onRemoveItem: (productId: number) => void;
    onUpdateQuantity: (productId: number, quantity: number) => void;
}) {
    const getProductById = (productId: number) => {
        return products.find(p => p.id === productId);
    };

    const calculateItemTotal = (productId: number, quantity: number) => {
        const product = getProductById(productId);
        return product ? product.price * quantity : 0;
    };

    const calculateSubtotal = () => {
        return items.reduce((total, item) => {
            return total + calculateItemTotal(item.productId, item.quantity);
        }, 0);
    };

    if (items.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No items added</h3>
                <p className="mt-2 text-sm text-gray-500">Start by searching and adding products to the order.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">Order Items ({items.length})</h4>
                <div className="text-sm text-gray-600">
                    Subtotal: <span className="font-semibold text-lg text-indigo-600">৳{calculateSubtotal().toFixed(2)}</span>
                </div>
            </div>

            <div className="space-y-3">
                {items.map((item, index) => {
                    const product = getProductById(item.productId);
                    if (!product) return null;

                    const itemTotal = calculateItemTotal(item.productId, item.quantity);
                    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];

                    return (
                        <div key={`${item.productId}-${index}`} className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                            {/* Product Image */}
                            {primaryImage && (
                                <img
                                    src={primaryImage.imageUrl}
                                    alt={product.name}
                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                />
                            )}

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h5 className="font-semibold text-gray-900 truncate">{product.name}</h5>
                                        <p className="text-sm text-gray-600 mt-1">SKU: {product.sku}</p>
                                        <div className="flex items-center space-x-4 mt-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-gray-600">Price:</span>
                                                <span className="font-semibold text-indigo-600">৳{product.price}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-gray-600">Stock:</span>
                                                <span className={`text-sm font-medium ${
                                                    product.stock === 0 ? 'text-red-600' :
                                                        product.stock <= 10 ? 'text-orange-600' : 'text-green-600'
                                                }`}>
                                                    {product.stock}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                disabled={item.quantity <= 1}
                                            >
                                                <span className="text-gray-600">-</span>
                                            </button>
                                            <span className="w-12 text-center font-medium text-gray-900">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                disabled={item.quantity >= product.stock}
                                            >
                                                <span className="text-gray-600">+</span>
                                            </button>
                                        </div>

                                        {/* Item Total */}
                                        <div className="text-right min-w-20">
                                            <div className="font-semibold text-gray-900">৳{itemTotal.toFixed(2)}</div>
                                            <div className="text-sm text-gray-600">
                                                ৳{product.price} × {item.quantity}
                                            </div>
                                        </div>

                                        {/* Remove Button */}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onRemoveItem(item.productId)}
                                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function CreateManualOrderModal({ onClose, onOrderCreated }: CreateManualOrderModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<CustomerWithUserInfo[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithUserInfo | null>(null);
    const [customerAddresses, setCustomerAddresses] = useState<Address[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [locationData, setLocationData] = useState<any>(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [savingAddress, setSavingAddress] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);

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
        loadInitialData();
        loadLocationData();
    }, []);

    useEffect(() => {
        if (selectedCustomer) {
            loadCustomerAddresses(selectedCustomer.id);
        }
    }, [selectedCustomer]);

    const loadInitialData = async () => {
        try {
            setLoadingProducts(true);

            // Load customers
            const customersResponse = await CustomerService.getCustomers(0, 50, 'createdAt', 'desc');
            if (customersResponse.success) {
                setCustomers(customersResponse.data.items);
            }

            // Load real products from API
            const productsResponse = await ProductService.getAllProducts(0, 100);
            if (productsResponse.success) {
                setProducts(productsResponse.data.items);
            } else {
                setError('Failed to load products');
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
            setError('Failed to load initial data');
        } finally {
            setLoadingProducts(false);
        }
    };

    const loadLocationData = async () => {
        try {
            const response = await AddressService.getLocationData();
            if (response.success) {
                setLocationData(response.data);
            }
        } catch (error) {
            console.error('Error loading location data:', error);
        }
    };

    const loadCustomerAddresses = async (customerId: number) => {
        try {
            const addressResponse = await AddressService.getMyAddresses();
            if (addressResponse.success) {
                setCustomerAddresses(addressResponse.data || []);

                const defaultAddress = addressResponse.data.find(addr => addr.isDefault);
                if (defaultAddress) {
                    setFormData(prev => ({
                        ...prev,
                        shippingAddressId: defaultAddress.id.toString(),
                        billingAddressId: defaultAddress.id.toString()
                    }));
                }
            }
        } catch (error) {
            console.error('Error loading customer addresses:', error);
            setCustomerAddresses([]);
        }
    };

    const handleSaveAddress = async (addressData: AddressRequest) => {
        if (!selectedCustomer) return;

        try {
            setSavingAddress(true);
            setError('');

            let response;

            if (editingAddress) {
                response = await AddressService.updateAddress(editingAddress.id, addressData);
            } else {
                response = await AddressService.createAddress(addressData);
            }

            if (response.success) {
                await loadCustomerAddresses(selectedCustomer.id);
                setShowAddressForm(false);
                setEditingAddress(null);

                const newAddress = response.data;
                setFormData(prev => ({
                    ...prev,
                    shippingAddressId: newAddress.id.toString(),
                    billingAddressId: prev.useShippingAsBilling ? newAddress.id.toString() : prev.billingAddressId
                }));

                setError('');
            } else {
                setError(response.message || 'Failed to save address');
            }
        } catch (error) {
            console.error('Error saving address:', error);
            setError('Failed to save address. Please try again.');
        } finally {
            setSavingAddress(false);
        }
    };

    const handleCustomerRegistration = async (registrationData: CustomerRegistrationRequest) => {
        try {
            setError('');
            console.log('Customer registration data:', registrationData);
        } catch (error) {
            console.error('Error in customer registration callback:', error);
            setError('Failed to complete customer registration');
        }
    };

    const handleCustomerRegistrationSuccess = (newCustomer: CustomerWithUserInfo) => {
        setCustomers(prev => [newCustomer, ...prev]);
        setSelectedCustomer(newCustomer);
        setFormData(prev => ({ ...prev, customerId: newCustomer.id.toString() }));
        setSearchTerm(`${newCustomer.userInfo?.name || 'Unknown'} - ${newCustomer.phone}`);
        setShowRegistrationForm(false);
        setError('');
    };

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address);
        setShowAddressForm(true);
    };

    const handleDeleteAddress = async (addressId: number) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            const response = await AddressService.deleteAddress(addressId);
            if (response.success) {
                await loadCustomerAddresses(selectedCustomer!.id);
                if (formData.shippingAddressId === addressId.toString()) {
                    setFormData(prev => ({
                        ...prev,
                        shippingAddressId: '',
                        billingAddressId: prev.useShippingAsBilling ? '' : prev.billingAddressId
                    }));
                }
            } else {
                setError(response.message || 'Failed to delete address');
            }
        } catch (error) {
            console.error('Error deleting address:', error);
            setError('Failed to delete address');
        }
    };

    const handleAddItem = () => {
        if (!selectedProduct || quantity < 1) return;

        const existingItemIndex = orderItems.findIndex(item => item.productId === selectedProduct.id);

        if (existingItemIndex >= 0) {
            const updatedItems = [...orderItems];
            updatedItems[existingItemIndex].quantity += quantity;
            setOrderItems(updatedItems);
        } else {
            setOrderItems(prev => [...prev, {
                productId: selectedProduct.id,
                quantity: quantity
            }]);
        }

        setSelectedProduct(null);
        setQuantity(1);
    };

    const handleUpdateQuantity = (productId: number, newQuantity: number) => {
        setOrderItems(prev => prev.map(item =>
            item.productId === productId ? { ...item, quantity: newQuantity } : item
        ));
    };

    const handleRemoveItem = (productId: number) => {
        setOrderItems(prev => prev.filter(item => item.productId !== productId));
    };

    const handleCustomerSelect = (customer: CustomerWithUserInfo) => {
        setSelectedCustomer(customer);
        setFormData(prev => ({ ...prev, customerId: customer.id.toString() }));
        setShowCustomerDropdown(false);
        setSearchTerm(`${customer.userInfo?.name || 'Unknown'} - ${customer.phone}`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (orderItems.length === 0) {
            setError('Please add at least one product to the order');
            return;
        }

        if (!formData.customerId || !formData.shippingAddressId) {
            setError('Customer and Shipping Address are required');
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

    const calculateSubtotal = () => {
        return orderItems.reduce((total, item) => {
            const product = products.find(p => p.id === item.productId);
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

    const filteredCustomers = customers.filter(customer =>
        customer.userInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.userInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getAreaOptions = () => {
        if (!locationData) return [];
        return [
            ...(locationData.dhakaMetroAreas || []),
            ...(locationData.dhakaSuburbanAreas || []),
            ...(locationData.otherCities || [])
        ];
    };

    return (
        <div className="fixed inset-0 backdrop-blur-[2.0px] flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto">
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

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Customer Information */}
                        <div className="xl:col-span-1 space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>

                            {/* Customer Selection/Registration Toggle */}
                            <div className="flex gap-2 mb-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRegistrationForm(false);
                                        setShowCustomerDropdown(false);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        !showRegistrationForm
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Select Existing Customer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRegistrationForm(true);
                                        setShowCustomerDropdown(false);
                                        setSelectedCustomer(null);
                                        setSearchTerm('');
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        showRegistrationForm
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Register New Customer
                                </button>
                            </div>

                            {showRegistrationForm ? (
                                <CustomerRegistrationForm
                                    onSubmit={handleCustomerRegistration}
                                    onCancel={() => setShowRegistrationForm(false)}
                                    onSuccess={handleCustomerRegistrationSuccess}
                                />
                            ) : (
                                <>
                                    {/* Enhanced Customer Selection */}
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Select Customer *
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                    setShowCustomerDropdown(true);
                                                }}
                                                onFocus={() => setShowCustomerDropdown(true)}
                                                placeholder="Search by name, email, or phone..."
                                                className="w-full"
                                            />
                                            {showCustomerDropdown && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                    {filteredCustomers.length > 0 ? (
                                                        filteredCustomers.map(customer => (
                                                            <div
                                                                key={customer.id}
                                                                onClick={() => handleCustomerSelect(customer)}
                                                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                            >
                                                                <div className="font-medium text-gray-900">
                                                                    {customer.userInfo?.name || 'Unknown Customer'}
                                                                </div>
                                                                <div className="text-sm text-gray-600">
                                                                    {customer.userInfo?.email} • {customer.phone}
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    Customer ID: {customer.id} • Orders: {customer.totalOrders || 0}
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-3 text-gray-500 text-center">
                                                            No customers found
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Customer Details Display */}
                                    {selectedCustomer && (
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-blue-900">
                                                        {selectedCustomer.userInfo?.name || 'Unknown Customer'}
                                                    </h4>
                                                    <p className="text-blue-700 text-sm">
                                                        {selectedCustomer.userInfo?.email} • {selectedCustomer.phone}
                                                    </p>
                                                    <div className="flex gap-2 mt-2">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            Orders: {selectedCustomer.totalOrders || 0}
                                                        </span>
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Points: {selectedCustomer.loyaltyPoints || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedCustomer(null);
                                                        setSearchTerm('');
                                                        setFormData(prev => ({ ...prev, customerId: '' }));
                                                        setCustomerAddresses([]);
                                                        setShowAddressForm(false);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Address Management Section */}
                                    {selectedCustomer && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium text-gray-900">Shipping Address</h4>
                                                {!showAddressForm && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowAddressForm(true)}
                                                        className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                                                    >
                                                        + Add New Address
                                                    </button>
                                                )}
                                            </div>

                                            {showAddressForm ? (
                                                <NewAddressForm
                                                    onSubmit={handleSaveAddress}
                                                    onCancel={() => {
                                                        setShowAddressForm(false);
                                                        setEditingAddress(null);
                                                    }}
                                                    popularAreas={getAreaOptions()}
                                                    editingAddress={editingAddress}
                                                    customerName={selectedCustomer.userInfo?.name}
                                                />
                                            ) : (
                                                <>
                                                    {customerAddresses.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {customerAddresses.map(address => (
                                                                <div key={address.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:border-indigo-300">
                                                                    <input
                                                                        type="radio"
                                                                        name="shippingAddress"
                                                                        value={address.id}
                                                                        checked={formData.shippingAddressId === address.id.toString()}
                                                                        onChange={(e) => setFormData(prev => ({
                                                                            ...prev,
                                                                            shippingAddressId: e.target.value,
                                                                            billingAddressId: prev.useShippingAsBilling ? e.target.value : prev.billingAddressId
                                                                        }))}
                                                                        className="mt-1 text-indigo-600 focus:ring-indigo-500"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <div className="flex items-start justify-between">
                                                                            <div>
                                                                                <p className="font-medium text-gray-900">{address.fullName}</p>
                                                                                <p className="text-gray-600 text-sm mt-1">{address.fullAddress}</p>
                                                                                <p className="text-gray-600 text-sm">{address.phone}</p>
                                                                            </div>
                                                                            <div className="flex gap-2">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleEditAddress(address)}
                                                                                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                                                                >
                                                                                    Edit
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleDeleteAddress(address.id)}
                                                                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                                                                >
                                                                                    Delete
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 mt-2">
                                                                            {address.isInsideDhaka ? (
                                                                                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                                                                    Inside Dhaka • ৳60
                                                                                </span>
                                                                            ) : (
                                                                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                                                    Outside Dhaka • ৳120
                                                                                </span>
                                                                            )}
                                                                            {address.isDefault && (
                                                                                <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                                                                                    Default
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <p className="mt-2 text-sm text-gray-500">No addresses found</p>
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowAddressForm(true)}
                                                                className="mt-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                                                            >
                                                                Add first address
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Billing Address */}
                                                    {customerAddresses.length > 0 && (
                                                        <div className="space-y-3">
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    id="useShippingAsBilling"
                                                                    checked={formData.useShippingAsBilling}
                                                                    onChange={(e) => setFormData(prev => ({
                                                                        ...prev,
                                                                        useShippingAsBilling: e.target.checked,
                                                                        billingAddressId: e.target.checked ? prev.shippingAddressId : prev.billingAddressId
                                                                    }))}
                                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                />
                                                                <label htmlFor="useShippingAsBilling" className="ml-2 text-sm text-gray-700">
                                                                    Use shipping address as billing address
                                                                </label>
                                                            </div>

                                                            {!formData.useShippingAsBilling && (
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Billing Address
                                                                    </label>
                                                                    <select
                                                                        value={formData.billingAddressId}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, billingAddressId: e.target.value }))}
                                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                                    >
                                                                        <option value="">Select billing address</option>
                                                                        {customerAddresses.map(address => (
                                                                            <option key={address.id} value={address.id}>
                                                                                {address.fullName} - {address.fullAddress}
                                                                                {address.isDefault && ' (Default)'}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Order Items & Details */}
                        <div className="xl:col-span-2 space-y-6">
                            {/* Order Items Section */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900">Order Items</h3>

                                {/* Product Search and Selection */}
                                <ProductSearchAndSelection
                                    products={products}
                                    selectedProduct={selectedProduct}
                                    onProductSelect={setSelectedProduct}
                                    quantity={quantity}
                                    onQuantityChange={setQuantity}
                                    onAddItem={handleAddItem}
                                    disabled={loadingProducts}
                                />

                                {/* Order Items List */}
                                <OrderItemsList
                                    items={orderItems}
                                    products={products}
                                    onRemoveItem={handleRemoveItem}
                                    onUpdateQuantity={handleUpdateQuantity}
                                />
                            </div>

                            {/* Order Details & Summary */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Order Details */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900">Order Details</h3>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Shipping (৳)
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
                                                Tax (৳)
                                            </label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.taxAmount}
                                                onChange={(e) => setFormData(prev => ({ ...prev, taxAmount: e.target.value }))}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Discount (৳)
                                        </label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.discountAmount}
                                            onChange={(e) => setFormData(prev => ({ ...prev, discountAmount: e.target.value }))}
                                            placeholder="0.00"
                                        />
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

                                {/* Order Summary */}
                                {orderItems.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
                                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Subtotal:</span>
                                                    <span className="font-medium">৳{calculateSubtotal().toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Shipping:</span>
                                                    <span className="font-medium">৳{(parseFloat(formData.shippingAmount) || 0).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Tax:</span>
                                                    <span className="font-medium">৳{(parseFloat(formData.taxAmount) || 0).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Discount:</span>
                                                    <span className="font-medium text-green-600">-৳{(parseFloat(formData.discountAmount) || 0).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between border-t border-gray-200 pt-3">
                                                    <span className="font-semibold text-gray-900 text-lg">Total:</span>
                                                    <span className="font-bold text-xl text-gray-900">৳{calculateTotal().toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading || savingAddress}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || savingAddress || orderItems.length === 0 || !selectedCustomer || !formData.shippingAddressId}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Order...
                                </>
                            ) : (
                                `Create Order - ৳${calculateTotal().toFixed(2)}`
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}