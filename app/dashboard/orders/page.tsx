// app/dashboard/orders/page.tsx - FULL UPDATED VERSION
'use client';

import {useEffect, useState} from 'react';
import {OrderService} from '@/app/lib/api/order-service';
import {Order} from '@/app/lib/types/order';
import {Button} from '@/app/components/ui/button';
import {formatCurrency, formatDate} from '@/app/lib/utils/formatters';
import {useAuth} from '@/app/hooks/useAuth';
import {OrderStatusBadge} from '@/app/components/orders/order-status-badge';
import {PaymentStatusBadge} from '@/app/components/orders/payment-status-badge';
import AdminOrderFilters from '@/app/components/orders/admin-order-filters';
import QuickActionsMenu from '@/app/components/orders/quick-actions-menu';
import CreateManualOrderButton from '@/app/components/orders/create-manual-order-button';

interface OrdersResponse {
    items: Order[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}

interface OrderStats {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    monthlyRevenue: number;
}

export default function OrdersPage() {
    const {user, isAuthenticated, loading: authLoading} = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [stats, setStats] = useState<OrderStats | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Enhanced filters for admin
    const [filters, setFilters] = useState({
        searchTerm: '',
        status: 'all',
        paymentStatus: 'all',
        customerId: '',
        vendorId: '',
        startDate: '',
        endDate: ''
    });

    const pageSize = 10;
    const isAdmin = user?.role?.name === 'ADMIN' || user?.role?.name === 'SUPERADMIN';

    useEffect(() => {
        console.log('🔍 OrdersPage - Auth State:', {
            isAuthenticated,
            user: user?.email,
            role: user?.role?.name,
            authLoading
        });
    }, [isAuthenticated, user, authLoading]);

    // SINGLE useEffect for loading orders
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            console.log('🚀 Loading orders...');
            loadOrders();
            if (isAdmin) {
                loadStats();
            }
        } else {
            console.log('⏳ Waiting for authentication...');
            setLoading(false);
        }
    }, [isAuthenticated, authLoading, currentPage, filters]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('📦 Fetching orders from API...');

            const response = await OrderService.getAdminOrders(filters, currentPage, pageSize);
            console.log('📦 Orders API Response:', response);

            if (response.success && response.data) {
                console.log('✅ Orders loaded successfully');
                setOrders(response.data.items || []);
                setTotalPages(response.data.totalPages || 0);
                setTotalItems(response.data.totalItems || 0);
            } else {
                console.error('❌ Orders API error:', response.message);
                setError(response.message || 'Failed to load orders');
            }
        } catch (err) {
            console.error('💥 Orders load error:', err);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await OrderService.getAdminOrderStats();
            if (response.success && response.data) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Stats load error:', err);
        }
    };

    const handleStatusUpdate = async (orderId: number, newStatus: string, notes?: string) => {
        try {
            console.log(`🔄 Updating order ${orderId} status to ${newStatus}`);
            await OrderService.updateOrderStatusAdmin(orderId, newStatus, notes);
            loadOrders(); // Refresh the list
        } catch (err) {
            console.error('Error updating order status:', err);
            setError('Failed to update order status');
        }
    };

    const handlePaymentStatusUpdate = async (orderId: number, newStatus: string, notes?: string) => {
        try {
            await OrderService.updatePaymentStatus(orderId, newStatus, notes);
            loadOrders();
        } catch (err) {
            console.error('Error updating payment status:', err);
            setError('Failed to update payment status');
        }
    };

    const handleRefund = async (orderId: number, amount: number, reason: string) => {
        if (!confirm(`Process refund of ${formatCurrency(amount)}?`)) return;

        try {
            await OrderService.processRefund(orderId, amount, reason);
            loadOrders();
        } catch (err) {
            console.error('Error processing refund:', err);
            setError('Failed to process refund');
        }
    };

    const handleFilterChange = (newFilters: any) => {
        setFilters(newFilters);
        setCurrentPage(0);
    };

    const handleClearFilters = () => {
        setFilters({
            searchTerm: '',
            status: 'all',
            paymentStatus: 'all',
            customerId: '',
            vendorId: '',
            startDate: '',
            endDate: ''
        });
        setCurrentPage(0);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('🔍 Searching orders with term:', searchTerm);
        setFilters(prev => ({...prev, searchTerm}));
        setCurrentPage(0);
    };

    // Enhanced stats for admin
    const getStatsCards = () => {
        if (!isAdmin || !stats) {
            return [
                {
                    name: 'Total Orders',
                    value: totalItems.toString(),
                    change: '+0%',
                    changeType: 'positive'
                },
                {
                    name: 'Revenue',
                    value: formatCurrency(orders.reduce((sum, order) => sum + order.finalAmount, 0)),
                    change: '+0%',
                    changeType: 'positive'
                },
                {
                    name: 'Pending',
                    value: orders.filter(o => o.status === 'PENDING').length.toString(),
                    change: '+0%',
                    changeType: 'positive'
                },
                {
                    name: 'Cancelled',
                    value: orders.filter(o => o.status === 'CANCELLED').length.toString(),
                    change: '+0%',
                    changeType: 'positive'
                },
            ];
        }

        return [
            {
                name: 'Total Orders',
                value: stats.totalOrders.toString(),
                change: '+0%',
                changeType: 'positive'
            },
            {
                name: 'Revenue',
                value: formatCurrency(stats.totalRevenue),
                change: '+0%',
                changeType: 'positive'
            },
            {
                name: 'Pending',
                value: stats.pendingOrders.toString(),
                change: '+0%',
                changeType: 'positive'
            },
            {
                name: 'Completed',
                value: stats.completedOrders.toString(),
                change: '+0%',
                changeType: 'positive'
            },
        ];
    };

    // Show loading only when we're actually loading orders and no orders exist
    if (loading && orders.length === 0 && isAuthenticated) {
        return (
            <div className="flex flex-col justify-center items-center min-h-96 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="text-gray-600">Loading orders...</p>
            </div>
        );
    }

    // Show auth loading state
    if (authLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-96 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="text-gray-600">Checking authentication...</p>
            </div>
        );
    }

    // Show not authenticated message
    if (!isAuthenticated && !authLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-96 space-y-4">
                <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication Required</h3>
                    <p className="mt-1 text-sm text-gray-500">Please log in to view orders.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                    <p className="text-gray-600 mt-1">
                        Manage and track {isAdmin ? 'all' : 'your'} orders
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                    <Button
                        variant="outline"
                        onClick={loadOrders}
                        disabled={loading}
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </Button>

                    {/* Add Create Manual Order button for admins */}
                    {isAdmin && (
                        <CreateManualOrderButton onOrderCreated={loadOrders}/>
                    )}

                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                        Export Orders
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {getStatsCards().map((stat, index) => (
                    <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className={`w-12 h-12 ${
                                    index === 0 ? 'bg-blue-100' :
                                        index === 1 ? 'bg-green-100' :
                                            index === 2 ? 'bg-yellow-100' : 'bg-red-100'
                                } rounded-lg flex items-center justify-center`}>
                                    <span className={`text-lg ${
                                        index === 0 ? 'text-blue-600' :
                                            index === 1 ? 'text-green-600' :
                                                index === 2 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                        {index === 0 ? '📦' : index === 1 ? '💰' : index === 2 ? '⏳' : '❌'}
                                    </span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <AdminOrderFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                    loading={loading}
                    isAdmin={isAdmin}
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                      clipRule="evenodd"/>
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

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading && orders.length > 0 && (
                    <div className="flex items-center justify-center p-4 bg-blue-50">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                        <span className="text-sm text-blue-700">Updating orders...</span>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order
                            </th>
                            <th scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            {isAdmin && (
                                <th scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vendor
                                </th>
                            )}
                            <th scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Payment
                            </th>
                            <th scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th scope="col"
                                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {order.orderNumber}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {order.items?.length || 0} items
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {order.customerName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {order.customerEmail}
                                        </div>
                                    </div>
                                </td>
                                {isAdmin && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {order.vendorName || 'N/A'}
                                        </div>
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatCurrency(order.finalAmount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <OrderStatusBadge status={order.status}/>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <PaymentStatusBadge status={order.paymentStatus}/>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(order.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <QuickActionsMenu
                                        order={order}
                                        onStatusUpdate={handleStatusUpdate}
                                        onPaymentStatusUpdate={handlePaymentStatusUpdate}
                                        onRefund={handleRefund}
                                        isAdmin={isAdmin}
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {orders.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {isAdmin ? 'Get started by creating a manual order.' : 'You haven\'t placed any orders yet.'}
                        </p>
                        <div className="mt-6">
                            <Button onClick={loadOrders}>
                                Refresh Orders
                            </Button>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div
                        className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(currentPage * pageSize) + 1}</span> to{' '}
                                    <span className="font-medium">
                                        {Math.min((currentPage + 1) * pageSize, totalItems)}
                                    </span> of{' '}
                                    <span className="font-medium">{totalItems}</span> results
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 0 || loading}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage >= totalPages - 1 || loading}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Debug Info - Remove in production */}
            {process.env.NODE_ENV === 'development' && (
                <div className="bg-gray-100 rounded-lg p-4 text-xs">
                    <h4 className="font-semibold mb-2">Debug Info:</h4>
                    <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
                    <p>User Role: {user?.role?.name}</p>
                    <p>Auth Loading: {authLoading ? 'Yes' : 'No'}</p>
                    <p>Orders Loading: {loading ? 'Yes' : 'No'}</p>
                    <p>Orders Count: {orders.length}</p>
                    <p>Current Page: {currentPage}</p>
                    <p>Total Pages: {totalPages}</p>
                    <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
                </div>
            )}
        </div>
    );
}