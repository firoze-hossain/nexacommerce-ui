// app/components/hero/hero-create-modal.tsx
'use client';

import { useState } from 'react';
import { HeroContentCreateRequest } from '@/app/lib/types/hero';
import { HeroService } from '@/app/lib/api/hero-service';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

interface HeroCreateModalProps {
    isOpen: boolean;
    onClose: (success?: boolean) => void;
    onSuccess?: () => void;
}

export default function HeroCreateModal({
                                            isOpen,
                                            onClose,
                                            onSuccess
                                        }: HeroCreateModalProps) {
    const [formData, setFormData] = useState<HeroContentCreateRequest>({
        title: '',
        subtitle: '',
        description: '',
        backgroundImage: '',
        overlayColor: '#4F46E5',
        overlayOpacity: 0.8,
        active: true,
        displayOrder: 0,
        button1Text: '',
        button1Url: '',
        button1Color: '#FBBF24',
        button2Text: '',
        button2Url: '',
        button2Color: '#FFFFFF',
        startDate: new Date().toISOString().slice(0, 16),
        endDate: '',
        type: 'MAIN_BANNER',
        targetAudience: 'ALL',
        segmentFilters: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await HeroService.createHeroContent(formData);
            onClose(true);
            onSuccess?.();
        } catch (err) {
            console.error('Error creating hero content:', err);
            setError(err instanceof Error ? err.message : 'Failed to create hero content');
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
        setFormData({
            title: '',
            subtitle: '',
            description: '',
            backgroundImage: '',
            overlayColor: '#4F46E5',
            overlayOpacity: 0.8,
            active: true,
            displayOrder: 0,
            button1Text: '',
            button1Url: '',
            button1Color: '#FBBF24',
            button2Text: '',
            button2Url: '',
            button2Color: '#FFFFFF',
            startDate: new Date().toISOString().slice(0, 16),
            endDate: '',
            type: 'MAIN_BANNER',
            targetAudience: 'ALL',
            segmentFilters: '',
        });
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Create Hero Content
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

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Title *
                                </label>
                                <Input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="Enter hero title"
                                />
                            </div>

                            <div>
                                <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-1">
                                    Subtitle
                                </label>
                                <Input
                                    id="subtitle"
                                    name="subtitle"
                                    type="text"
                                    value={formData.subtitle}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="Enter subtitle"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                disabled={loading}
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter description"
                            />
                        </div>

                        {/* Background Image */}
                        <div>
                            <label htmlFor="backgroundImage" className="block text-sm font-medium text-gray-700 mb-1">
                                Background Image URL *
                            </label>
                            <Input
                                id="backgroundImage"
                                name="backgroundImage"
                                type="url"
                                value={formData.backgroundImage}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                placeholder="https://example.com/banner.jpg"
                            />
                        </div>

                        {/* Overlay Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="overlayColor" className="block text-sm font-medium text-gray-700 mb-1">
                                    Overlay Color
                                </label>
                                <div className="flex space-x-2">
                                    <Input
                                        id="overlayColor"
                                        name="overlayColor"
                                        type="color"
                                        value={formData.overlayColor}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="w-20"
                                    />
                                    <Input
                                        type="text"
                                        value={formData.overlayColor}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="overlayOpacity" className="block text-sm font-medium text-gray-700 mb-1">
                                    Overlay Opacity: {formData.overlayOpacity}
                                </label>
                                <input
                                    id="overlayOpacity"
                                    name="overlayOpacity"
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={formData.overlayOpacity}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Button Configuration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-700">Primary Button</h4>
                                <Input
                                    name="button1Text"
                                    type="text"
                                    value={formData.button1Text}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="Button text"
                                />
                                <Input
                                    name="button1Url"
                                    type="url"
                                    value={formData.button1Url}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="Button URL"
                                />
                                <Input
                                    name="button1Color"
                                    type="color"
                                    value={formData.button1Color}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-700">Secondary Button</h4>
                                <Input
                                    name="button2Text"
                                    type="text"
                                    value={formData.button2Text}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="Button text"
                                />
                                <Input
                                    name="button2Url"
                                    type="url"
                                    value={formData.button2Url}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="Button URL"
                                />
                                <Input
                                    name="button2Color"
                                    type="color"
                                    value={formData.button2Color}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 mb-1">
                                    Display Order
                                </label>
                                <Input
                                    id="displayOrder"
                                    name="displayOrder"
                                    type="number"
                                    value={formData.displayOrder}
                                    onChange={handleChange}
                                    disabled={loading}
                                    min="0"
                                />
                            </div>

                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                    Type
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
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
                                <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-1">
                                    Target Audience
                                </label>
                                <select
                                    id="targetAudience"
                                    name="targetAudience"
                                    value={formData.targetAudience}
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

                        {/* Schedule */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date *
                                </label>
                                <Input
                                    id="startDate"
                                    name="startDate"
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date (Optional)
                                </label>
                                <Input
                                    id="endDate"
                                    name="endDate"
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <input
                                    id="active"
                                    name="active"
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                                    Active
                                </label>
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
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </div>
                                ) : (
                                    'Create Hero Content'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}