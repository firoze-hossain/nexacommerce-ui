// app/orders/[orderNumber]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import Header from '@/app/components/customers/header';
import Footer from '@/app/components/customers/footer';
import { OrderService } from '@/app/lib/api/order-service';
import { OrderResponse } from '@/app/lib/types/order';
import { formatCurrency, formatDate } from '@/app/lib/utils/formatters';
import Link from 'next/link';

export default function OrderDetailPage() {
    const params = useParams();
    const orderNumber = params.orderNumber as string;
    const { isAuthenticated } = useAuth();
    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        if (isAuthenticated && orderNumber) {
            loadOrder();
        }
    }, [isAuthenticated, orderNumber]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await OrderService.getOrderByNumber(orderNumber);

            if (response.success && response.data) {
                setOrder(response.data);
            } else {
                setError(response.message || 'Failed to load order details');
            }
        } catch (error) {
            console.error('Error loading order:', error);
            setError('Failed to load order details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!order) return;

        if (!confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            setCancelling(true);
            const response = await OrderService.cancelOrder(order.id);

            if (response.success) {
                setOrder(response.data);
            } else {
                setError(response.message || 'Failed to cancel order');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            setError('Failed to cancel order. Please try again.');
        } finally {
            setCancelling(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
            case 'SHIPPED': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-800';
            case 'FAILED': return 'bg-red-100 text-red-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'REFUNDED': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Safe access to order items
    const orderItems = order?.items || [];
    const orderHistory = order?.history || [];

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header cartItemCount={cartItemCount} onCartClick={() => {}} />
                <div className="container mx-auto px-4 py-16 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
                    <p className="text-gray-600 mb-8">You need to be logged in to view order details.</p>
                    <Link href="/login" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
                        Log In
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header cartItemCount={cartItemCount} onCartClick={() => {}} />
                <div className="container mx-auto px-4 py-16 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading order details...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header cartItemCount={cartItemCount} onCartClick={() => {}} />
                <div className="container mx-auto px-4 py-16 text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                        <svg className="h-12 w-12 text-red-400 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <h3 className="text-lg font-semibold text-red-800 mb-2">Order Not Found</h3>
                        <p className="text-red-600 mb-4">{error || 'The order you are looking for does not exist.'}</p>
                        <Link href="/orders" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
                            Back to Orders
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header cartItemCount={cartItemCount} onCartClick={() => {}} />

            <main className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                    <div>
                        <Link
                            href="/orders"
                            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Orders
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
                        <p className="text-gray-600 mt-2">Placed on {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="mt-4 lg:mt-0 flex items-center space-x-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ')}
                        </span>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
                            <div className="space-y-6">
                                {orderItems.length > 0 ? (
                                    orderItems.map((item) => (
                                        <div key={item.id} className="flex items-center space-x-4 pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                                            <img
                                                src={item.productImage || '/api/placeholder/100/100'}
                                                alt={item.productName}
                                                className="w-20 h-20 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                                                <p className="text-gray-600 text-sm mt-1">SKU: {item.productSku}</p>
                                                <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                                                {item.discountAmount > 0 && (
                                                    <p className="text-green-600 text-sm mt-1">
                                                        You saved {formatCurrency(item.discountAmount)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900 text-lg">
                                                    {formatCurrency(item.subtotal)}
                                                </p>
                                                {item.compareAtPrice && item.compareAtPrice > item.price && (
                                                    <p className="text-gray-500 text-sm line-through">
                                                        {formatCurrency(item.compareAtPrice * item.quantity)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-6xl mb-4">📦</div>
                                        <p className="text-gray-600">No items found in this order.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order History */}
                        {orderHistory.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order History</h2>
                                <div className="space-y-4">
                                    {orderHistory.map((history) => (
                                        <div key={history.id} className="flex items-start space-x-4">
                                            <div className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{history.description}</p>
                                                <p className="text-gray-600 text-sm mt-1">{formatDate(history.createdAt)}</p>
                                                {history.notes && (
                                                    <p className="text-gray-500 text-sm mt-1">{history.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                                </div>
                                {order.shippingAmount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium">{formatCurrency(order.shippingAmount)}</span>
                                    </div>
                                )}
                                {order.taxAmount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax</span>
                                        <span className="font-medium">{formatCurrency(order.taxAmount)}</span>
                                    </div>
                                )}
                                {order.discountAmount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Discount</span>
                                        <span className="font-medium text-green-600">-{formatCurrency(order.discountAmount)}</span>
                                    </div>
                                )}
                                {order.couponDiscount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Coupon Discount</span>
                                        <span className="font-medium text-green-600">-{formatCurrency(order.couponDiscount)}</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-900">Total</span>
                                        <span className="font-bold text-lg text-gray-900">{formatCurrency(order.finalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
                            <div className="text-gray-600">
                                {order.shippingAddress ? (
                                    <>
                                        <p className="font-medium">{order.shippingAddress.fullName}</p>
                                        <p className="mt-1">{order.shippingAddress.addressLine}</p>
                                        <p>
                                            {order.shippingAddress.area}, {order.shippingAddress.city}
                                        </p>
                                        {order.shippingAddress.landmark && (
                                            <p>Landmark: {order.shippingAddress.landmark}</p>
                                        )}
                                        <p className="mt-2">{order.shippingAddress.phone}</p>
                                    </>
                                ) : (
                                    <p className="text-gray-500">No shipping address provided</p>
                                )}
                            </div>
                        </div>

                        {/* Billing Address */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing Address</h2>
                            <div className="text-gray-600">
                                {order.billingAddress ? (
                                    <>
                                        <p className="font-medium">{order.billingAddress.fullName}</p>
                                        <p className="mt-1">{order.billingAddress.addressLine}</p>
                                        <p>
                                            {order.billingAddress.area}, {order.billingAddress.city}
                                        </p>
                                        {order.billingAddress.landmark && (
                                            <p>Landmark: {order.billingAddress.landmark}</p>
                                        )}
                                        <p className="mt-2">{order.billingAddress.phone}</p>
                                    </>
                                ) : (
                                    <p className="text-gray-500">Same as shipping address</p>
                                )}
                            </div>
                        </div>

                        {/* Customer Notes */}
                        {order.customerNotes && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Notes</h2>
                                <p className="text-gray-600">{order.customerNotes}</p>
                            </div>
                        )}

                        {/* Order Actions */}
                        {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Actions</h2>
                                <button
                                    onClick={handleCancelOrder}
                                    disabled={cancelling}
                                    className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors font-medium"
                                >
                                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}