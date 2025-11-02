// app/checkout/page.tsx - PROFESSIONAL LOCATION-BASED SHIPPING
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import Header from '@/app/components/customers/header';
import Footer from '@/app/components/customers/footer';
import { CartService } from '@/app/lib/api/cart-service';
import { OrderService } from '@/app/lib/api/order-service';
import { AddressService } from '@/app/lib/api/address-service';
import { CartResponse, CartItemResponse } from '@/app/lib/types/cart';
import { Address, GuestAddressRequest, LocationDataResponse, ShippingRate } from '@/app/lib/types/address';
import { formatCurrency } from '@/app/lib/utils/formatters';
import { useRouter } from 'next/navigation';

interface CheckoutForm {
    // Location type
    locationType: 'inside-dhaka' | 'outside-dhaka' | '';

    // For authenticated users
    shippingAddressId: number;
    billingAddressId: number;
    useShippingAsBilling: boolean;
    paymentMethod: string;
    customerNotes: string;

    // For guest users
    guestEmail: string;
    guestShippingAddress: GuestAddressRequest & {
        city: string;
        locationType: 'inside-dhaka' | 'outside-dhaka' | '';
    };
    guestBillingAddress: GuestAddressRequest & {
        city: string;
        locationType: 'inside-dhaka' | 'outside-dhaka' | '';
    };
}

// Enhanced NewAddressForm Component with Location Selection
function NewAddressForm({ onSubmit, onCancel, popularAreas, editingAddress = null }: {
    onSubmit: (data: any) => void;
    onCancel: () => void;
    popularAreas: string[];
    editingAddress?: Address | null;
}) {
    const [formData, setFormData] = useState({
        addressType: editingAddress?.addressType || 'SHIPPING',
        fullName: editingAddress?.fullName || '',
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

    const handleSubmit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent event from bubbling
        onSubmit(formData);
    };

    const handleChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-4 border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>

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
    );
}

