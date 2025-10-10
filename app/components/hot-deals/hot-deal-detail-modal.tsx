// app/components/hot-deals/hot-deal-detail-modal.tsx
'use client';

import {HotDeal, HotDealUpdateRequest} from '@/app/lib/types/hot-deal';
import {HotDealService} from '@/app/lib/api/hot-deal-service';
import {Button} from '@/app/components/ui/button';
import {Input} from '@/app/components/ui/input';
import {formatDate} from '@/app/lib/utils/formatters';
import {useEffect, useState} from 'react';

interface HotDealDetailModalProps {
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
    hotDeal: HotDeal | null;
    mode: 'view' | 'edit';
}

export default function HotDealDetailModal({
                                               isOpen,
                                               onClose,
                                               hotDeal,
                                               mode
                                           }: HotDealDetailModalProps) {
    const [formData, setFormData] = useState<HotDealUpdateRequest>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && hotDeal && mode === 'edit') {
            setFormData({
                discountType: hotDeal.discountType,
                discountValue: hotDeal.discountValue,
                startDate: hotDeal.startDate.split('.')[0], // Remove milliseconds for datetime-local
                endDate: hotDeal.endDate.split('.')[0],
                stockLimit: hotDeal.stockLimit,
                isActive: hotDeal.isActive,
            });
        }
    }, [isOpen, hotDeal, mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hotDeal) return;

        setLoading(true);
        setError('');

        try {
            await HotDealService.updateHotDeal(hotDeal.id, formData);
            onClose(true);
        } catch (err) {
            console.error('Error updating hot deal:', err);
            setError(err instanceof Error ? err.message : 'Failed to update hot deal');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value, type} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleClose = () => {
        setFormData({});
        setError('');
        onClose();
    };

    const calculateTimeLeft = (endDate: string) => {
        const difference = new Date(endDate).getTime() - new Date().getTime();
        if (difference <= 0) return {days: 0, hours: 0, minutes: 0, seconds: 0};

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
    };

    if (!isOpen || !hotDeal) return null;

    const timeLeft = calculateTimeLeft(hotDeal.endDate);
    const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {mode === 'view' ? 'Hot Deal Details' : 'Edit Hot Deal'}
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

                    {mode === 'view' ? (
                        // View Mode
                        <div className="space-y-6">
                            {/* Product Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-500 mb-3">Product Information</h4>
                                <div className="flex items-center space-x-4">
                                    {hotDeal.product?.images?.[0]?.imageUrl && (
                                        <img
                                            src={hotDeal.product.images[0].imageUrl}
                                            alt={hotDeal.product.name}
                                            className="h-16 w-16 object-cover rounded-lg"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{hotDeal.product.name}</div>
                                        <div className="text-sm text-gray-500">SKU: {hotDeal.product.sku}</div>
                                        <div className="text-sm text-gray-500">ID: {hotDeal.product.id}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Pricing</h4>
                                    <dl className="space-y-2">
                                        <div className="flex justify-between">
                                            <dt className="text-sm text-gray-500">Original Price</dt>
                                            <dd className="text-sm text-gray-900">${hotDeal.originalPrice.toFixed(2)}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm text-gray-500">Deal Price</dt>
                                            <dd className="text-sm font-bold text-red-600">${hotDeal.dealPrice.toFixed(2)}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm text-gray-500">You Save</dt>
                                            <dd className="text-sm text-green-600">
                                                ${(hotDeal.originalPrice - hotDeal.dealPrice).toFixed(2)}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm text-gray-500">Discount</dt>
                                            <dd className="text-sm font-medium text-gray-900">
                                                {hotDeal.discountType === 'PERCENTAGE'
                                                    ? `${hotDeal.discountValue}%`
                                                    : `$${hotDeal.discountValue}`
                                                }
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Deal Settings</h4>
                                    <dl className="space-y-2">
                                        <div className="flex justify-between">
                                            <dt className="text-sm text-gray-500">Discount Type</dt>
                                            <dd className="text-sm text-gray-900">{hotDeal.discountType}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm text-gray-500">Stock Limit</dt>
                                            <dd className="text-sm text-gray-900">
                                                {hotDeal.stockLimit ? hotDeal.stockLimit : 'Unlimited'}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm text-gray-500">Sold</dt>
                                            <dd className="text-sm text-gray-900">{hotDeal.soldCount}</dd>
                                        </div>
                                        {hotDeal.stockLimit && (
                                            <div className="flex justify-between">
                                                <dt className="text-sm text-gray-500">Remaining</dt>
                                                <dd className="text-sm text-gray-900">{hotDeal.remainingStock}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            </div>

                            {/* Timer */}
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-red-800 mb-2">
                                    {isExpired ? 'Deal Expired' : 'Time Remaining'}
                                </h4>
                                {!isExpired ? (
                                    <div className="flex justify-center space-x-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-red-900">{timeLeft.days}</div>
                                            <div className="text-xs text-red-700">Days</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-red-900">{timeLeft.hours}</div>
                                            <div className="text-xs text-red-700">Hours</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-red-900">{timeLeft.minutes}</div>
                                            <div className="text-xs text-red-700">Minutes</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-red-900">{timeLeft.seconds}</div>
                                            <div className="text-xs text-red-700">Seconds</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-red-800 font-medium">
                                        This deal has ended
                                    </div>
                                )}
                            </div>

                            {/* Status & Period */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">Active Status</span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                hotDeal.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {hotDeal.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">Current Status</span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                hotDeal.isCurrentlyActive
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {hotDeal.isCurrentlyActive ? 'Running' : 'Not Active'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Period</h4>
                                    <dl className="space-y-2">
                                        <div className="flex justify-between">
                                            <dt className="text-sm text-gray-500">Start Date</dt>
                                            <dd className="text-sm text-gray-900">{formatDate(hotDeal.startDate)}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm text-gray-500">End Date</dt>
                                            <dd className="text-sm text-gray-900">{formatDate(hotDeal.endDate)}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {/* Timestamps */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Created At</dt>
                                    <dd className="text-sm text-gray-900">{formatDate(hotDeal.createdAt)}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Updated At</dt>
                                    <dd className="text-sm text-gray-900">{formatDate(hotDeal.updatedAt)}</dd>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Edit Mode
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="discountType" className="block text-sm font-medium text-gray-700 mb-1">
                                        Discount Type
                                    </label>
                                    <select
                                        id="discountType"
                                        name="discountType"
                                        value={formData.discountType || ''}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value="PERCENTAGE">Percentage</option>
                                        <option value="FIXED_AMOUNT">Fixed Amount</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700 mb-1">
                                        Discount Value
                                        {formData.discountType === 'PERCENTAGE' && (
                                            <span className="text-xs text-gray-500 ml-1">(%)</span>
                                        )}
                                        {formData.discountType === 'FIXED_AMOUNT' && (
                                            <span className="text-xs text-gray-500 ml-1">($)</span>
                                        )}
                                    </label>
                                    <Input
                                        id="discountValue"
                                        name="discountValue"
                                        type="number"
                                        step={formData.discountType === 'PERCENTAGE' ? 1 : 0.01}
                                        min="0"
                                        max={formData.discountType === 'PERCENTAGE' ? 100 : undefined}
                                        value={formData.discountValue || ''}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date
                                    </label>
                                    <Input
                                        id="startDate"
                                        name="startDate"
                                        type="datetime-local"
                                        value={formData.startDate || ''}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date
                                    </label>
                                    <Input
                                        id="endDate"
                                        name="endDate"
                                        type="datetime-local"
                                        value={formData.endDate || ''}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="stockLimit" className="block text-sm font-medium text-gray-700 mb-1">
                                    Stock Limit
                                </label>
                                <Input
                                    id="stockLimit"
                                    name="stockLimit"
                                    type="number"
                                    min="1"
                                    value={formData.stockLimit || ''}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="Leave empty for unlimited stock"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="isActive"
                                    name="isActive"
                                    type="checkbox"
                                    checked={formData.isActive || false}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        isActive: e.target.checked
                                    }))}
                                    disabled={loading}
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                    Active
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
                                    className="bg-red-600 hover:bg-red-700"
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
                                            Updating...
                                        </div>
                                    ) : (
                                        'Update Hot Deal'
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}