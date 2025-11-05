// app/dashboard/emails/templates/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { EmailService } from '@/app/lib/api/email-service';
import { EmailTemplate } from '@/app/lib/types/email';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import EmailTemplateModal from '@/app/components/emails/email-template-modal';

export default function EmailTemplatesPage() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const loadTemplates = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await EmailService.getTemplates(0, 100);

            if (response.success && response.data) {
                setTemplates(response.data.items || []);
            } else {
                setError(response.message || 'Failed to load templates');
            }
        } catch (err) {
            console.error('Error loading templates:', err);
            setError(err instanceof Error ? err.message : 'Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    const handleCreateTemplate = () => {
        setSelectedTemplate(null);
        setIsModalOpen(true);
    };

    const handleEditTemplate = (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setIsModalOpen(true);
    };

    const handleDeleteTemplate = async (id: number) => {
        if (confirm('Are you sure you want to delete this template?')) {
            try {
                await EmailService.deleteTemplate(id);
                await loadTemplates();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete template');
            }
        }
    };

    const handleActivateTemplate = async (id: number) => {
        try {
            await EmailService.activateTemplate(id);
            await loadTemplates();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to activate template');
        }
    };

    const handleDeactivateTemplate = async (id: number) => {
        try {
            await EmailService.deactivateTemplate(id);
            await loadTemplates();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to deactivate template');
        }
    };

    const handleModalClose = (refresh: boolean = false) => {
        setIsModalOpen(false);
        setSelectedTemplate(null);
        if (refresh) {
            loadTemplates();
        }
    };

    const filteredTemplates = templates.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.templateKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Email Templates</h2>
                    <p className="text-gray-600">Manage email templates and their content</p>
                </div>
                <Button onClick={handleCreateTemplate} className="bg-indigo-600 hover:bg-indigo-700">
                    Create Template
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
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Templates Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                        <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                                    <p className="text-sm text-gray-500">{template.templateKey}</p>
                                </div>
                                <div className="flex space-x-1">
                                    {template.isSystemTemplate && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      System
                    </span>
                                    )}
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Category:</span>
                                    <span className="text-sm font-medium text-gray-900">{template.category}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Language:</span>
                                    <span className="text-sm font-medium text-gray-900">{template.language}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Version:</span>
                                    <span className="text-sm font-medium text-gray-900">v{template.templateVersion}</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-1">Subject:</p>
                                <p className="text-sm font-medium text-gray-900 line-clamp-2">{template.subject}</p>
                            </div>

                            <div className="flex justify-between space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditTemplate(template)}
                                    className="flex-1"
                                >
                                    Edit
                                </Button>
                                {template.isActive ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeactivateTemplate(template.id)}
                                        className="flex-1 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                                    >
                                        Deactivate
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleActivateTemplate(template.id)}
                                        className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                                    >
                                        Activate
                                    </Button>
                                )}
                                {!template.isSystemTemplate && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteTemplate(template.id)}
                                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No templates</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new email template.</p>
                    <div className="mt-6">
                        <Button onClick={handleCreateTemplate}>
                            Create Template
                        </Button>
                    </div>
                </div>
            )}

            {/* Template Modal */}
            <EmailTemplateModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                template={selectedTemplate}
            />
        </div>
    );
}