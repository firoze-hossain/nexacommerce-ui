// app/components/orders/admin-order-filters.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

interface AdminOrderFiltersProps {
    filters: any;
    onFilterChange: (filters: any) => void;
    onClearFilters: () => void;
    loading: boolean;
    isAdmin: boolean;
}

export default function AdminOrderFilters({
                                              filters,
                                              onFilterChange,
                                              onClearFilters,
                                              loading,
                                              isAdmin
                                          }: AdminOrderFiltersProps) {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleApplyFilters = () => {
        onFilterChange(localFilters);
    };

    const handleFilterChange = (key: string, value: string) => {
        setLocalFilters((prev: any) => ({ ...prev, [key]: value }));
    };

    const hasActiveFilters = Object.values(filters).some(value =>
        value !== '' && value !== 'all'
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                {/* Search */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Search
                    </label>
                    <Input
                        type="text"
                        placeholder="Order number, customer name..."
                        value={localFilters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        className="w-full"
                    />
                </div>

                {/* Status Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                    </label>
                    <select
                        value={localFilters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>

                {/* Payment Status Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment
                    </label>
                    <select
                        value={localFilters.paymentStatus}
                        onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">All Payment</option>
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="FAILED">Failed</option>
                        <option value="REFUNDED">Refunded</option>
                    </select>
                </div>

                {/* Admin-only filters */}
                {isAdmin && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Customer ID
                            </label>
                            <Input
                                type="number"
                                placeholder="Customer ID"
                                value={localFilters.customerId}
                                onChange={(e) => handleFilterChange('customerId', e.target.value)}
                                className="w-32"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date From
                            </label>
                            <Input
                                type="date"
                                value={localFilters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date To
                            </label>
                            <Input
                                type="date"
                                value={localFilters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                    {hasActiveFilters && 'Filters applied'}
                </div>
                <div className="flex space-x-2">
                    {hasActiveFilters && (
                        <Button variant="outline" onClick={onClearFilters} disabled={loading}>
                            Clear All
                        </Button>
                    )}
                    <Button onClick={handleApplyFilters} disabled={loading}>
                        Apply Filters
                    </Button>
                </div>
            </div>
        </div>
    );
}