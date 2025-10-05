// app/components/vendors/vendor-table.tsx
'use client';

import {BusinessType, Vendor, VendorStatus} from '@/app/lib/types/vendor';
import {Button} from '@/app/components/ui/button';
import {formatCurrency, formatDate} from '@/app/lib/utils/formatters';

interface VendorsTableProps {
    vendors: Vendor[];
    onView: (vendor: Vendor) => void;
    onEdit: (vendor: Vendor) => void;
    onApprove: (vendor: Vendor) => void;
    onReject: (vendor: Vendor) => void;
    onDelete: (id: number) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    showActions?: boolean;
}

export default function VendorsTable({
                                         vendors,
                                         onView,
                                         onEdit,
                                         onApprove,
                                         onReject,
                                         onDelete,
                                         currentPage,
                                         totalPages,
                                         onPageChange,
                                         totalItems,
                                         showActions = true,
                                     }: VendorsTableProps) {
    const getStatusColor = (status: VendorStatus) => {
        switch (status) {
            case VendorStatus.APPROVED:
                return 'bg-green-100 text-green-800';
            case VendorStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800';
            case VendorStatus.REJECTED:
                return 'bg-red-100 text-red-800';
            case VendorStatus.SUSPENDED:
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getBusinessTypeLabel = (type: BusinessType) => {
        switch (type) {
            case BusinessType.INDIVIDUAL:
                return 'Individual';
            case BusinessType.SOLE_PROPRIETORSHIP:
                return 'Sole Proprietorship';
            case BusinessType.PARTNERSHIP:
                return 'Partnership';
            case BusinessType.CORPORATION:
                return 'Corporation';
            case BusinessType.LLC:
                return 'LLC';
            default:
                return type;
        }
    };

    if (vendors.length === 0) {
        return (
            <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by registering a new vendor.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vendor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Business Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Performance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registered
                        </th>
                        {showActions && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        )}
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {vendors.map((vendor) => (
                        <tr key={vendor.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div
                                        className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                        {vendor.logoUrl ? (
                                            <img
                                                className="h-10 w-10 rounded-full"
                                                src={vendor.logoUrl}
                                                alt={vendor.companyName}
                                            />
                                        ) : (
                                            <span className="text-indigo-600 font-medium text-sm">
                          {vendor.companyName.substring(0, 2).toUpperCase()}
                        </span>
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {vendor.companyName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            ID: {vendor.id}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{vendor.businessEmail}</div>
                                <div className="text-sm text-gray-500">{vendor.phone}</div>
                                <div className="text-xs text-gray-400">
                                    {getBusinessTypeLabel(vendor.businessType)}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {formatCurrency(vendor.totalSales || 0)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {vendor.totalProducts || 0} products
                                </div>
                                <div className="text-xs text-gray-400">
                                    {vendor.totalOrders || 0} orders
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                  <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                    {vendor.status}
                  </span>
                                {vendor.isVerified && (
                                    <div className="text-xs text-green-600 mt-1">✓ Verified</div>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(vendor.createdAt)}
                            </td>
                            {showActions && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onView(vendor)}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(vendor)}
                                    >
                                        Edit
                                    </Button>
                                    {vendor.status === VendorStatus.PENDING && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onApprove(vendor)}
                                                className="text-green-600 border-green-200 hover:bg-green-50"
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onReject(vendor)}
                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                            >
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onDelete(vendor.id)}
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                        Delete
                                    </Button>
                                </td>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(currentPage * 10) + 1}</span> to{' '}
                                <span
                                    className="font-medium">{Math.min((currentPage + 1) * 10, totalItems)}</span> of{' '}
                                <span className="font-medium">{totalItems}</span> results
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 0}
                                onClick={() => onPageChange(currentPage - 1)}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage >= totalPages - 1}
                                onClick={() => onPageChange(currentPage + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}