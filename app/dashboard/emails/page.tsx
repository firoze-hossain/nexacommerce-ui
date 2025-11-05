// app/dashboard/emails/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { EmailService } from '@/app/lib/api/email-service';
import { EmailAnalytics, EmailLog, EmailConfiguration, EmailTemplate } from '@/app/lib/types/email';
import { getEmailStatusDisplayName, getEmailProviderDisplayName, getEmailCategoryDisplayName } from '@/app/lib/types/email-enums';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { formatDate } from '@/app/lib/utils/formatters';

export default function EmailDashboardPage() {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null);
    const [recentLogs, setRecentLogs] = useState<EmailLog[]>([]);
    const [configurations, setConfigurations] = useState<EmailConfiguration[]>([]);
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError('');

            // Load analytics
            const analyticsResponse = await EmailService.getAnalytics();
            if (analyticsResponse.success) {
                setAnalytics(analyticsResponse.data);
            }

            // Load recent logs
            const logsResponse = await EmailService.getEmailLogs(0, 5);
            if (logsResponse.success && logsResponse.data) {
                setRecentLogs(logsResponse.data.items || []);
            }

            // Load configurations
            const configsResponse = await EmailService.getConfigurations(0, 5);
            if (configsResponse.success && configsResponse.data) {
                setConfigurations(configsResponse.data.items || []);
            }

            // Load templates
            const templatesResponse = await EmailService.getTemplates(0, 5);
            console.log(templatesResponse.data);
            if (templatesResponse.success && templatesResponse.data) {
                setTemplates(templatesResponse.data.items || []);
            }

        } catch (err) {
            console.error('Error loading email dashboard:', err);
            setError(err instanceof Error ? err.message : 'Failed to load email dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Email Management</h2>
                    <p className="text-gray-600">Manage email configurations, templates, and track performance</p>
                </div>
                <div className="flex space-x-3">
                    <Button asChild>
                        <Link href="/dashboard/emails/send">Send Email</Link>
                    </Button>
                </div>
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

            {/* Analytics Cards */}
            {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Emails</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics.totalEmails}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics.deliveryRate?.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics.openRate?.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Click Rate</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics.clickRate?.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Email Logs */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Email Activity</h3>
                        <Button variant="outline">
                            <Link href="/dashboard/emails/logs">View All</Link>
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {recentLogs.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No recent email activity
                            </div>
                        ) : (
                            recentLogs.map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${
                                            log.status === 'SENT' ? 'bg-green-500' :
                                                log.status === 'FAILED' ? 'bg-red-500' :
                                                    log.status === 'DELIVERED' ? 'bg-blue-500' :
                                                        'bg-yellow-500'
                                        }`}></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{log.recipientEmail}</p>
                                            <p className="text-xs text-gray-500">{log.subject}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-900">{getEmailStatusDisplayName(log.status)}</p>
                                        <p className="text-xs text-gray-500">{formatDate(log.createdAt)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-6">
                    {/* Configurations */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Configurations</h3>
                            <Button variant="outline">
                                <Link href="/dashboard/emails/configurations">Manage</Link>
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {configurations.slice(0, 3).map((config) => (
                                <div key={config.id} className="flex items-center justify-between p-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{config.configName}</p>
                                        <p className="text-xs text-gray-500">{getEmailProviderDisplayName(config.provider)}</p>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs ${
                                        config.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {config.isActive ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Templates */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Templates</h3>
                            <Button variant="outline">
                                <Link href="/dashboard/emails/templates">Manage</Link>
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {templates.slice(0, 3).map((template) => (
                                <div key={template.id} className="flex items-center justify-between p-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{template.name}</p>
                                        <p className="text-xs text-gray-500">{getEmailCategoryDisplayName(template.category)}</p>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs ${
                                        template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {template.isActive ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                    <Link href="/dashboard/emails/configurations" className="block">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Configurations</h3>
                                <p className="text-sm text-gray-500">Manage email providers</p>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                    <Link href="/dashboard/emails/templates" className="block">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Templates</h3>
                                <p className="text-sm text-gray-500">Email templates</p>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                    <Link href="/dashboard/emails/logs" className="block">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Email Logs</h3>
                                <p className="text-sm text-gray-500">View sent emails</p>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                    <Link href="/dashboard/emails/analytics" className="block">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                                <p className="text-sm text-gray-500">Performance metrics</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}