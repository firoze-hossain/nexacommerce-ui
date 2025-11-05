// app/components/emails/email-configuration-modal.tsx
'use client';

import { useEffect, useState } from 'react';
import { EmailConfiguration, EmailConfigurationRequest } from '@/app/lib/types/email';
import { EmailProvider, EmailPurpose, EMAIL_PROVIDERS, EMAIL_PURPOSES, getEmailProviderDisplayName, getEmailPurposeDisplayName } from '@/app/lib/types/email-enums';
import { EmailService } from '@/app/lib/api/email-service';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

interface EmailConfigurationModalProps {
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
    configuration: EmailConfiguration | null;
}

export default function EmailConfigurationModal({
                                                    isOpen,
                                                    onClose,
                                                    configuration
                                                }: EmailConfigurationModalProps) {
    const [formData, setFormData] = useState<EmailConfigurationRequest>({
        configName: '',
        purpose: EmailPurpose.ORDER_CONFIRMATION,
        fromEmail: '',
        fromName: '',
        provider: EmailProvider.SMTP,
        host: '',
        port: 587,
        username: '',
        password: '',
        useTls: true,
        useSsl: false,
        encryptionType: 'STARTTLS',
        apiKey: '',
        apiSecret: '',
        domain: '',
        region: '',
        isActive: true,
        isDefault: false,
        maxRetries: 3,
        timeoutMs: 30000,
        rateLimitPerHour: 100,
        templateId: '',
        templateData: '',
        customHeaders: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('basic');

    useEffect(() => {
        if (configuration) {
            setFormData({
                configName: configuration.configName,
                purpose: configuration.purpose,
                fromEmail: configuration.fromEmail,
                fromName: configuration.fromName || '',
                provider: configuration.provider,
                host: configuration.host || '',
                port: configuration.port || 587,
                username: configuration.username || '',
                password: '', // Don't fill password for security
                useTls: configuration.useTls || false,
                useSsl: configuration.useSsl || false,
                encryptionType: configuration.encryptionType || 'STARTTLS',
                apiKey: '',
                apiSecret: '',
                domain: configuration.domain || '',
                region: configuration.region || '',
                isActive: configuration.isActive,
                isDefault: configuration.isDefault,
                maxRetries: configuration.maxRetries || 3,
                timeoutMs: configuration.timeoutMs || 30000,
                rateLimitPerHour: configuration.rateLimitPerHour || 100,
                templateId: configuration.templateId || '',
                templateData: '',
                customHeaders: ''
            });
        } else {
            setFormData({
                configName: '',
                purpose: EmailPurpose.ORDER_CONFIRMATION,
                fromEmail: '',
                fromName: '',
                provider: EmailProvider.SMTP,
                host: '',
                port: 587,
                username: '',
                password: '',
                useTls: true,
                useSsl: false,
                encryptionType: 'STARTTLS',
                apiKey: '',
                apiSecret: '',
                domain: '',
                region: '',
                isActive: true,
                isDefault: false,
                maxRetries: 3,
                timeoutMs: 30000,
                rateLimitPerHour: 100,
                templateId: '',
                templateData: '',
                customHeaders: ''
            });
        }
        setError('');
        setActiveTab('basic');
    }, [configuration, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (configuration) {
                await EmailService.updateConfiguration(configuration.id, formData);
            } else {
                await EmailService.createConfiguration(formData);
            }
            onClose(true);
        } catch (err) {
            console.error('Error saving configuration:', err);
            setError(err instanceof Error ? err.message : 'Failed to save configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? Number(value) : value,
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: checked,
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {configuration ? 'Edit Configuration' : 'Create Configuration'}
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
                            {['basic', 'smtp', 'advanced'].map((tab) => (
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
                                    <label htmlFor="configName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Configuration Name *
                                    </label>
                                    <Input
                                        id="configName"
                                        name="configName"
                                        type="text"
                                        value={formData.configName}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        placeholder="e.g., Primary SMTP, SendGrid Marketing"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                                        Purpose *
                                    </label>
                                    <select
                                        id="purpose"
                                        name="purpose"
                                        value={formData.purpose}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {EMAIL_PURPOSES.map(purpose => (
                                            <option key={purpose} value={purpose}>
                                                {getEmailPurposeDisplayName(purpose)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
                                        Provider *
                                    </label>
                                    <select
                                        id="provider"
                                        name="provider"
                                        value={formData.provider}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {EMAIL_PROVIDERS.map(provider => (
                                            <option key={provider} value={provider}>
                                                {getEmailProviderDisplayName(provider)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                        From Email *
                                    </label>
                                    <Input
                                        id="fromEmail"
                                        name="fromEmail"
                                        type="email"
                                        value={formData.fromEmail}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        placeholder="noreply@yourapp.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="fromName" className="block text-sm font-medium text-gray-700 mb-1">
                                        From Name
                                    </label>
                                    <Input
                                        id="fromName"
                                        name="fromName"
                                        type="text"
                                        value={formData.fromName}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder="Your App Name"
                                    />
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
                                            id="isDefault"
                                            name="isDefault"
                                            type="checkbox"
                                            checked={formData.isDefault}
                                            onChange={handleCheckboxChange}
                                            disabled={loading}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                                            Default
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'smtp' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="host" className="block text-sm font-medium text-gray-700 mb-1">
                                        SMTP Host *
                                    </label>
                                    <Input
                                        id="host"
                                        name="host"
                                        type="text"
                                        value={formData.host}
                                        onChange={handleChange}
                                        required={formData.provider === EmailProvider.SMTP}
                                        disabled={loading}
                                        placeholder="smtp.gmail.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="port" className="block text-sm font-medium text-gray-700 mb-1">
                                        Port *
                                    </label>
                                    <Input
                                        id="port"
                                        name="port"
                                        type="number"
                                        value={formData.port}
                                        onChange={handleChange}
                                        required={formData.provider === EmailProvider.SMTP}
                                        disabled={loading}
                                        placeholder="587"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                        Username
                                    </label>
                                    <Input
                                        id="username"
                                        name="username"
                                        type="text"
                                        value={formData.username}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder="your-email@gmail.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                        <input
                                            id="useTls"
                                            name="useTls"
                                            type="checkbox"
                                            checked={formData.useTls}
                                            onChange={handleCheckboxChange}
                                            disabled={loading}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="useTls" className="ml-2 block text-sm text-gray-900">
                                            Use TLS
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="useSsl"
                                            name="useSsl"
                                            type="checkbox"
                                            checked={formData.useSsl}
                                            onChange={handleCheckboxChange}
                                            disabled={loading}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="useSsl" className="ml-2 block text-sm text-gray-900">
                                            Use SSL
                                        </label>
                                    </div>
                                </div>

                                {formData.provider !== EmailProvider.SMTP && (
                                    <>
                                        <div>
                                            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                                                API Key
                                            </label>
                                            <Input
                                                id="apiKey"
                                                name="apiKey"
                                                type="password"
                                                value={formData.apiKey}
                                                onChange={handleChange}
                                                disabled={loading}
                                                placeholder="Your API Key"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="apiSecret" className="block text-sm font-medium text-gray-700 mb-1">
                                                API Secret
                                            </label>
                                            <Input
                                                id="apiSecret"
                                                name="apiSecret"
                                                type="password"
                                                value={formData.apiSecret}
                                                onChange={handleChange}
                                                disabled={loading}
                                                placeholder="Your API Secret"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'advanced' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="maxRetries" className="block text-sm font-medium text-gray-700 mb-1">
                                        Max Retries
                                    </label>
                                    <Input
                                        id="maxRetries"
                                        name="maxRetries"
                                        type="number"
                                        value={formData.maxRetries}
                                        onChange={handleChange}
                                        disabled={loading}
                                        min="0"
                                        max="10"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="timeoutMs" className="block text-sm font-medium text-gray-700 mb-1">
                                        Timeout (ms)
                                    </label>
                                    <Input
                                        id="timeoutMs"
                                        name="timeoutMs"
                                        type="number"
                                        value={formData.timeoutMs}
                                        onChange={handleChange}
                                        disabled={loading}
                                        min="1000"
                                        max="60000"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="rateLimitPerHour" className="block text-sm font-medium text-gray-700 mb-1">
                                        Rate Limit (per hour)
                                    </label>
                                    <Input
                                        id="rateLimitPerHour"
                                        name="rateLimitPerHour"
                                        type="number"
                                        value={formData.rateLimitPerHour}
                                        onChange={handleChange}
                                        disabled={loading}
                                        min="1"
                                        max="10000"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 mb-1">
                                        Template ID
                                    </label>
                                    <Input
                                        id="templateId"
                                        name="templateId"
                                        type="text"
                                        value={formData.templateId}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder="Template ID for provider"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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
                                    configuration ? 'Update Configuration' : 'Create Configuration'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}