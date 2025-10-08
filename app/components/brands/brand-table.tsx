// app/components/brands/brand-table.tsx
'use client';

import {Brand} from '@/app/lib/types/brand';
import {Button} from '@/app/components/ui/button';
import {formatDate} from '@/app/lib/utils/formatters';

interface BrandsTableProps {
    brands: Brand[];
    onView: (brand: Brand) => void;
    onEdit: (brand: Brand) => void;
    onDelete: (id: number) => void;
    onToggleStatus: (id: number) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    pageSize: number;
}

export default function BrandsTable({
                                        brands,
                                        onView,
                                        onEdit,
                                        onDelete,
                                        onToggleStatus,
                                        currentPage,
                                        totalPages,
                                        onPageChange,
                                        totalItems,
                                        pageSize
                                    }: BrandsTableProps) {
    if (brands.length === 0) {
        return (
            <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No brands found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new brand.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Brand
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Products
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Featured
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {brands.map((brand) => (
                        <tr key={brand.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    {brand.logoUrl && (
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img
                                                className="h-10 w-10 rounded-lg object-contain border border-gray-200"
                                                src={brand.logoUrl}
                                                alt={brand.name}
                                            />
                                        </div>
                                    )}
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {brand.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {brand.description || 'No description'}
                                        </div>
                                        {brand.websiteUrl && (
                                            <div className="text-xs text-blue-600">
                                                <a href={brand.websiteUrl} target="_blank" rel="noopener noreferrer">
                                                    {brand.websiteUrl}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{brand.productCount || 0}</div>
                                <div className="text-sm text-gray-500">products</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                    onClick={() => onToggleStatus(brand.id)}
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        brand.active
                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                    }`}
                                >
                                    {brand.active ? 'Active' : 'Inactive'}
                                </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        brand.featured
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {brand.featured ? 'Featured' : 'Regular'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(brand.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onView(brand)}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(brand)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => onDelete(brand.id)}
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