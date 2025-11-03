// app/dashboard/orders/[id]/page.tsx - FULL UPDATED VERSION
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OrderService } from '@/app/lib/api/order-service';
import { Order } from '@/app/lib/types/order';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { formatCurrency, formatDate } from '@/app/lib/utils/formatters';
import { useAuth } from '@/app/hooks/useAuth';
import { OrderStatusBadge } from '@/app/components/orders/order-status-badge';
import { PaymentStatusBadge } from '@/app/components/orders/payment-status-badge';

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [internalNote, setInternalNote] = useState('');
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundAmount, setRefundAmount] = useState(0);
    const [refundReason, setRefundReason] = useState('');

    const orderId = params.id as string;
    const isAdmin = user?.role?.name === 'ADMIN' || user?.role?.name === 'SUPERADMIN';

    useEffect(() => {
        if (orderId) {
            loadOrder();
        }
    }, [orderId]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            let response;

            // Use admin endpoint for admin users for more detailed information
            if (isAdmin && !isNaN(Number(orderId))) {
                response = await OrderService.getOrderWithHistory(Number(orderId));
            } else if (!isNaN(Number(orderId))) {
                response = await OrderService.getOrderById(Number(orderId));
            } else {
                response = await OrderService.getOrderByNumber(orderId);
            }

            if (response.success && response.data) {
                setOrder(response.data);
                setRefundAmount(response.data.finalAmount);
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

    const handleStatusUpdate = async (newStatus: string, notes?: string) => {
        if (!order) return;

        try {
            setUpdating(true);
            if (isAdmin) {
                await OrderService.updateOrderStatusAdmin(order.id, newStatus, notes);
            } else {
                await OrderService.updateOrderStatus(order.id, newStatus);
            }
            await loadOrder(); // Refresh order data
        } catch (err) {
            console.error('Error updating order status:', err);
            setError('Failed to update order status');
        } finally {
            setUpdating(false);
        }
    };

    const handlePaymentStatusUpdate = async (newStatus: string, notes?: string) => {
        if (!order) return;

        try {
            setUpdating(true);
            await OrderService.updatePaymentStatus(order.id, newStatus, notes);
            await loadOrder();
        } catch (err) {
            console.error('Error updating payment status:', err);
            setError('Failed to update payment status');
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

    const handleAddInternalNote = async () => {
        if (!order || !internalNote.trim()) return;

        try {
            setUpdating(true);
            await OrderService.addOrderNote(order.id, internalNote.trim());
            setInternalNote('');
            await loadOrder(); // Refresh to show new note
        } catch (err) {
            console.error('Error adding note:', err);
            setError('Failed to add note');
        } finally {
            setUpdating(false);
        }
    };

    const handleProcessRefund = async () => {
        if (!order || !refundAmount || refundAmount <= 0) return;

        try {
            setUpdating(true);
            await OrderService.processRefund(order.id, refundAmount, refundReason || 'Refund processed');
            setShowRefundModal(false);
            await loadOrder();
        } catch (err) {
            console.error('Error processing refund:', err);
            setError('Failed to process refund');
        } finally {
            setUpdating(false);
        }
    };

    const handleReassignOrder = async (newVendorId: number) => {
        if (!order || !confirm('Reassign this order to different vendor?')) return;

        try {
            setUpdating(true);
            await OrderService.reassignOrder(order.id, newVendorId);
            await loadOrder();
        } catch (err) {
            console.error('Error reassigning order:', err);
            setError('Failed to reassign order');
        } finally {
            setUpdating(false);
        }
    };

    const copyOrderNumber = () => {
        if (order) {
            navigator.clipboard.writeText(order.orderNumber);
            // You could add a toast notification here
        }
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
                                {order.processedByName && ` • Processed by ${order.processedByName}`}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                    <Button variant="outline" onClick={() => window.print()}>
                        Print
                    </Button>
                    <Button variant="outline" onClick={copyOrderNumber}>
                        Copy Order #
                    </Button>
                    {isAdmin && (
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                            Send Notification
                        </Button>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-800">{error}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setError('')}
                        >
                            Dismiss
                        </Button>
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
                                <OrderStatusBadge status={order.status} size="lg" />
                                <PaymentStatusBadge status={order.paymentStatus} size="lg" />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusUpdate(e.target.value)}
                                    disabled={updating}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="PROCESSING">Processing</option>
                                    <option value="SHIPPED">Shipped</option>
                                    <option value="DELIVERED">Delivered</option>
                                    <option value="CANCELLED">Cancelled</option>
                                    <option value="REFUNDED">Refunded</option>
                                </select>

                                {isAdmin && (
                                    <select
                                        value={order.paymentStatus}
                                        onChange={(e) => handlePaymentStatusUpdate(e.target.value)}
                                        disabled={updating}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="PENDING">Payment Pending</option>
                                        <option value="PAID">Paid</option>
                                        <option value="FAILED">Failed</option>
                                        <option value="REFUNDED">Refunded</option>
                                        <option value="PARTIALLY_REFUNDED">Partially Refunded</option>
                                    </select>
                                )}

                                {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleCancelOrder}
                                        disabled={updating}
                                    >
                                        Cancel Order
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Admin Quick Actions */}
                        {isAdmin && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
                                <div className="flex flex-wrap gap-2">
                                    {order.paymentStatus === 'PAID' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowRefundModal(true)}
                                            className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                        >
                                            Process Refund
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleStatusUpdate('DELIVERED', 'Marked as delivered by admin')}
                                    >
                                        Mark Delivered
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleStatusUpdate('SHIPPED', 'Order shipped')}
                                    >
                                        Mark Shipped
                                    </Button>
                                </div>
                            </div>
                        )}
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
                                        {item.discountAmount > 0 && (
                                            <p className="text-sm text-green-600">
                                                Discount: {formatCurrency(item.discountAmount)}
                                            </p>
                                        )}
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
                            {order.history && order.history.length > 0 ? (
                                order.history.map((history) => (
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
                                            {history.notes && (
                                                <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatDate(history.createdAt)} • By {history.performedByName}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No history available</p>
                            )}
                        </div>
                    </div>

                    {/* Internal Notes Section (Admin Only) */}
                    {isAdmin && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Internal Notes</h2>
                            <div className="space-y-3">
                                <div className="flex space-x-2">
                                    <Textarea
                                        placeholder="Add internal note..."
                                        value={internalNote}
                                        onChange={(e) => setInternalNote(e.target.value)}
                                        className="flex-1"
                                        rows={3}
                                    />
                                </div>
                                <Button
                                    onClick={handleAddInternalNote}
                                    disabled={!internalNote.trim() || updating}
                                    size="sm"
                                >
                                    Add Note
                                </Button>

                                {order.internalNotes && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.internalNotes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
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
                                {order.customerId && (
                                    <p className="text-xs text-gray-500">Customer ID: {order.customerId}</p>
                                )}
                            </div>
                            <div className="pt-3 border-t border-gray-200">
                                <p className="text-sm font-medium text-gray-900 mb-2">Shipping Address</p>
                                <p className="text-sm text-gray-600">
                                    {order.shippingAddress.fullName}<br />
                                    {order.shippingAddress.phone}<br />
                                    {order.shippingAddress.addressLine}<br />
                                    {order.shippingAddress.area}, {order.shippingAddress.city}
                                    {order.shippingAddress.landmark && <>, {order.shippingAddress.landmark}</>}
                                </p>
                            </div>
                            {order.billingAddress && (
                                <div className="pt-3 border-t border-gray-200">
                                    <p className="text-sm font-medium text-gray-900 mb-2">Billing Address</p>
                                    <p className="text-sm text-gray-600">
                                        {order.billingAddress.fullName}<br />
                                        {order.billingAddress.phone}<br />
                                        {order.billingAddress.addressLine}<br />
                                        {order.billingAddress.area}, {order.billingAddress.city}
                                        {order.billingAddress.landmark && <>, {order.billingAddress.landmark}</>}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Vendor Information (Admin Only) */}
                    {isAdmin && order.vendorName && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vendor Information</h2>
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-900">{order.vendorName}</p>
                                {order.vendorId && (
                                    <p className="text-xs text-gray-500">Vendor ID: {order.vendorId}</p>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleReassignOrder(1)} // You'll need to implement vendor selection
                                    disabled={updating}
                                >
                                    Reassign Vendor
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Order Notes */}
                    {order.customerNotes && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Notes</h2>
                            <p className="text-sm text-gray-600">{order.customerNotes}</p>
                        </div>
                    )}

                    {/* Order Source */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Source:</span>
                                <span className="font-medium">{order.source || 'WEBSTORE'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Order Number:</span>
                                <span className="font-medium">{order.orderNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Placed:</span>
                                <span className="font-medium">{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Last Updated:</span>
                                <span className="font-medium">{formatDate(order.updatedAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Refund Modal */}
            {showRefundModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Process Refund</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Refund Amount
                                </label>
                                <Input
                                    type="number"
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                                    max={order.finalAmount}
                                    min="0"
                                    step="0.01"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Maximum refundable: {formatCurrency(order.finalAmount)}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason for Refund
                                </label>
                                <Textarea
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    placeholder="Enter reason for refund..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setShowRefundModal(false)}
                                disabled={updating}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleProcessRefund}
                                disabled={!refundAmount || refundAmount <= 0 || updating}
                                className="bg-orange-600 hover:bg-orange-700"
                            >
                                {updating ? 'Processing...' : 'Process Refund'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}