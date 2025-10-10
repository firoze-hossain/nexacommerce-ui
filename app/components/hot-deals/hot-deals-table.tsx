// app/components/hot-deals/hot-deals-table.tsx
'use client';

import {HotDeal} from '@/app/lib/types/hot-deal';
import {Button} from '@/app/components/ui/button';
import {formatDate} from '@/app/lib/utils/formatters';

interface HotDealsTableProps {
    hotDeals: HotDeal[];
    onView: (hotDeal: HotDeal) => void;
    onEdit: (hotDeal: HotDeal) => void;
    onDelete: (id: number) => void;
    onToggleStatus: (id: number, isActive: boolean) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    pageSize: number;
}

export default function HotDealsTable({
                                          hotDeals,
                                          onView,
                                          onEdit,
                                          onDelete,
                                          onToggleStatus,
                                          currentPage,
                                          totalPages,
                                          onPageChange,
                                          totalItems,
                                          pageSize
                                      }: HotDealsTableProps) {
    if (hotDeals.length === 0) {
        return (
            <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hot deals found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new hot deal.</p>
            </div>
        );
    }

    const calculateTimeLeft = (endDate: string) => {
        const difference = new Date(endDate).getTime() - new Date().getTime();
        if (difference <= 0) return 'Expired';

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);

        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    };

    return (
        <div className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Discount
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Period
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stock
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {hotDeals.map((hotDeal) => (
                        <tr key={hotDeal.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    {hotDeal.product?.images?.[0]?.imageUrl && (
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img
                                                className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                                                src={hotDeal.product.images[0].imageUrl}
                                                alt={hotDeal.product.name}
                                            />
                                        </div>
                                    )}
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {hotDeal.product?.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            SKU: {hotDeal.product?.sku}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            ID: {hotDeal.product?.id}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    {hotDeal.discountType === 'PERCENTAGE'
                                        ? `${hotDeal.discountValue}%`
                                        : `$${hotDeal.discountValue}`
                                    }
                                </div>
                                <div className="text-sm text-gray-500">
                                    {hotDeal.discountPercentage.toFixed(1)}% off
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm">
                                    <div className="font-medium text-red-600">${hotDeal.dealPrice.toFixed(2)}</div>
                                    <div className="text-gray-500 line-through text-xs">
                                        ${hotDeal.originalPrice.toFixed(2)}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {formatDate(hotDeal.startDate)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    to {formatDate(hotDeal.endDate)}
                                </div>
                                <div className={`text-xs font-medium ${
                                    hotDeal.isCurrentlyActive ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {calculateTimeLeft(hotDeal.endDate)}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {hotDeal.stockLimit ? (
                                    <div className="text-sm">
                                        <div className="text-gray-900">
                                            {hotDeal.soldCount} / {hotDeal.stockLimit}
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                            <div
                                                className="bg-red-600 h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min((hotDeal.soldCount / hotDeal.stockLimit) * 100, 100)}%`
                                                }}
                                            ></div>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {hotDeal.remainingStock} left
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-sm text-gray-500">Unlimited</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="space-y-1">
                                    <button
                                        onClick={() => onToggleStatus(hotDeal.id, !hotDeal.isActive)}
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            hotDeal.isActive
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                        }`}
                                    >
                                        {hotDeal.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        hotDeal.isCurrentlyActive
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {hotDeal.isCurrentlyActive ? 'Running' : 'Not Active'}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onView(hotDeal)}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(hotDeal)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => onDelete(hotDeal.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </td>
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
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1}
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