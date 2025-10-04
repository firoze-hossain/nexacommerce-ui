// app/components/customers/customer-table.tsx
'use client';

import { Customer, CustomerWithUserInfo } from '@/app/lib/types/customer';
import { Button } from '@/app/components/ui/button';
import { formatDate, formatCurrency } from '@/app/lib/utils/formatters';

interface CustomersTableProps {
    customers: Customer[]; // List returns basic Customer objects
    onView: (customer: Customer) => void;
    onEdit: (customer: Customer) => void;
    onDelete: (id: number) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
}

export default function CustomersTable({
                                           customers,
                                           onView,
                                           onEdit,
                                           onDelete,
                                           currentPage,
                                           totalPages,
                                           onPageChange,
                                           totalItems,
                                       }: CustomersTableProps) {
    if (customers.length === 0) {
        return (
            <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by registering a new customer.</p>
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
                            Customer ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statistics
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                        {customer.profileImage ? (
                                            <img
                                                className="h-10 w-10 rounded-full"
                                                src={customer.profileImage}
                                                alt={`Customer ${customer.id}`}
                                            />
                                        ) : (
                                            <span className="text-indigo-600 font-medium text-sm">
                          C{customer.id}
                        </span>
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            Customer #{customer.id}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Phone: {customer.phone}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    📞 {customer.phone}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {customer.newsletterSubscribed ? '📧 Subscribed' : '📧 Not subscribed'}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {formatCurrency(customer.totalSpent || 0)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {customer.totalOrders || 0} orders
                                </div>
                                <div className="text-xs text-gray-400">
                                    {customer.loyaltyPoints || 0} points
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          customer.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                  }`}>
                    {customer.status}
                  </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(customer.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onView(customer)}
                                >
                                    View
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(customer)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDelete(customer.id)}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                    Delete
                                </Button>
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
                                Showing <span className="font-medium">{(currentPage * 10) + 1}</span> to{' '}
                                <span className="font-medium">{Math.min((currentPage + 1) * 10, totalItems)}</span> of{' '}
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