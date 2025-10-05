// app/components/vendors/vendor-registration-modal.tsx
'use client';

import {useState} from 'react';
import {BusinessType, VendorRegistrationRequest} from '@/app/lib/types/vendor';
import {VendorService} from '@/app/lib/api/vendor-service';
import {Button} from '@/app/components/ui/button';
import {Input} from '@/app/components/ui/input';

interface VendorRegistrationModalProps {
    isOpen: boolean;
    onClose: (success?: boolean) => void;
    onSuccess?: () => void;
}

export default function VendorRegistrationModal({
                                                    isOpen,
                                                    onClose,
                                                    onSuccess
                                                }: VendorRegistrationModalProps) {
    const [formData, setFormData] = useState<VendorRegistrationRequest>({
        contactPersonName: '',
        email: '',
        password: '',
        companyName: '',
        businessEmail: '',
        phone: '',
        businessType: BusinessType.INDIVIDUAL,
        taxNumber: '',
        description: '',
        website: '',
        businessRegistrationNumber: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await VendorService.register(formData);
            onClose(true);
            onSuccess?.();
        } catch (err) {
            console.error('Error registering vendor:', err);
            setError(err instanceof Error ? err.message : 'Failed to register vendor');
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
        setFormData({
            contactPersonName: '',
            email: '',
            password: '',
            companyName: '',
            businessEmail: '',
            phone: '',
            businessType: BusinessType.INDIVIDUAL,
            taxNumber: '',
            description: '',
            website: '',
            businessRegistrationNumber: '',
        });
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Vendor Registration
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

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Contact Person Information */}
                            <div className="md:col-span-2">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Person Information</h4>
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="contactPersonName"
                                       className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact Person Name *
                                </label>
                                <Input
                                    id="contactPersonName"
                                    name="contactPersonName"
                                    type="text"
                                    value={formData.contactPersonName}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="Enter contact person's full name"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address *
                                </label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="Enter email address"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password *
                                </label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="Enter password (min 6 characters)"
                                    minLength={6}
                                />
                            </div>

                            {/* Business Information */}
                            <div className="md:col-span-2 mt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Business Information</h4>
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Name *
                                </label>
                                <Input
                                    id="companyName"
                                    name="companyName"
                                    type="text"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="Enter company name"
                                />
                            </div>

                            <div>
                                <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                    Business Email *
                                </label>
                                <Input
                                    id="businessEmail"
                                    name="businessEmail"
                                    type="email"
                                    value={formData.businessEmail}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="Enter business email"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                </label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div>
                                <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
                                    Business Type *
                                </label>
                                <select
                                    id="businessType"
                                    name="businessType"
                                    value={formData.businessType}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value={BusinessType.INDIVIDUAL}>Individual</option>
                                    <option value={BusinessType.SOLE_PROPRIETORSHIP}>Sole Proprietorship</option>
                                    <option value={BusinessType.PARTNERSHIP}>Partnership</option>
                                    <option value={BusinessType.CORPORATION}>Corporation</option>
                                    <option value={BusinessType.LLC}>LLC</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="taxNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tax Number
                                </label>
                                <Input
                                    id="taxNumber"
                                    name="taxNumber"
                                    type="text"
                                    value={formData.taxNumber}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="Enter tax number"
                                />
                            </div>

                            <div>
                                <label htmlFor="businessRegistrationNumber"
                                       className="block text-sm font-medium text-gray-700 mb-1">
                                    Business Registration Number
                                </label>
                                <Input
                                    id="businessRegistrationNumber"
                                    name="businessRegistrationNumber"
                                    type="text"
                                    value={formData.businessRegistrationNumber}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="Enter registration number"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                                    Website
                                </label>
                                <Input
                                    id="website"
                                    name="website"
                                    type="url"
                                    value={formData.website}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="https://example.com"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Business Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    disabled={loading}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Describe your business"
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
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none"
                                             viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </div>
                                ) : (
                                    'Register Vendor'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}