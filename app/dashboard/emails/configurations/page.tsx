// app/dashboard/emails/configurations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { EmailService } from '@/app/lib/api/email-service';
import { EmailConfiguration } from '@/app/lib/types/email';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import EmailConfigurationModal from '@/app/components/emails/email-configuration-modal';

export default function EmailConfigurationsPage() {
    const [configurations, setConfigurations] = useState<EmailConfiguration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState<EmailConfiguration | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const loadConfigurations = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await EmailService.getConfigurations(0, 100);

            if (response.success && response.data) {
                setConfigurations(response.data.items || []);
            } else {
                setError(response.message || 'Failed to load configurations');
            }
        } catch (err) {
            console.error('Error loading configurations:', err);
            setError(err instanceof Error ? err.message : 'Failed to load configurations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConfigurations();
    }, []);

    const handleCreateConfig = () => {
        setSelectedConfig(null);
        setIsModalOpen(true);
    };

    const handleEditConfig = (config: EmailConfiguration) => {
        setSelectedConfig(config);
        setIsModalOpen(true);
    };

    const handleDeleteConfig = async (id: number) => {
        if (confirm('Are you sure you want to delete this configuration?')) {
            try {
                await EmailService.deleteConfiguration(id);
                await loadConfigurations();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete configuration');
            }
        }
    };

    const handleActivateConfig = async (id: number) => {
        try {
            await EmailService.activateConfiguration(id);
            await loadConfigurations();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to activate configuration');
        }
    };

    const handleSetDefault = async (id: number) => {
        try {
            await EmailService.setAsDefault(id);
            await loadConfigurations();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to set as default');
        }
    };

    const handleModalClose = (refresh: boolean = false) => {
        setIsModalOpen(false);
        setSelectedConfig(null);
        if (refresh) {
            loadConfigurations();
        }
    };

    const filteredConfigurations = configurations.filter(config =>
        config.configName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.purpose.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Email Configurations</h2>
                    <p className="text-gray-600">Manage email provider configurations and settings</p>
                </div>
                <Button onClick={handleCreateConfig} className="bg-indigo-600 hover:bg-indigo-700">
                    Add Configuration
                </Button>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red-800 text-sm font-medium">{error}</span>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="w-full sm:w-64">
                    <Input
                        type="text"
                        placeholder="Search configurations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Configurations Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredConfigurations.map((config) => (
                        <div key={config.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{config.configName}</h3>
                                    <p className="text-sm text-gray-500">{config.purpose}</p>
                                </div>
                                <div className="flex space-x-1">
                                    {config.isDefault && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Default
                    </span>
                                    )}
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        config.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                    {config.isActive ? 'Active' : 'Inactive'}
                  </span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Provider:</span>
                                    <span className="text-sm font-medium text-gray-900">{config.provider}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">From Email:</span>
                                    <span className="text-sm font-medium text-gray-900">{config.fromEmail}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Host:</span>
                                    <span className="text-sm font-medium text-gray-900">{config.host}:{config.port}</span>
                                </div>
                            </div>

                            <div className="flex justify-between space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditConfig(config)}
                                    className="flex-1"
                                >
                                    Edit
                                </Button>
                                {!config.isActive && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleActivateConfig(config.id)}
                                        className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                                    >
                                        Activate
                                    </Button>
                                )}
                                {!config.isDefault && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSetDefault(config.id)}
                                        className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                                    >
                                        Set Default
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteConfig(config.id)}
                                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredConfigurations.length === 0 && (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No configurations</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new email configuration.</p>
                    <div className="mt-6">
                        <Button onClick={handleCreateConfig}>
                            Add Configuration
                        </Button>
                    </div>
                </div>
            )}

            {/* Configuration Modal */}
            <EmailConfigurationModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                configuration={selectedConfig}
            />
        </div>
    );
}