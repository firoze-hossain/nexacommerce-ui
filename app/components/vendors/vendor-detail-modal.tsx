// app/components/vendors/vendor-detail-modal.tsx
'use client';

import {BusinessType, Vendor, VendorDetail, VendorStatus, VendorUpdateRequest} from '@/app/lib/types/vendor';
import {VendorService} from '@/app/lib/api/vendor-service';
import {Button} from '@/app/components/ui/button';
import {Input} from '@/app/components/ui/input';
import {formatCurrency, formatDate} from '@/app/lib/utils/formatters';
import {useEffect, useState} from 'react';

interface VendorDetailModalProps {
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
    vendor: Vendor | null;
    mode: 'view' | 'edit' | 'approval';
}

export default function VendorDetailModal({
                                              isOpen,
                                              onClose,
                                              vendor,
                                              mode
                                          }: VendorDetailModalProps) {
    const [vendorDetail, setVendorDetail] = useState<VendorDetail | null>(null);
    const [formData, setFormData] = useState<VendorUpdateRequest>({});
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState('');

    // Load full vendor details when modal opens
    useEffect(() => {
        if (isOpen && vendor) {
            loadVendorDetail(vendor.id);
        }
    }, [isOpen, vendor]);

    const loadVendorDetail = async (vendorId: number) => {
        try {
            setDetailLoading(true);
            const detail = await VendorService.getVendorDetail(vendorId);
            setVendorDetail(detail);

            // Initialize form data for edit mode
            if (mode === 'edit') {
                setFormData({
                    companyName: detail.vendor.companyName,
                    businessEmail: detail.vendor.businessEmail,
                    phone: detail.vendor.phone,
                    description: detail.vendor.description || '',
                    website: detail.vendor.website || '',
                    taxNumber: '',
                    commissionRate: detail.vendor.commissionRate,
                });
            }
        } catch (err) {
            console.error('Error loading vendor details:', err);
            setError('Failed to load vendor details');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendor) return;

        setLoading(true);
        setError('');

        try {
            await VendorService.updateVendor(vendor.id, formData);
            onClose(true);
        } catch (err) {
            console.error('Error updating vendor:', err);
            setError(err instanceof Error ? err.message : 'Failed to update vendor');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!vendor) return;

        setLoading(true);
        setError('');

        try {
            await VendorService.approveVendor(vendor.id);
            onClose(true);
        } catch (err) {
            console.error('Error approving vendor:', err);
            setError(err instanceof Error ? err.message : 'Failed to approve vendor');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!vendor || !rejectionReason.trim()) {
            setError('Please provide a rejection reason');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await VendorService.rejectVendor(vendor.id, rejectionReason);
            onClose(true);
        } catch (err) {
            console.error('Error rejecting vendor:', err);
            setError(err instanceof Error ? err.message : 'Failed to reject vendor');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value, type} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleClose = () => {
        setVendorDetail(null);
        setFormData({});
        setRejectionReason('');
        setError('');
        onClose();
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

    if (!isOpen || !vendor) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {mode === 'view' ? 'Vendor Details' :
                                mode === 'edit' ? 'Edit Vendor' : 'Vendor Approval'}
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                          clipRule="evenodd"/>
                                </svg>
                                <span className="text-red-800 text-sm font-medium">{error}</span>
                            </div>
                        </div>
                    )}

                    {detailLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : vendorDetail ? (
                        mode === 'view' ? (
                            // View Mode
                            <div className="space-y-6">
                                {/* Vendor and Contact Info */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Vendor Information</h4>
                                        <dl className="space-y-2">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                                                <dd className="text-sm text-gray-900">{vendorDetail.vendor.companyName}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Business Email</dt>
                                                <dd className="text-sm text-gray-900">{vendorDetail.vendor.businessEmail}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                                <dd className="text-sm text-gray-900">{vendorDetail.vendor.phone}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Business Type</dt>
                                                <dd className="text-sm text-gray-900">{getBusinessTypeLabel(vendorDetail.vendor.businessType)}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Website</dt>
                                                <dd className="text-sm text-gray-900">{vendorDetail.vendor.website || 'Not provided'}</dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Person</h4>
                                        <dl className="space-y-2">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Name</dt>
                                                <dd className="text-sm text-gray-900">{vendorDetail.userInfo.name}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                                <dd className="text-sm text-gray-900">{vendorDetail.userInfo.email}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">User Status</dt>
                                                <dd className="text-sm">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              vendorDetail.userInfo.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {vendorDetail.userInfo.active ? 'Active' : 'Inactive'}
                          </span>
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>

                                {/* Status and Performance */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Status Information</h4>
                                        <dl className="space-y-2">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Vendor Status</dt>
                                                <dd className="text-sm">
                          <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(vendorDetail.vendor.status)}`}>
                            {vendorDetail.vendor.status}
                          </span>
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Verification</dt>
                                                <dd className="text-sm text-gray-900">
                                                    {vendorDetail.vendor.isVerified ?
                                                        `Verified on ${formatDate(vendorDetail.vendor.verifiedAt!)}` :
                                                        'Not verified'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Commission Rate</dt>
                                                <dd className="text-sm text-gray-900">{vendorDetail.vendor.commissionRate}%</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Registered</dt>
                                                <dd className="text-sm text-gray-900">{formatDate(vendorDetail.vendor.createdAt)}</dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Performance Metrics</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                                <div
                                                    className="text-lg font-bold text-gray-900">{vendorDetail.vendor.totalProducts}</div>
                                                <div className="text-xs text-gray-500">Products</div>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                                <div
                                                    className="text-lg font-bold text-gray-900">{vendorDetail.vendor.totalOrders}</div>
                                                <div className="text-xs text-gray-500">Orders</div>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                                <div className="text-lg font-bold text-gray-900">
                                                    {formatCurrency(vendorDetail.vendor.totalSales)}
                                                </div>
                                                <div className="text-xs text-gray-500">Total Sales</div>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                                <div className="text-lg font-bold text-gray-900">
                                                    {vendorDetail.vendor.ratingAvg ? vendorDetail.vendor.ratingAvg.toFixed(1) : 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500">Rating</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                {vendorDetail.vendor.description && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Business Description</h4>
                                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4">
                                            {vendorDetail.vendor.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : mode === 'edit' ? (
                            // Edit Mode
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="companyName"
                                               className="block text-sm font-medium text-gray-700 mb-1">
                                            Company Name
                                        </label>
                                        <Input
                                            id="companyName"
                                            name="companyName"
                                            type="text"
                                            value={formData.companyName || ''}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="businessEmail"
                                               className="block text-sm font-medium text-gray-700 mb-1">
                                            Business Email
                                        </label>
                                        <Input
                                            id="businessEmail"
                                            name="businessEmail"
                                            type="email"
                                            value={formData.businessEmail || ''}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>

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
                                        <label htmlFor="commissionRate"
                                               className="block text-sm font-medium text-gray-700 mb-1">
                                            Commission Rate (%)
                                        </label>
                                        <Input
                                            id="commissionRate"
                                            name="commissionRate"
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="100"
                                            value={formData.commissionRate || ''}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="website"
                                               className="block text-sm font-medium text-gray-700 mb-1">
                                            Website
                                        </label>
                                        <Input
                                            id="website"
                                            name="website"
                                            type="url"
                                            value={formData.website || ''}
                                            onChange={handleChange}
                                            disabled={loading}
                                            placeholder="https://example.com"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="description"
                                               className="block text-sm font-medium text-gray-700 mb-1">
                                            Business Description
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description || ''}
                                            onChange={handleChange}
                                            disabled={loading}
                                            rows={4}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
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
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none"
                                                     viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10"
                                                            stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor"
                                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Updating...
                                            </div>
                                        ) : (
                                            'Update Vendor'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            // Approval Mode
                            <div className="space-y-6">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <svg className="h-5 w-5 text-yellow-400 mr-2" viewBox="0 0 20 20"
                                             fill="currentColor">
                                            <path fillRule="evenodd"
                                                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                  clipRule="evenodd"/>
                                        </svg>
                                        <span className="text-yellow-800 text-sm font-medium">
                      Review vendor registration before approval
                    </span>
                                    </div>
                                </div>

                                {/* Vendor Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Company Information</h4>
                                        <dl className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Company Name:</dt>
                                                <dd className="text-gray-900">{vendorDetail.vendor.companyName}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Business Type:</dt>
                                                <dd className="text-gray-900">{getBusinessTypeLabel(vendorDetail.vendor.businessType)}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Business Email:</dt>
                                                <dd className="text-gray-900">{vendorDetail.vendor.businessEmail}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Phone:</dt>
                                                <dd className="text-gray-900">{vendorDetail.vendor.phone}</dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Person</h4>
                                        <dl className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Name:</dt>
                                                <dd className="text-gray-900">{vendorDetail.userInfo.name}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Email:</dt>
                                                <dd className="text-gray-900">{vendorDetail.userInfo.email}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Registered:</dt>
                                                <dd className="text-gray-900">{formatDate(vendorDetail.vendor.createdAt)}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>

                                {/* Description */}
                                {vendorDetail.vendor.description && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Business Description</h4>
                                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                                            {vendorDetail.vendor.description}
                                        </p>
                                    </div>
                                )}

                                {/* Rejection Reason */}
                                <div>
                                    <label htmlFor="rejectionReason"
                                           className="block text-sm font-medium text-gray-700 mb-1">
                                        Rejection Reason (if rejecting)
                                    </label>
                                    <textarea
                                        id="rejectionReason"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        disabled={loading}
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Provide reason for rejection..."
                                    />
                                </div>

                                {/* Action Buttons */}
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
                                        type="button"
                                        onClick={handleReject}
                                        disabled={loading || !rejectionReason.trim()}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        Reject Vendor
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleApprove}
                                        disabled={loading}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        Approve Vendor
                                    </Button>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-3">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <p className="text-gray-500">Loading vendor details...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}