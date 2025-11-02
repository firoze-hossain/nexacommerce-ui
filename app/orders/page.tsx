// app/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import Header from '@/app/components/customers/header';
import Footer from '@/app/components/customers/footer';
import { OrderService } from '@/app/lib/api/order-service';
import { OrderResponse } from '@/app/lib/types/order';
import { formatCurrency, formatDate } from '@/app/lib/utils/formatters';
import Link from 'next/link';

export default function OrdersPage() {
    const { isAuthenticated, user } = useAuth();
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cartItemCount, setCartItemCount] = useState(0);

    useEffect(() => {
        if (isAuthenticated) {
            loadOrders();
        }
    }, [isAuthenticated]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await OrderService.getMyOrders(0, 10, 'createdAt', 'desc');

            if (response.success && response.data) {
                setOrders(response.data.items);
            } else {
                setError(response.message || 'Failed to load orders');
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED':
                return 'bg-blue-100 text-blue-800';
            case 'SHIPPED':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'PAID':
                return 'bg-green-100 text-green-800';
            case 'FAILED':
                return 'bg-red-100 text-red-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'REFUNDED':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Helper function to safely get order items count
    const getOrderItemsCount = (order: OrderResponse) => {
        return order.items?.length || 0;
    };

    // Helper function to safely get order items
    const getOrderItems = (order: OrderResponse) => {
        return order.items || [];
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header cartItemCount={cartItemCount} onCartClick={() => {}} />
                <div className="container mx-auto px-4 py-16 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
                    <p className="text-gray-600 mb-8">You need to be logged in to view your orders.</p>
                    <Link
                        href="/login"
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Log In
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header cartItemCount={cartItemCount} onCartClick={() => {}} />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-gray-600 mt-2">View and manage your order history</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-800">{error}</span>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading your orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-600 mb-6">Start shopping to see your orders here.</p>
                        <Link
                            href="/products"
                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const orderItems = getOrderItems(order);
                            const itemsCount = getOrderItemsCount(order);

                            return (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                                >
                                    {/* Order Header */}
                                    <div className="border-b border-gray-200 p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                            <div>
                                                <div className="flex items-center space-x-4 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        Order #{order.orderNumber}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                        {order.status.replace('_', ' ')}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                        {order.paymentStatus.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 text-sm">
                                                    Placed on {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                            <div className="mt-4 lg:mt-0 text-right">
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {formatCurrency(order.finalAmount)}
                                                </p>
                                                <p className="text-gray-600 text-sm">
                                                    {itemsCount} item{itemsCount !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {orderItems.length > 0 ? (
                                                <>
                                                    {orderItems.slice(0, 3).map((item) => (
                                                        <div key={item.id} className="flex items-center space-x-4">
                                                            <img
                                                                src={item.productImage || '/api/placeholder/80/80'}
                                                                alt={item.productName}
                                                                className="w-16 h-16 object-cover rounded-lg"
                                                            />
                                                            <div className="flex-1">
                                                                <h4 className="font-medium text-gray-900">{item.productName}</h4>
                                                                <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                                                                <p className="text-gray-600 text-sm">SKU: {item.productSku}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold text-gray-900">
                                                                    {formatCurrency(item.subtotal)}
                                                                </p>
                                                                {item.discountAmount > 0 && (
                                                                    <p className="text-green-600 text-sm">
                                                                        Save {formatCurrency(item.discountAmount)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {orderItems.length > 3 && (
                                                        <div className="text-center pt-2">
                                                            <p className="text-gray-600 text-sm">
                                                                + {orderItems.length - 3} more item{orderItems.length - 3 !== 1 ? 's' : ''}
                                                            </p>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="text-center py-4">
                                                    <p className="text-gray-500">No items found in this order</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Order Actions */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 pt-6 border-t border-gray-200">
                                            <div className="mb-4 sm:mb-0">
                                                <p className="text-sm text-gray-600">
                                                    {order.shippingAddress ? (
                                                        `Shipped to: ${order.shippingAddress.city}, ${order.shippingAddress.area}`
                                                    ) : (
                                                        'Shipping address not available'
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex space-x-3">
                                                <Link
                                                    href={`/orders/${order.orderNumber}`}
                                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                                >
                                                    View Details
                                                </Link>
                                                {order.status === 'PENDING' && (
                                                    <button className="border border-red-300 text-red-600 px-6 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                                                        Cancel Order
                                                    </button>
                                                )}
                                                {order.status === 'DELIVERED' && (
                                                    <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                                                        Request Return
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}