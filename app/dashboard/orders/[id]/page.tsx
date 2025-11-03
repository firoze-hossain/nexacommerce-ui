// app/dashboard/orders/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OrderService } from '@/app/lib/api/order-service';
import { Order } from '@/app/lib/types/order';
import { Button } from '@/app/components/ui/button';
import { formatCurrency, formatDate } from '@/app/lib/utils/formatters';

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');

    const orderId = params.id as string;

    useEffect(() => {
        if (orderId) {
            loadOrder();
        }
    }, [orderId]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            let response;

            // Check if ID is a number (ID) or string (order number)
            if (!isNaN(Number(orderId))) {
                response = await OrderService.getOrderById(Number(orderId));
            } else {
                response = await OrderService.getOrderByNumber(orderId);
            }

            if (response.success && response.data) {
                setOrder(response.data);
            } else {
                setError(response.message || 'Order not found');
            }
        } catch (err) {
            console.error('Error loading order:', err);
            setError('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!order) return;

        try {
            setUpdating(true);
            await OrderService.updateOrderStatus(order.id, newStatus);
            await loadOrder(); // Refresh order data
        } catch (err) {
            console.error('Error updating order status:', err);
            setError('Failed to update order status');
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!order || !confirm('Are you sure you want to cancel this order?')) return;

        try {
            setUpdating(true);
            await OrderService.cancelOrder(order.id);
            await loadOrder(); // Refresh order data
        } catch (err) {
            console.error('Error cancelling order:', err);
            setError('Failed to cancel order');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors = {
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'CONFIRMED': 'bg-blue-100 text-blue-800',
            'PROCESSING': 'bg-purple-100 text-purple-800',
            'SHIPPED': 'bg-indigo-100 text-indigo-800',
            'DELIVERED': 'bg-green-100 text-green-800',
            'CANCELLED': 'bg-red-100 text-red-800',
            'REFUNDED': 'bg-gray-100 text-gray-800'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status: string) => {
        const colors = {
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'PAID': 'bg-green-100 text-green-800',
            'FAILED': 'bg-red-100 text-red-800',
            'REFUNDED': 'bg-gray-100 text-gray-800'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Order not found</h3>
                <p className="mt-1 text-sm text-gray-500">The order you're looking for doesn't exist.</p>
                <div className="mt-6">
                    <Button onClick={() => router.push('/dashboard/orders')}>
                        Back to Orders
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push('/dashboard/orders')}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
                            <p className="text-gray-600 mt-1">
                                Placed on {formatDate(order.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                    <Button variant="outline" onClick={() => window.print()}>
                        Print
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                        Send Notification
                    </Button>
                </div>
            </div>

            {/* Error Message */}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Status Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center space-x-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                            <div className="flex space-x-2">
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusUpdate(e.target.value)}
                                    disabled={updating}
                                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="PROCESSING">Processing</option>
                                    <option value="SHIPPED">Shipped</option>
                                    <option value="DELIVERED">Delivered</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                                {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleCancelOrder}
                                        disabled={updating}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                                    <img
                                        src={item.productImage || '/api/placeholder/80/80'}
                                        alt={item.productName}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-gray-900">{item.productName}</h3>
                                        <p className="text-sm text-gray-500">SKU: {item.productSku}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.price)}</p>
                                        <p className="text-sm text-gray-500">Total: {formatCurrency(item.subtotal)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order History</h2>
                        <div className="space-y-4">
                            {order.history.map((history) => (
                                <div key={history.id} className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                            <span className="text-gray-600 text-sm">📝</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">{history.description}</p>
                                        {history.oldValue && history.newValue && (
                                            <p className="text-sm text-gray-500">
                                                Changed from <span className="font-medium">{history.oldValue}</span> to{' '}
                                                <span className="font-medium">{history.newValue}</span>
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatDate(history.createdAt)} • By {history.performedByName}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-medium">{formatCurrency(order.shippingAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tax</span>
                                <span className="font-medium">{formatCurrency(order.taxAmount)}</span>
                            </div>
                            {order.discountAmount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Discount</span>
                                    <span className="font-medium text-green-600">-{formatCurrency(order.discountAmount)}</span>
                                </div>
                            )}
                            {order.couponDiscount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Coupon ({order.couponCode})</span>
                                    <span className="font-medium text-green-600">-{formatCurrency(order.couponDiscount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-gray-200 pt-3">
                                <span className="font-semibold text-gray-900">Total</span>
                                <span className="font-bold text-lg text-gray-900">{formatCurrency(order.finalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                                <p className="text-sm text-gray-600">{order.customerEmail}</p>
                            </div>
                            <div className="pt-3 border-t border-gray-200">
                                <p className="text-sm font-medium text-gray-900 mb-2">Shipping Address</p>
                                <p className="text-sm text-gray-600">
                                    {order.shippingAddress.fullName}<br />
                                    {order.shippingAddress.phone}<br />
                                    {order.shippingAddress.addressLine}<br />
                                    {order.shippingAddress.area}, {order.shippingAddress.city}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Notes */}
                    {order.customerNotes && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Notes</h2>
                            <p className="text-sm text-gray-600">{order.customerNotes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}