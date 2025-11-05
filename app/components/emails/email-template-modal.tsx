// app/components/emails/email-template-modal.tsx
'use client';

import { useEffect, useState } from 'react';
import { EmailTemplate, EmailTemplateRequest, EmailConfiguration } from '@/app/lib/types/email';
import { EmailCategory, EmailPurpose, EMAIL_CATEGORIES, EMAIL_PURPOSES, getEmailCategoryDisplayName, getEmailPurposeDisplayName } from '@/app/lib/types/email-enums';
import { EmailService } from '@/app/lib/api/email-service';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

interface EmailTemplateModalProps {
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
    template: EmailTemplate | null;
}

const AVAILABLE_VARIABLES = {
    'user.name': 'User full name',
    'user.email': 'User email address',
    'user.firstName': 'User first name',
    'user.lastName': 'User last name',
    'company.name': 'Company name',
    'company.logo': 'Company logo URL',
    'current.year': 'Current year',
    'reset.link': 'Password reset link',
    'verification.link': 'Email verification link',
    'order.number': 'Order number',
    'order.total': 'Order total amount',
    'order.date': 'Order date',
    'tracking.number': 'Shipping tracking number',
    'product.name': 'Product name',
    'product.price': 'Product price',
    'unsubscribe.link': 'Unsubscribe link'
};

