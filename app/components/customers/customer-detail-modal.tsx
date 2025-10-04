// app/components/customers/customer-detail-modal.tsx
'use client';

import { Customer, CustomerDetail, CustomerUpdateRequest } from '@/app/lib/types/customer';
import { CustomerService } from '@/app/lib/api/customer-service';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { formatDate, formatCurrency } from '@/app/lib/utils/formatters';
import { useState, useEffect } from 'react';

interface CustomerDetailModalProps {
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
    customer: Customer | null; // Basic customer from list
    mode: 'view' | 'edit';
}

export default function CustomerDetailModal({
                                                isOpen,
                                                onClose,
                                                customer,
                                                mode
                                            }: CustomerDetailModalProps) {
    const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null);
    const [formData, setFormData] = useState<CustomerUpdateRequest>({});
    const [loading, setLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState('');

    // Load full customer details when modal opens
    useEffect(() => {
        if (isOpen && customer) {
            loadCustomerDetail(customer.id);
        }
    }, [isOpen, customer]);

    const loadCustomerDetail = async (customerId: number) => {
        try {
            setDetailLoading(true);
            const detail = await CustomerService.getCustomerDetail(customerId);
            setCustomerDetail(detail);

            // Initialize form data for edit mode
            if (mode === 'edit') {
                setFormData({
                    phone: detail.customer.phone,
                    profileImage: detail.customer.profileImage || '',
                    dateOfBirth: detail.customer.dateOfBirth || '',
                    currency: detail.customer.currency || '',
                    language: detail.customer.language || '',
                    newsletterSubscribed: detail.customer.newsletterSubscribed,
                });
            }
        } catch (err) {
            console.error('Error loading customer details:', err);
            setError('Failed to load customer details');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer) return;

        setLoading(true);
        setError('');

        try {
            await CustomerService.updateCustomer(customer.id, formData);
            onClose(true);
        } catch (err) {
            console.error('Error updating customer:', err);
            setError(err instanceof Error ? err.message : 'Failed to update customer');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleClose = () => {
        setCustomerDetail(null);
        setFormData({});
        setError('');
        onClose();
    };

    if (!isOpen || !customer) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {mode === 'view' ? 'Customer Details' : 'Edit Customer'}
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-red-800 text-sm font-medium">{error}</span>
                            </div>
                        </div>
                    )}

                    {detailLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : customerDetail ? (
                        mode === 'view' ? (
                            // View Mode
                            <div className="space-y-6">
                                {/* Customer Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Personal Information</h4>
                                        <dl className="space-y-2">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                                                <dd className="text-sm text-gray-900">{customerDetail.userInfo.name}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                                <dd className="text-sm text-gray-900">{customerDetail.userInfo.email}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                                <dd className="text-sm text-gray-900">{customerDetail.customer.phone}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                                                <dd className="text-sm text-gray-900">
                                                    {customerDetail.customer.dateOfBirth ? formatDate(customerDetail.customer.dateOfBirth) : 'Not provided'}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Account Information</h4>
                                        <dl className="space-y-2">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Customer Status</dt>
                                                <dd className="text-sm">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              customerDetail.customer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                  customerDetail.customer.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'
                          }`}>
                            {customerDetail.customer.status}
                          </span>
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">User Status</dt>
                                                <dd className="text-sm">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              customerDetail.userInfo.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {customerDetail.userInfo.active ? 'Active' : 'Inactive'}
                          </span>
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Newsletter</dt>
                                                <dd className="text-sm text-gray-900">
                                                    {customerDetail.customer.newsletterSubscribed ? 'Subscribed' : 'Not subscribed'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                                                <dd className="text-sm text-gray-900">{formatDate(customerDetail.customer.createdAt)}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>

                                {/* Statistics */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-3">Customer Statistics</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-gray-900">{customerDetail.customer.totalOrders || 0}</div>
                                            <div className="text-sm text-gray-500">Total Orders</div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-gray-900">
                                                {formatCurrency(customerDetail.customer.totalSpent || 0)}
                                            </div>
                                            <div className="text-sm text-gray-500">Total Spent</div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-gray-900">{customerDetail.customer.loyaltyPoints || 0}</div>
                                            <div className="text-sm text-gray-500">Loyalty Points</div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-gray-900">{customerDetail.customer.reviewCount || 0}</div>
                                            <div className="text-sm text-gray-500">Reviews</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Preferences */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Preferences</h4>
                                    <dl className="space-y-2">
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Currency</dt>
                                            <dd className="text-sm text-gray-900">{customerDetail.customer.currency || 'Not set'}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Language</dt>
                                            <dd className="text-sm text-gray-900">{customerDetail.customer.language || 'Not set'}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        ) : (
                            // Edit Mode
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone || ''}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                                            Date of Birth
                                        </label>
                                        <Input
                                            id="dateOfBirth"
                                            name="dateOfBirth"
                                            type="date"
                                            value={formData.dateOfBirth || ''}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                                            Currency
                                        </label>
                                        <select
                                            id="currency"
                                            name="currency"
                                            value={formData.currency || ''}
                                            onChange={handleChange}
                                            disabled={loading}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">Select currency</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                            <option value="BDT">BDT</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                                            Language
                                        </label>
                                        <select
                                            id="language"
                                            name="language"
                                            value={formData.language || ''}
                                            onChange={handleChange}
                                            disabled={loading}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">Select language</option>
                                            <option value="en">English</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                            <option value="bn">Bengali</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">
                                        Profile Image URL
                                    </label>
                                    <Input
                                        id="profileImage"
                                        name="profileImage"
                                        type="url"
                                        value={formData.profileImage || ''}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="newsletterSubscribed"
                                        name="newsletterSubscribed"
                                        type="checkbox"
                                        checked={formData.newsletterSubscribed || false}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="newsletterSubscribed" className="ml-2 block text-sm text-gray-900">
                                        Subscribe to newsletter
                                    </label>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleClose}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <div className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Updating...
                                            </div>
                                        ) : (
                                            'Update Customer'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-3">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-500">Loading customer details...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}