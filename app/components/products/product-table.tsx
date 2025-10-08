// app/components/products/product-table.tsx
'use client';

import {Product} from '@/app/lib/types/product';
import {Button} from '@/app/components/ui/button';
import {formatCurrency, formatDate} from '@/app/lib/utils/formatters';

interface ProductsTableProps {
    products: Product[];
    onView: (product: Product) => void;
    onEdit: (product: Product) => void;
    onDelete: (id: number) => void;
    onStatusChange: (id: number, status: string) => void;
    onStockUpdate: (id: number, stock: number) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    pageSize: number;
}

export default function ProductsTable({
                                          products,
                                          onView,
                                          onEdit,
                                          onDelete,
                                          onStatusChange,
                                          onStockUpdate,
                                          currentPage,
                                          totalPages,
                                          onPageChange,
                                          totalItems,
                                          pageSize
                                      }: ProductsTableProps) {
    if (products.length === 0) {
        return (
            <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new product.</p>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            DRAFT: {color: 'bg-gray-100 text-gray-800', label: 'Draft'},
            ACTIVE: {color: 'bg-green-100 text-green-800', label: 'Active'},
            INACTIVE: {color: 'bg-red-100 text-red-800', label: 'Inactive'},
            OUT_OF_STOCK: {color: 'bg-orange-100 text-orange-800', label: 'Out of Stock'},
            DISCONTINUED: {color: 'bg-purple-100 text-purple-800', label: 'Discontinued'}
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getStockBadge = (stock: number, lowStockThreshold: number | null) => {
        if (stock === 0) {
            return <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Out of Stock</span>;
        }
        if (lowStockThreshold && stock <= lowStockThreshold) {
            return <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Low Stock</span>;
        }
        return <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">In Stock</span>;
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
                            Brand {/* NEW: Added Brand column */}
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
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
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vendor
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
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    {product.images && product.images.length > 0 && (
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img
                                                className="h-10 w-10 rounded-lg object-cover"
                                                src={product.images[0].imageUrl}
                                                alt={product.name}
                                            />
                                        </div>
                                    )}
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {product.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            SKU: {product.sku}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {product.categoryName}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            {/* Brand Column - FIXED: Now shows brand name */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {product.brandName || 'No Brand'}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    {formatCurrency(product.price)}
                                </div>
                                {product.compareAtPrice && (
                                    <div className="text-sm text-gray-500 line-through">
                                        {formatCurrency(product.compareAtPrice)}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                    {getStockBadge(product.stock, product.lowStockThreshold)}
                                    <div className="text-sm text-gray-900">{product.stock}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                    value={product.status}
                                    onChange={(e) => onStatusChange(product.id, e.target.value)}
                                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="OUT_OF_STOCK">Out of Stock</option>
                                    <option value="DISCONTINUED">Discontinued</option>
                                </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{product.vendorName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(product.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onView(product)}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(product)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => onDelete(product.id)}
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