export default function EmailTemplateModal({
                                               isOpen,
                                               onClose,
                                               template
                                           }: EmailTemplateModalProps) {
    const [formData, setFormData] = useState<EmailTemplateRequest>({
        name: '',
        templateKey: '',
        category: EmailCategory.TRANSACTIONAL,
        subject: '',
        preheader: '',
        htmlContent: '',
        textContent: '',
        language: 'en',
        isActive: true,
        isSystemTemplate: false,
        supportedPurposes: [EmailPurpose.ORDER_CONFIRMATION],
        availableVariables: {},
        defaultVariables: {},
        defaultConfigurationId: 0
    });
    const [configurations, setConfigurations] = useState<EmailConfiguration[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('basic');
    const [configurationsLoading, setConfigurationsLoading] = useState(false);

    // Load configurations for dropdown
    useEffect(() => {
        const loadConfigurations = async () => {
            try {
                setConfigurationsLoading(true);
                const response = await EmailService.getConfigurations(0, 100);
                if (response.success && response.data) {
                    setConfigurations(response.data.items || []);
                }
            } catch (err) {
                console.error('Error loading configurations:', err);
            } finally {
                setConfigurationsLoading(false);
            }
        };

        if (isOpen) {
            loadConfigurations();
        }
    }, [isOpen]);

    // Initialize form data
    useEffect(() => {
        if (template) {
            setFormData({
                name: template.name,
                templateKey: template.templateKey,
                category: template.category,
                subject: template.subject,
                preheader: template.preheader || '',
                htmlContent: template.htmlContent,
                textContent: template.textContent || '',
                language: template.language,
                isActive: template.isActive,
                isSystemTemplate: template.isSystemTemplate,
                supportedPurposes: template.supportedPurposes || [EmailPurpose.ORDER_CONFIRMATION],
                availableVariables: template.availableVariables || {},
                defaultVariables: template.defaultVariables || {},
                defaultConfigurationId: template.defaultConfiguration?.id || 0
            });
        } else {
            setFormData({
                name: '',
                templateKey: '',
                category: EmailCategory.TRANSACTIONAL,
                subject: '',
                preheader: '',
                htmlContent: '',
                textContent: '',
                language: 'en',
                isActive: true,
                isSystemTemplate: false,
                supportedPurposes: [EmailPurpose.ORDER_CONFIRMATION],
                availableVariables: {},
                defaultVariables: {},
                defaultConfigurationId: 0
            });
        }
        setError('');
        setActiveTab('basic');
    }, [template, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (template) {
                await EmailService.updateTemplate(template.id, formData);
            } else {
                await EmailService.createTemplate(formData);
            }
            onClose(true);
        } catch (err) {
            console.error('Error saving template:', err);
            setError(err instanceof Error ? err.message : 'Failed to save template');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: checked,
        }));
    };

    const handleSupportedPurposeChange = (purpose: EmailPurpose, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            supportedPurposes: checked
                ? [...prev.supportedPurposes, purpose]
                : prev.supportedPurposes.filter(p => p !== purpose),
        }));
    };

    const handleAvailableVariableChange = (variableKey: string, description: string) => {
        setFormData(prev => ({
            ...prev,
            availableVariables: {
                ...prev.availableVariables,
                [variableKey]: description
            }
        }));
    };

    const removeAvailableVariable = (variableKey: string) => {
        setFormData(prev => ({
            ...prev,
            availableVariables: Object.fromEntries(
                Object.entries(prev.availableVariables).filter(([key]) => key !== variableKey)
            )
        }));
    };

    const addCustomVariable = () => {
        const key = prompt('Enter variable key (e.g., custom.data):');
        if (key) {
            const description = prompt('Enter variable description:') || 'Custom variable';
            handleAvailableVariableChange(key, description);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {template ? 'Edit Template' : 'Create Template'}
                        </h3>
                        <button
                            onClick={() => onClose()}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-red-800 text-sm font-medium">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            {['basic', 'content', 'variables', 'advanced'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                                        activeTab === tab
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {activeTab === 'basic' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Template Name *
                                    </label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        placeholder="e.g., Welcome Email, Password Reset"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="templateKey" className="block text-sm font-medium text-gray-700 mb-1">
                                        Template Key *
                                    </label>
                                    <Input
                                        id="templateKey"
                                        name="templateKey"
                                        type="text"
                                        value={formData.templateKey}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        placeholder="e.g., WELCOME_EMAIL, PASSWORD_RESET"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                        Category *
                                    </label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {EMAIL_CATEGORIES.map(category => (
                                            <option key={category} value={category}>
                                                {getEmailCategoryDisplayName(category)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                                        Language *
                                    </label>
                                    <Input
                                        id="language"
                                        name="language"
                                        type="text"
                                        value={formData.language}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        placeholder="e.g., en, es, fr"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="defaultConfigurationId" className="block text-sm font-medium text-gray-700 mb-1">
                                        Default Configuration
                                    </label>
                                    <select
                                        id="defaultConfigurationId"
                                        name="defaultConfigurationId"
                                        value={formData.defaultConfigurationId}
                                        onChange={handleChange}
                                        disabled={loading || configurationsLoading}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value={0}>Select Configuration</option>
                                        {configurations.map(config => (
                                            <option key={config.id} value={config.id}>
                                                {config.configName} ({config.provider})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                        <input
                                            id="isActive"
                                            name="isActive"
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={handleCheckboxChange}
                                            disabled={loading}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                            Active
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="isSystemTemplate"
                                            name="isSystemTemplate"
                                            type="checkbox"
                                            checked={formData.isSystemTemplate}
                                            onChange={handleCheckboxChange}
                                            disabled={loading}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="isSystemTemplate" className="ml-2 block text-sm text-gray-900">
                                            System Template
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'content' && (
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                        Subject *
                                    </label>
                                    <Input
                                        id="subject"
                                        name="subject"
                                        type="text"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        placeholder="Email subject line"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="preheader" className="block text-sm font-medium text-gray-700 mb-1">
                                        Preheader Text
                                    </label>
                                    <Input
                                        id="preheader"
                                        name="preheader"
                                        type="text"
                                        value={formData.preheader}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder="Preview text shown in email clients"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="htmlContent" className="block text-sm font-medium text-gray-700 mb-1">
                                        HTML Content *
                                    </label>
                                    <textarea
                                        id="htmlContent"
                                        name="htmlContent"
                                        value={formData.htmlContent}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        rows={12}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                        placeholder="HTML content for the email"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Use variables like {'{{user.name}}'} in your template
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="textContent" className="block text-sm font-medium text-gray-700 mb-1">
                                        Plain Text Content
                                    </label>
                                    <textarea
                                        id="textContent"
                                        name="textContent"
                                        value={formData.textContent}
                                        onChange={handleChange}
                                        disabled={loading}
                                        rows={6}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                        placeholder="Plain text fallback content"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'variables' && (
                            <div className="space-y-6">
                                {/* Supported Purposes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Supported Purposes
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {EMAIL_PURPOSES.map((purpose) => (
                                            <div key={purpose} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`purpose-${purpose}`}
                                                    checked={formData.supportedPurposes.includes(purpose)}
                                                    onChange={(e) => handleSupportedPurposeChange(purpose, e.target.checked)}
                                                    disabled={loading}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <label
                                                    htmlFor={`purpose-${purpose}`}
                                                    className="ml-2 block text-sm text-gray-900"
                                                >
                                                    {getEmailPurposeDisplayName(purpose)}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Available Variables */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Available Variables
                                        </label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addCustomVariable}
                                            disabled={loading}
                                        >
                                            Add Custom Variable
                                        </Button>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                                        <div className="grid grid-cols-1 gap-4 p-4">
                                            {Object.entries(AVAILABLE_VARIABLES).map(([key, description]) => (
                                                <div key={key} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                                                {'{{' + key + '}}'}
                                                            </code>
                                                            <span className="text-sm text-gray-900">{description}</span>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        checked={key in formData.availableVariables}
                                                        onChange={(e) =>
                                                            e.target.checked
                                                                ? handleAvailableVariableChange(key, description)
                                                                : removeAvailableVariable(key)
                                                        }
                                                        disabled={loading}
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Custom Variables */}
                                    {Object.keys(formData.availableVariables).filter(key => !(key in AVAILABLE_VARIABLES)).length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Variables</h4>
                                            <div className="space-y-2">
                                                {Object.entries(formData.availableVariables)
                                                    .filter(([key]) => !(key in AVAILABLE_VARIABLES))
                                                    .map(([key, description]) => (
                                                        <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                                            <div>
                                                                <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded mr-2">
                                                                    {'{{' + key + '}}'}
                                                                </code>
                                                                <span className="text-sm text-gray-900">{description}</span>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => removeAvailableVariable(key)}
                                                                disabled={loading}
                                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'advanced' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Template Preview
                                    </label>
                                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                                        <div className="text-sm text-gray-600 space-y-2">
                                            <p><strong>Template Key:</strong> {formData.templateKey || 'Not set'}</p>
                                            <p><strong>Category:</strong> {getEmailCategoryDisplayName(formData.category)}</p>
                                            <p><strong>Supported Purposes:</strong> {formData.supportedPurposes.map(p => getEmailPurposeDisplayName(p)).join(', ') || 'None'}</p>
                                            <p><strong>Available Variables:</strong> {Object.keys(formData.availableVariables).length}</p>
                                            <p><strong>Status:</strong> {formData.isActive ? 'Active' : 'Inactive'}</p>
                                            {formData.isSystemTemplate && (
                                                <p className="text-blue-600 font-medium">This is a system template</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Quick Tips
                                    </label>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <ul className="text-sm text-blue-800 space-y-1">
                                            <li>• Use {'{{variableName}}'} syntax for dynamic content</li>
                                            <li>• Always provide both HTML and plain text content</li>
                                            <li>• Test your templates before marking them as active</li>
                                            <li>• System templates cannot be deleted</li>
                                            <li>• Keep preheader text under 140 characters</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-between pt-6 border-t border-gray-200">
                            <div className="flex space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setActiveTab(activeTab === 'basic' ? 'advanced' : 'basic')}
                                    disabled={loading}
                                >
                                    {activeTab === 'basic' ? 'Skip to Advanced' : 'Back to Basic'}
                                </Button>
                            </div>

                            <div className="flex space-x-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onClose()}
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
                                            Saving...
                                        </div>
                                    ) : (
                                        template ? 'Update Template' : 'Create Template'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}