export default function CheckoutPage() {
    const { isAuthenticated, user } = useAuth();
    const [cart, setCart] = useState<CartResponse | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [locationData, setLocationData] = useState<LocationDataResponse | null>(null);
    const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [savingAddress, setSavingAddress] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const router = useRouter();

    const [form, setForm] = useState<CheckoutForm>({
        locationType: '',
        shippingAddressId: 0,
        billingAddressId: 0,
        useShippingAsBilling: true,
        paymentMethod: 'cod',
        customerNotes: '',
        guestEmail: '',
        guestShippingAddress: {
            fullName: '',
            phone: '',
            area: '',
            addressLine: '',
            city: 'Dhaka',
            landmark: '',
            locationType: ''
        },
        guestBillingAddress: {
            fullName: '',
            phone: '',
            area: '',
            addressLine: '',
            city: 'Dhaka',
            landmark: '',
            locationType: ''
        }
    });

    useEffect(() => {
        loadCheckoutData();
        loadLocationData();
    }, [isAuthenticated]);

    const loadLocationData = async () => {
        try {
            const response = await AddressService.getLocationData();
            if (response.success) {
                setLocationData(response.data);
                setShippingRates(response.data.shippingRates);
            }
        } catch (error) {
            console.error('Error loading location data:', error);
        }
    };

    const getSessionId = (): string => {
        if (typeof window !== 'undefined') {
            let sessionId = localStorage.getItem('guestSessionId');
            if (!sessionId) {
                sessionId = 'guest-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('guestSessionId', sessionId);
            }
            return sessionId;
        }
        return '';
    };

    const loadCheckoutData = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            let cartResponse;

            if (isAuthenticated) {
                cartResponse = await CartService.getMyCart();
                const addressResponse = await AddressService.getMyAddresses();
                if (addressResponse.success && addressResponse.data) {
                    setAddresses(addressResponse.data);
                    const defaultAddress = addressResponse.data.find(addr => addr.isDefault);
                    if (defaultAddress) {
                        setForm(prev => ({
                            ...prev,
                            shippingAddressId: defaultAddress.id,
                            billingAddressId: defaultAddress.id,
                            locationType: defaultAddress.isInsideDhaka ? 'inside-dhaka' : 'outside-dhaka'
                        }));
                    }
                }
            } else {
                const sessionId = getSessionId();
                cartResponse = await CartService.getGuestCart(sessionId);
            }

            if (!cartResponse.success || !cartResponse.data) {
                setError('Failed to load cart');
                return;
            }
            setCart(cartResponse.data);

            const totalItems = cartResponse.data.items.reduce((total: number, item: CartItemResponse) => total + item.quantity, 0);
            setCartItemCount(totalItems);

        } catch (err) {
            console.error('Error loading checkout data:', err);
            setError('Failed to load checkout data');
        } finally {
            setLoading(false);
        }
    };

    const handleLocationTypeChange = (locationType: 'inside-dhaka' | 'outside-dhaka') => {
        setForm(prev => ({
            ...prev,
            locationType,
            guestShippingAddress: {
                ...prev.guestShippingAddress,
                locationType,
                city: locationType === 'inside-dhaka' ? 'Dhaka' : prev.guestShippingAddress.city
            }
        }));
    };

    const handleGuestFieldChange = (field: string, value: string, addressType: 'shipping' | 'billing' = 'shipping') => {
        if (addressType === 'shipping') {
            setForm(prev => ({
                ...prev,
                guestShippingAddress: {
                    ...prev.guestShippingAddress,
                    [field]: value
                }
            }));
        } else {
            setForm(prev => ({
                ...prev,
                guestBillingAddress: {
                    ...prev.guestBillingAddress,
                    [field]: value
                }
            }));
        }
    };

    const handleCityChange = (city: string, addressType: 'shipping' | 'billing' = 'shipping') => {
        const isDhakaCity = city === 'Dhaka';

        if (addressType === 'shipping') {
            setForm(prev => ({
                ...prev,
                guestShippingAddress: {
                    ...prev.guestShippingAddress,
                    city,
                    locationType: isDhakaCity ? 'inside-dhaka' : 'outside-dhaka'
                },
                locationType: isDhakaCity ? 'inside-dhaka' : 'outside-dhaka'
            }));
        } else {
            setForm(prev => ({
                ...prev,
                guestBillingAddress: {
                    ...prev.guestBillingAddress,
                    city,
                    locationType: isDhakaCity ? 'inside-dhaka' : 'outside-dhaka'
                }
            }));
        }
    };

    const getAreaOptions = () => {
        if (!locationData) return [];

        if (form.locationType === 'inside-dhaka') {
            return locationData.dhakaMetroAreas;
        } else if (form.guestShippingAddress.city === 'Dhaka' || form.locationType === 'outside-dhaka') {
            return [...locationData.dhakaSuburbanAreas, ...locationData.otherCities];
        } else {
            return locationData.otherCities;
        }
    };

    const validateGuestForm = (): boolean => {
        const { guestEmail, guestShippingAddress, locationType } = form;

        if (!guestEmail) {
            setError('Email is required for guest checkout');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(guestEmail)) {
            setError('Please enter a valid email address');
            return false;
        }

        if (!locationType) {
            setError('Please select your location type');
            return false;
        }

        if (!guestShippingAddress.fullName) {
            setError('Full name is required');
            return false;
        }

        if (!guestShippingAddress.phone) {
            setError('Phone number is required');
            return false;
        }

        const phoneRegex = /^01[3-9]\d{8}$/;
        if (!phoneRegex.test(guestShippingAddress.phone)) {
            setError('Please enter a valid Bangladeshi phone number (01XXXXXXXXX)');
            return false;
        }

        if (!guestShippingAddress.area) {
            setError('Area is required');
            return false;
        }

        if (!guestShippingAddress.addressLine) {
            setError('Address line is required');
            return false;
        }

        return true;
    };

    const validateLoggedInForm = (): boolean => {
        if (!form.shippingAddressId) {
            setError('Please select a shipping address');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!cart || cart.items.length === 0) {
            setError('Your cart is empty');
            return;
        }

        let isValid = false;
        if (isAuthenticated) {
            isValid = validateLoggedInForm();
        } else {
            isValid = validateGuestForm();
        }

        if (!isValid) return;

        try {
            setProcessing(true);
            setError(null);
            setSuccess(null);

            let response;

            if (isAuthenticated) {
                const orderRequest = {
                    shippingAddressId: form.shippingAddressId,
                    billingAddressId: form.useShippingAsBilling ? undefined : form.billingAddressId,
                    useShippingAsBilling: form.useShippingAsBilling,
                    customerNotes: form.customerNotes,
                    shippingAmount: getShippingAmount(),
                    items: cart.items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity
                    }))
                };

                response = await OrderService.createOrder(orderRequest);

                if (response.success) {
                    await CartService.clearCart();
                }
            } else {
                const guestOrderRequest = {
                    guestEmail: form.guestEmail,
                    guestName: form.guestShippingAddress.fullName,
                    shippingAddress: {
                        fullName: form.guestShippingAddress.fullName,
                        phone: form.guestShippingAddress.phone,
                        area: form.guestShippingAddress.area,
                        addressLine: form.guestShippingAddress.addressLine,
                        city: form.guestShippingAddress.city,
                        landmark: form.guestShippingAddress.landmark
                    },
                    billingAddress: form.useShippingAsBilling ? undefined : {
                        fullName: form.guestBillingAddress.fullName,
                        phone: form.guestBillingAddress.phone,
                        area: form.guestBillingAddress.area,
                        addressLine: form.guestBillingAddress.addressLine,
                        city: form.guestBillingAddress.city,
                        landmark: form.guestBillingAddress.landmark
                    },
                    customerNotes: form.customerNotes,
                    shippingAmount: getShippingAmount(),
                    taxAmount: 0,
                    discountAmount: 0,
                    items: cart.items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity
                    })),
                    sessionId: getSessionId()
                };

                response = await OrderService.createGuestOrder(guestOrderRequest);

                // Clear guest cart
                try {
                    const sessionId = getSessionId();
                    await CartService.clearGuestCart(sessionId);
                    localStorage.removeItem('guestSessionId');
                } catch (cartError) {
                    console.warn('Cart clearing failed, but order was placed successfully');
                }
            }

            if (response.success) {
                const orderNumber = response.data.orderNumber;
                const totalAmount = formatCurrency(getTotal());
                const email = isAuthenticated ? user?.email : form.guestEmail;

                setSuccess(`Order #${orderNumber} placed successfully! Total: ${totalAmount}. Confirmation sent to ${email}. Redirecting to order details...`);

                setTimeout(() => {
                    router.push(`/orders/${orderNumber}`);
                }, 3000);

            } else {
                setError(response.message || 'Failed to place order');
            }
        } catch (err: any) {
            console.error('Error placing order:', err);
            setError(err.message || 'Failed to place order. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const getSubtotal = () => cart?.totalAmount || 0;

    const getShippingAmount = () => {
        const subtotal = getSubtotal();

        // Free shipping for orders above 1000
        if (subtotal > 1000) return 0;

        // Calculate based on location type
        if (form.locationType === 'inside-dhaka') {
            return 60;
        } else {
            return 120;
        }
    };

    const getTotal = () => getSubtotal() + getShippingAmount();

    const getDeliveryTime = () => {
        if (form.locationType === 'inside-dhaka') {
            return '1-2 business days';
        } else {
            return '3-5 business days';
        }
    };

    const hasOutOfStockItems = cart?.items.some(item => !item.inStock);

    const handleAddNewAddress = () => {
        setEditingAddress(null);
        setShowAddressForm(true);
    };

    const handleSaveNewAddress = async (addressData: any) => {
        try {
            setSavingAddress(true);
            setError(null);

            console.log('Creating/Updating address with data:', addressData);

            let response;

            if (editingAddress) {
                // Update existing address
                response = await AddressService.updateAddress(editingAddress.id, {
                    ...addressData,
                    isDefault: addressData.isDefault || false
                });
            } else {
                // Create new address
                response = await AddressService.createAddress({
                    ...addressData,
                    isDefault: addresses.length === 0 || addressData.isDefault
                });
            }

            if (response.success) {
                const updatedAddress = response.data;

                if (editingAddress) {
                    // Update existing address in the list
                    setAddresses(prev =>
                        prev.map(addr => addr.id === editingAddress.id ? updatedAddress : addr)
                    );
                } else {
                    // Add new address to the list
                    setAddresses(prev => [...prev, updatedAddress]);
                }

                // Auto-select the newly created/updated address
                setForm(prev => ({
                    ...prev,
                    shippingAddressId: updatedAddress.id,
                    billingAddressId: updatedAddress.id
                }));

                // Reset form states
                setShowAddressForm(false);
                setEditingAddress(null);

                // Show success message
                setSuccess(editingAddress ? 'Address updated successfully!' : 'Address created successfully!');

                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccess(null);
                }, 3000);
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

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address);
        setShowAddressForm(true);
    };

    const handleCancelEdit = () => {
        setShowAddressForm(false);
        setEditingAddress(null);
    };

    const handleDeleteAddress = async (addressId: number) => {
        if (!confirm('Are you sure you want to delete this address?')) {
            return;
        }

        try {
            setError(null);
            const response = await AddressService.deleteAddress(addressId);

            if (response.success) {
                // Remove address from local state
                setAddresses(prev => prev.filter(addr => addr.id !== addressId));

                // If the deleted address was selected, clear the selection
                if (form.shippingAddressId === addressId) {
                    setForm(prev => ({
                        ...prev,
                        shippingAddressId: 0,
                        billingAddressId: prev.useShippingAsBilling ? 0 : prev.billingAddressId
                    }));
                }

                setSuccess('Address deleted successfully!');
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(response.message || 'Failed to delete address');
            }
        } catch (error) {
            console.error('Error deleting address:', error);
            setError('Failed to delete address. Please try again.');
        }
    };

    const handleLoginRedirect = () => {
        const sessionId = getSessionId();
        localStorage.setItem('pendingCartSession', sessionId);
        router.push('/login?redirect=checkout');
    };

    const handleCreateAccountRedirect = () => {
        const sessionId = getSessionId();
        localStorage.setItem('pendingCartSession', sessionId);
        router.push('/signup?redirect=checkout');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header cartItemCount={cartItemCount} onCartClick={() => {}} />
                <div className="container mx-auto px-4 py-16 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading checkout...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header cartItemCount={cartItemCount} onCartClick={() => {}} />
                <div className="container mx-auto px-4 py-16 text-center">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                    <p className="text-gray-600 mb-8">Add some products to your cart first.</p>
                    <button
                        onClick={() => router.push('/products')}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header cartItemCount={cartItemCount} onCartClick={() => {}} />

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                        <p className="text-gray-600 mt-2">
                            {isAuthenticated ? `Welcome back, ${user?.name}` : 'Complete your purchase as guest'}
                        </p>

                        {!isAuthenticated && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="text-blue-800 font-medium">Shopping as guest</p>
                                        <p className="text-blue-600 text-sm">
                                            Create an account for faster checkout and order tracking
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleLoginRedirect}
                                            className="bg-white text-blue-600 border border-blue-300 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                                        >
                                            Sign In
                                        </button>
                                        <button
                                            onClick={handleCreateAccountRedirect}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                        >
                                            Create Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className="ml-3 flex-1">
                                    <h3 className="text-green-800 font-semibold text-lg">Success!</h3>
                                    <div className="mt-2 text-green-700">
                                        <p className="text-sm">{success}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && !success && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-red-800">{error}</span>
                            </div>
                        </div>
                    )}

                    {hasOutOfStockItems && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-700">
                                Some items in your cart are out of stock. Please remove them before proceeding.
                            </p>
                        </div>
                    )}

                    {!success && (
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Checkout Form */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Contact Information - For Guest Users */}
                                    {!isAuthenticated && (
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Email Address *
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={form.guestEmail}
                                                        onChange={(e) => setForm(prev => ({ ...prev, guestEmail: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        placeholder="your@email.com"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Location Type Selection - FOR GUEST USERS */}
                                    {!isAuthenticated && (
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Location</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                    form.locationType === 'inside-dhaka'
                                                        ? 'border-indigo-500 bg-indigo-50'
                                                        : 'border-gray-200 hover:border-indigo-300'
                                                }`}>
                                                    <input
                                                        type="radio"
                                                        name="locationType"
                                                        value="inside-dhaka"
                                                        checked={form.locationType === 'inside-dhaka'}
                                                        onChange={() => handleLocationTypeChange('inside-dhaka')}
                                                        className="text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">Inside Dhaka</p>
                                                        <p className="text-gray-600 text-sm mt-1">
                                                            Delivery: 1-2 days • Shipping: ৳60
                                                        </p>
                                                        <p className="text-green-600 text-xs mt-1">
                                                            Free shipping on orders over ৳1000
                                                        </p>
                                                    </div>
                                                </label>

                                                <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                    form.locationType === 'outside-dhaka'
                                                        ? 'border-indigo-500 bg-indigo-50'
                                                        : 'border-gray-200 hover:border-indigo-300'
                                                }`}>
                                                    <input
                                                        type="radio"
                                                        name="locationType"
                                                        value="outside-dhaka"
                                                        checked={form.locationType === 'outside-dhaka'}
                                                        onChange={() => handleLocationTypeChange('outside-dhaka')}
                                                        className="text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">Outside Dhaka</p>
                                                        <p className="text-gray-600 text-sm mt-1">
                                                            Delivery: 3-5 days • Shipping: ৳120
                                                        </p>
                                                        <p className="text-green-600 text-xs mt-1">
                                                            Free shipping on orders over ৳1000
                                                        </p>
                                                    </div>
                                                </label>
                                            </div>

                                            {form.locationType && (
                                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <p className="text-blue-700 text-sm">
                                                        {form.locationType === 'inside-dhaka'
                                                            ? '🚚 Fast delivery within Dhaka metropolitan area'
                                                            : '📦 Standard delivery to other cities and districts'
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Shipping Address */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xl font-semibold text-gray-900">
                                                Shipping Address
                                            </h2>
                                            {isAuthenticated && !showAddressForm && addresses.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={handleAddNewAddress}
                                                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                                                >
                                                    + Add New Address
                                                </button>
                                            )}
                                        </div>

                                        {isAuthenticated ? (
                                            showAddressForm ? (
                                                <NewAddressForm
                                                    onSubmit={handleSaveNewAddress}
                                                    onCancel={handleCancelEdit}
                                                    popularAreas={getAreaOptions()}
                                                    editingAddress={editingAddress}
                                                />
                                            ) : (
                                                <div className="space-y-4">
                                                    {addresses.length > 0 ? (
                                                        <div className="grid gap-4">
                                                            {addresses.map(address => (
                                                                <div key={address.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-indigo-300">
                                                                    <input
                                                                        type="radio"
                                                                        name="shippingAddress"
                                                                        value={address.id}
                                                                        checked={form.shippingAddressId === address.id}
                                                                        onChange={(e) => setForm(prev => ({
                                                                            ...prev,
                                                                            shippingAddressId: Number(e.target.value),
                                                                            billingAddressId: prev.useShippingAsBilling ? Number(e.target.value) : prev.billingAddressId
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
                                                        // Show address form directly when no addresses exist
                                                        <NewAddressForm
                                                            onSubmit={handleSaveNewAddress}
                                                            onCancel={() => {}} // No cancel when no addresses exist
                                                            popularAreas={getAreaOptions()}
                                                        />
                                                    )}

                                                    {/* Show "Add New Address" button only when addresses exist */}
                                                    {addresses.length > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={handleAddNewAddress}
                                                            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                                                        >
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <span className="text-indigo-600">+</span>
                                                                <span className="text-indigo-600 font-medium">Add New Address</span>
                                                            </div>
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        ) : (
                                            // Enhanced guest user address form with location-based fields
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Full Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={form.guestShippingAddress.fullName}
                                                            onChange={(e) => handleGuestFieldChange('fullName', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                            placeholder="John Doe"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Phone Number *
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            value={form.guestShippingAddress.phone}
                                                            onChange={(e) => handleGuestFieldChange('phone', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                            placeholder="01XXXXXXXXX"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {form.locationType === 'outside-dhaka' && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            City *
                                                        </label>
                                                        <select
                                                            value={form.guestShippingAddress.city}
                                                            onChange={(e) => handleCityChange(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                            required
                                                        >
                                                            <option value="Dhaka">Dhaka</option>
                                                            {locationData?.otherCities.map(city => (
                                                                <option key={city} value={city}>{city}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        {form.locationType === 'inside-dhaka' ? 'Area in Dhaka *' : 'Area/Location *'}
                                                    </label>
                                                    <select
                                                        value={form.guestShippingAddress.area}
                                                        onChange={(e) => handleGuestFieldChange('area', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        required
                                                    >
                                                        <option value="">Select {form.locationType === 'inside-dhaka' ? 'Area' : 'Location'}</option>
                                                        {getAreaOptions().map(area => (
                                                            <option key={area} value={area}>{area}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Address Line *
                                                    </label>
                                                    <textarea
                                                        value={form.guestShippingAddress.addressLine}
                                                        onChange={(e) => handleGuestFieldChange('addressLine', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        placeholder="House #, Road #, Building Name, Floor, Flat No"
                                                        rows={3}
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Landmark (Optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={form.guestShippingAddress.landmark}
                                                        onChange={(e) => handleGuestFieldChange('landmark', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        placeholder="Near mosque, school, market, etc."
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Billing Address */}
                                    {(isAuthenticated || !form.useShippingAsBilling) && (
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing Address</h2>
                                            <div className="space-y-4">
                                                <label className="flex items-center space-x-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.useShippingAsBilling}
                                                        onChange={(e) => setForm(prev => ({ ...prev, useShippingAsBilling: e.target.checked }))}
                                                        className="text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-gray-700">Same as shipping address</span>
                                                </label>

                                                {!form.useShippingAsBilling && (
                                                    isAuthenticated ? (
                                                        <div className="grid gap-4">
                                                            {addresses.map(address => (
                                                                <label key={address.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-indigo-300 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name="billingAddress"
                                                                        value={address.id}
                                                                        checked={form.billingAddressId === address.id}
                                                                        onChange={(e) => setForm(prev => ({ ...prev, billingAddressId: Number(e.target.value) }))}
                                                                        className="mt-1 text-indigo-600 focus:ring-indigo-500"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <p className="font-medium text-gray-900">{address.fullName}</p>
                                                                        <p className="text-gray-600 text-sm mt-1">{address.fullAddress}</p>
                                                                        <p className="text-gray-600 text-sm">{address.phone}</p>
                                                                    </div>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 gap-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                        Full Name *
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={form.guestBillingAddress.fullName}
                                                                        onChange={(e) => handleGuestFieldChange('fullName', e.target.value, 'billing')}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                                        placeholder="John Doe"
                                                                        required
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                        Phone Number *
                                                                    </label>
                                                                    <input
                                                                        type="tel"
                                                                        value={form.guestBillingAddress.phone}
                                                                        onChange={(e) => handleGuestFieldChange('phone', e.target.value, 'billing')}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                                        placeholder="01XXXXXXXXX"
                                                                        required
                                                                    />
                                                                </div>
                                                            </div>

                                                            {form.locationType === 'outside-dhaka' && (
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                        City *
                                                                    </label>
                                                                    <select
                                                                        value={form.guestBillingAddress.city}
                                                                        onChange={(e) => handleCityChange(e.target.value, 'billing')}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                                        required
                                                                    >
                                                                        <option value="Dhaka">Dhaka</option>
                                                                        {locationData?.otherCities.map(city => (
                                                                            <option key={city} value={city}>{city}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            )}

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Area *
                                                                </label>
                                                                <select
                                                                    value={form.guestBillingAddress.area}
                                                                    onChange={(e) => handleGuestFieldChange('area', e.target.value, 'billing')}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                                    required
                                                                >
                                                                    <option value="">Select Area</option>
                                                                    {getAreaOptions().map(area => (
                                                                        <option key={area} value={area}>{area}</option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Address Line *
                                                                </label>
                                                                <textarea
                                                                    value={form.guestBillingAddress.addressLine}
                                                                    onChange={(e) => handleGuestFieldChange('addressLine', e.target.value, 'billing')}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                                    placeholder="House #, Road #, Building Name, Floor, Flat No"
                                                                    rows={3}
                                                                    required
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Landmark (Optional)
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={form.guestBillingAddress.landmark}
                                                                    onChange={(e) => handleGuestFieldChange('landmark', e.target.value, 'billing')}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                                    placeholder="Near mosque, school, market, etc."
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment Method */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
                                        <div className="grid gap-4">
                                            <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-indigo-300 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="cod"
                                                    checked={form.paymentMethod === 'cod'}
                                                    onChange={(e) => setForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                                    className="text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                                        💰
                                                    </div>
                                                    <span className="text-gray-700">Cash on Delivery</span>
                                                </div>
                                            </label>

                                            <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-indigo-300 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="card"
                                                    checked={form.paymentMethod === 'card'}
                                                    onChange={(e) => setForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                                    className="text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                                        💳
                                                    </div>
                                                    <span className="text-gray-700">Credit/Debit Card</span>
                                                </div>
                                            </label>

                                            <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-indigo-300 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="bkash"
                                                    checked={form.paymentMethod === 'bkash'}
                                                    onChange={(e) => setForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                                    className="text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                                        📱
                                                    </div>
                                                    <span className="text-gray-700">bKash</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Order Notes */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Notes (Optional)</h2>
                                        <textarea
                                            value={form.customerNotes}
                                            onChange={(e) => setForm(prev => ({ ...prev, customerNotes: e.target.value }))}
                                            placeholder="Any special instructions for your order..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="space-y-6">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

                                        <div className="space-y-3 mb-4">
                                            {cart.items.map(item => (
                                                <div key={item.id} className="flex items-center space-x-3">
                                                    <img
                                                        src={item.productImage || '/api/placeholder/60/60'}
                                                        alt={item.productName}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                                                        <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.subtotal)}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-2 border-t border-gray-200 pt-4">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Subtotal</span>
                                                <span className="font-medium">{formatCurrency(getSubtotal())}</span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Shipping</span>
                                                <span className="font-medium">
                                                    {getShippingAmount() === 0 ? (
                                                        <span className="text-green-600">FREE</span>
                                                    ) : (
                                                        formatCurrency(getShippingAmount())
                                                    )}
                                                </span>
                                            </div>

                                            {getShippingAmount() > 0 && form.locationType && (
                                                <div className="text-xs text-gray-500 pl-2">
                                                    {form.locationType === 'inside-dhaka'
                                                        ? 'Inside Dhaka delivery'
                                                        : 'Outside Dhaka delivery'
                                                    } • {getDeliveryTime()}
                                                </div>
                                            )}

                                            {cart.totalDiscount > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Discount</span>
                                                    <span className="font-medium text-green-600">-{formatCurrency(cart.totalDiscount)}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between border-t border-gray-200 pt-2">
                                                <span className="font-semibold text-gray-900">Total</span>
                                                <span className="font-bold text-lg text-gray-900">{formatCurrency(getTotal())}</span>
                                            </div>
                                        </div>

                                        {/* Shipping Information */}
                                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-green-700 text-sm font-medium">
                                                {getShippingAmount() === 0
                                                    ? '🎉 Free shipping applied!'
                                                    : `🚚 ${getDeliveryTime()} delivery`
                                                }
                                            </p>
                                            {getSubtotal() < 1000 && getShippingAmount() > 0 && (
                                                <p className="text-green-600 text-xs mt-1">
                                                    Add ৳{formatCurrency(1000 - getSubtotal())} more for free shipping
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={processing || savingAddress || hasOutOfStockItems ||
                                                (isAuthenticated && !form.shippingAddressId) ||
                                                (!isAuthenticated && (!form.guestEmail || !form.locationType))
                                            }
                                            className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors mt-6 flex items-center justify-center"
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    Processing...
                                                </>
                                            ) : (
                                                `Place Order - ${formatCurrency(getTotal())}`
                                            )}
                                        </button>

                                        <p className="text-gray-600 text-xs text-center mt-3">
                                            By placing your order, you agree to our Terms of Service and Privacy Policy.
                                        </p>

                                        {!isAuthenticated && (
                                            <p className="text-gray-500 text-xs text-center mt-2">
                                                You'll receive order updates via email
                                            </p>
                                        )}
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center justify-center space-x-6 text-gray-400">
                                            <div className="text-center">
                                                <div className="text-2xl mb-1">🔒</div>
                                                <p className="text-xs">Secure Payment</p>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl mb-1">🚚</div>
                                                <p className="text-xs">Fast Delivery</p>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl mb-1">↩️</div>
                                                <p className="text-xs">Easy Returns</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}