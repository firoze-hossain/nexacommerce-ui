// app/components/hero/hero-detail-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import { HeroContent, HeroContentUpdateRequest, HeroAnalytics } from '@/app/lib/types/hero';
import { HeroService } from '@/app/lib/api/hero-service';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { formatDate } from '@/app/lib/utils/formatters';

interface HeroDetailModalProps {
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
    hero: HeroContent | null;
    mode: 'view' | 'edit';
}

export default function HeroDetailModal({
                                            isOpen,
                                            onClose,
                                            hero,
                                            mode
                                        }: HeroDetailModalProps) {
    const [heroDetail, setHeroDetail] = useState<HeroContent | null>(null);
    const [analytics, setAnalytics] = useState<HeroAnalytics | null>(null);
    const [formData, setFormData] = useState<HeroContentUpdateRequest>({});
    const [loading, setLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && hero) {
            loadHeroDetail(hero.id);
            loadHeroAnalytics(hero.id);
        }
    }, [isOpen, hero]);

    const loadHeroDetail = async (heroId: number) => {
        try {
            setDetailLoading(true);
            const response = await HeroService.getHeroContentById(heroId);

            if (response.success && response.data) {
                setHeroDetail(response.data);

                // Initialize form data for edit mode
                if (mode === 'edit') {
                    setFormData({
                        title: response.data.title,
                        subtitle: response.data.subtitle || '',
                        description: response.data.description || '',
                        backgroundImage: response.data.backgroundImage,
                        overlayColor: response.data.overlayColor,
                        overlayOpacity: response.data.overlayOpacity,
                        active: response.data.active,
                        displayOrder: response.data.displayOrder,
                        button1Text: response.data.button1Text || '',
                        button1Url: response.data.button1Url || '',
                        button1Color: response.data.button1Color || '#FBBF24',
                        button2Text: response.data.button2Text || '',
                        button2Url: response.data.button2Url || '',
                        button2Color: response.data.button2Color || '#FFFFFF',
                        startDate: response.data.startDate.slice(0, 16),
                        endDate: response.data.endDate ? response.data.endDate.slice(0, 16) : '',
                        type: response.data.type,
                        targetAudience: response.data.targetAudience,
                        segmentFilters: response.data.segmentFilters || '',
                    });
                }
            }
        } catch (err) {
            console.error('Error loading hero details:', err);
            setError('Failed to load hero details');
        } finally {
            setDetailLoading(false);
        }
    };

    const loadHeroAnalytics = async (heroId: number) => {
        try {
            const response = await HeroService.getHeroContentAnalytics(heroId);
            if (response.success && response.data) {
                setAnalytics(Array.isArray(response.data) ? response.data[0] : response.data);
            }
        } catch (err) {
            console.error('Error loading hero analytics:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hero) return;

        setLoading(true);
        setError('');

        try {
            await HeroService.updateHeroContent(hero.id, formData);
            onClose(true);
        } catch (err) {
            console.error('Error updating hero content:', err);
            setError(err instanceof Error ? err.message : 'Failed to update hero content');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? Number(value) :
                    type === 'range' ? parseFloat(value) : value,
        }));
    };

    const handleClose = () => {
        setHeroDetail(null);
        setAnalytics(null);
        setFormData({});
        setError('');
        onClose();
    };

    const getPerformanceBadge = (status: string) => {
        const styles = {
            EXCELLENT: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
            GOOD: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white',
            AVERAGE: 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white',
            POOR: 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
        };
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
    };

    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case 'MAIN_BANNER': return 'bg-blue-100 text-blue-800';
            case 'PROMOTIONAL': return 'bg-purple-100 text-purple-800';
            case 'SEASONAL': return 'bg-green-100 text-green-800';
            case 'PRODUCT_HIGHLIGHT': return 'bg-yellow-100 text-yellow-800';
            case 'BRAND_SPOTLIGHT': return 'bg-indigo-100 text-indigo-800';
            case 'FLASH_SALE': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (!isOpen || !hero) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {mode === 'view' ? 'Hero Content Details' : 'Edit Hero Content'}
                            </h3>
                            <p className="text-gray-600 mt-1">
                                {mode === 'view' ? 'Complete information and analytics' : 'Update hero content settings'}
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-red-800 font-medium">{error}</span>
                            </div>
                        </div>
                    )}

                    {detailLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : heroDetail ? (
                        mode === 'view' ? (
                            // View Mode
                            <div className="space-y-8">
                                {/* Hero Preview */}
                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h4>
                                    <div
                                        className="rounded-xl overflow-hidden shadow-lg h-48 relative"
                                        style={{
                                            backgroundImage: `linear-gradient(rgba(79, 70, 229, ${heroDetail.overlayOpacity || 0.8}), rgba(124, 58, 237, ${heroDetail.overlayOpacity || 0.8})), url('${heroDetail.backgroundImage}')`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center text-white p-6">
                                            <div className="text-center">
                                                <h3 className="text-xl font-bold mb-2">{heroDetail.title}</h3>
                                                {heroDetail.subtitle && (
                                                    <p className="text-lg opacity-90">{heroDetail.subtitle}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Basic Information */}
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Basic Information
                                            </h4>
                                            <dl className="space-y-4">
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Title</dt>
                                                    <dd className="text-lg font-semibold text-gray-900 mt-1">{heroDetail.title}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Subtitle</dt>
                                                    <dd className="text-md text-gray-700 mt-1">
                                                        {heroDetail.subtitle || 'No subtitle'}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                                                    <dd className="text-sm text-gray-600 mt-1 leading-relaxed">
                                                        {heroDetail.description || 'No description provided'}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Background Image</dt>
                                                    <dd className="text-sm text-blue-600 mt-1 break-all">
                                                        <a href={heroDetail.backgroundImage} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                            {heroDetail.backgroundImage}
                                                        </a>
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>

                                        {/* Button Configuration */}
                                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Button Configuration</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {heroDetail.button1Text && (
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <h5 className="font-medium text-gray-900 mb-2">Primary Button</h5>
                                                        <div className="space-y-2 text-sm">
                                                            <div>Text: {heroDetail.button1Text}</div>
                                                            <div>URL: {heroDetail.button1Url}</div>
                                                            <div className="flex items-center space-x-2">
                                                                <span>Color:</span>
                                                                <div
                                                                    className="w-6 h-6 rounded border border-gray-300"
                                                                    style={{ backgroundColor: heroDetail.button1Color }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {heroDetail.button2Text && (
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <h5 className="font-medium text-gray-900 mb-2">Secondary Button</h5>
                                                        <div className="space-y-2 text-sm">
                                                            <div>Text: {heroDetail.button2Text}</div>
                                                            <div>URL: {heroDetail.button2Url}</div>
                                                            <div className="flex items-center space-x-2">
                                                                <span>Color:</span>
                                                                <div
                                                                    className="w-6 h-6 rounded border border-gray-300"
                                                                    style={{ backgroundColor: heroDetail.button2Color }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Analytics & Settings */}
                                    <div className="space-y-6">
                                        {/* Analytics */}
                                        {analytics && (
                                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                                                <h4 className="text-lg font-semibold mb-4 flex items-center">
                                                    <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                    Performance Analytics
                                                </h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold">{analytics.totalImpressions}</div>
                                                        <div className="text-indigo-100 text-sm">Impressions</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold">{analytics.totalClicks}</div>
                                                        <div className="text-indigo-100 text-sm">Clicks</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</div>
                                                        <div className="text-indigo-100 text-sm">Conversion Rate</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${getPerformanceBadge(analytics.performanceStatus)}`}>
                                                            {analytics.performanceStatus}
                                                        </div>
                                                        <div className="text-indigo-100 text-sm mt-1">Performance</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Settings */}
                                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Settings</h4>
                                            <dl className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                                    <dd>
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                            heroDetail.active
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {heroDetail.active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                                                    <dd>
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeBadgeColor(heroDetail.type)}`}>
                                                            {heroDetail.type.replace('_', ' ')}
                                                        </span>
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <dt className="text-sm font-medium text-gray-500">Target Audience</dt>
                                                    <dd className="text-sm text-gray-900">{heroDetail.targetAudience.replace('_', ' ')}</dd>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <dt className="text-sm font-medium text-gray-500">Display Order</dt>
                                                    <dd className="text-sm text-gray-900">{heroDetail.displayOrder}</dd>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <dt className="text-sm font-medium text-gray-500">Overlay</dt>
                                                    <dd className="flex items-center space-x-2">
                                                        <div
                                                            className="w-6 h-6 rounded border border-gray-300"
                                                            style={{ backgroundColor: heroDetail.overlayColor }}
                                                        ></div>
                                                        <span className="text-sm text-gray-900">{heroDetail.overlayColor}</span>
                                                        <span className="text-sm text-gray-500">({(heroDetail.overlayOpacity || 0) * 100}%)</span>
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>

                                        {/* Schedule */}
                                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h4>
                                            <dl className="space-y-3">
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                                                    <dd className="text-sm text-gray-900">{formatDate(heroDetail.startDate)}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">End Date</dt>
                                                    <dd className="text-sm text-gray-900">
                                                        {heroDetail.endDate ? formatDate(heroDetail.endDate) : 'No end date'}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Current Status</dt>
                                                    <dd>
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                            heroDetail.currentlyActive
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {heroDetail.currentlyActive ? 'Currently Active' : 'Not Active'}
                                                        </span>
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>
                                    </div>
                                </div>

                                {/* Timestamps */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h4 className="text-sm font-medium text-gray-500 mb-3">System Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">Created:</span>{' '}
                                            <span className="text-gray-600">{formatDate(heroDetail.createdAt)}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Last Updated:</span>{' '}
                                            <span className="text-gray-600">{formatDate(heroDetail.updatedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Edit Mode
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Basic Information */}
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>

                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                                Title *
                                            </label>
                                            <Input
                                                id="title"
                                                name="title"
                                                type="text"
                                                value={formData.title || ''}
                                                onChange={handleChange}
                                                required
                                                disabled={loading}
                                                className="w-full"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
                                                Subtitle
                                            </label>
                                            <Input
                                                id="subtitle"
                                                name="subtitle"
                                                type="text"
                                                value={formData.subtitle || ''}
                                                onChange={handleChange}
                                                disabled={loading}
                                                className="w-full"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                value={formData.description || ''}
                                                onChange={handleChange}
                                                disabled={loading}
                                                rows={4}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="backgroundImage" className="block text-sm font-medium text-gray-700 mb-2">
                                                Background Image URL *
                                            </label>
                                            <Input
                                                id="backgroundImage"
                                                name="backgroundImage"
                                                type="url"
                                                value={formData.backgroundImage || ''}
                                                onChange={handleChange}
                                                required
                                                disabled={loading}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Settings */}
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-semibold text-gray-900">Settings</h4>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Type
                                                </label>
                                                <select
                                                    id="type"
                                                    name="type"
                                                    value={formData.type || ''}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="MAIN_BANNER">Main Banner</option>
                                                    <option value="PROMOTIONAL">Promotional</option>
                                                    <option value="SEASONAL">Seasonal</option>
                                                    <option value="PRODUCT_HIGHLIGHT">Product Highlight</option>
                                                    <option value="BRAND_SPOTLIGHT">Brand Spotlight</option>
                                                    <option value="FLASH_SALE">Flash Sale</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Audience
                                                </label>
                                                <select
                                                    id="targetAudience"
                                                    name="targetAudience"
                                                    value={formData.targetAudience || ''}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="ALL">All Users</option>
                                                    <option value="GUEST">Guest Users</option>
                                                    <option value="CUSTOMER">Customers</option>
                                                    <option value="NEW_CUSTOMER">New Customers</option>
                                                    <option value="RETURNING_CUSTOMER">Returning Customers</option>
                                                    <option value="VIP_CUSTOMER">VIP Customers</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Display Order
                                                </label>
                                                <Input
                                                    id="displayOrder"
                                                    name="displayOrder"
                                                    type="number"
                                                    value={formData.displayOrder || 0}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                    min="0"
                                                    className="w-full"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="overlayOpacity" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Overlay Opacity: {((formData.overlayOpacity || 0) * 100).toFixed(0)}%
                                                </label>
                                                <input
                                                    id="overlayOpacity"
                                                    name="overlayOpacity"
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.1"
                                                    value={formData.overlayOpacity || 0}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="overlayColor" className="block text-sm font-medium text-gray-700 mb-2">
                                                Overlay Color
                                            </label>
                                            <div className="flex space-x-3">
                                                <Input
                                                    id="overlayColor"
                                                    name="overlayColor"
                                                    type="color"
                                                    value={formData.overlayColor || '#4F46E5'}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                    className="w-16"
                                                />
                                                <Input
                                                    type="text"
                                                    value={formData.overlayColor || '#4F46E5'}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center">
                                                <input
                                                    id="active"
                                                    name="active"
                                                    type="checkbox"
                                                    checked={formData.active || false}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                                                    Active
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                                                Start Date *
                                            </label>
                                            <Input
                                                id="startDate"
                                                name="startDate"
                                                type="datetime-local"
                                                value={formData.startDate || ''}
                                                onChange={handleChange}
                                                required
                                                disabled={loading}
                                                className="w-full"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                                                End Date (Optional)
                                            </label>
                                            <Input
                                                id="endDate"
                                                name="endDate"
                                                type="datetime-local"
                                                value={formData.endDate || ''}
                                                onChange={handleChange}
                                                disabled={loading}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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
                                        className="bg-indigo-600 hover:bg-indigo-700"
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
                                            'Update Hero Content'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-lg">Loading hero content details...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}