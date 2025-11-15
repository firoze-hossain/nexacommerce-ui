// app/components/hero/hero-analytics.tsx
'use client';

import { useState, useEffect } from 'react';
import { HeroAnalytics as HeroAnalyticsType } from '@/app/lib/types/hero';
import { HeroService } from '@/app/lib/api/hero-service';

export default function HeroAnalytics() {
    const [analytics, setAnalytics] = useState<HeroAnalyticsType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
    const [sortBy, setSortBy] = useState<'conversionRate' | 'impressions' | 'clicks'>('conversionRate');

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const response = await HeroService.getHeroAnalytics();

            if (response.success && response.data) {
                setAnalytics(Array.isArray(response.data) ? response.data : [response.data]);
            } else {
                setError('Failed to load analytics data');
            }
        } catch (err) {
            console.error('Error loading hero analytics:', err);
            setError('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const getPerformanceBadge = (status: string) => {
        const styles = {
            EXCELLENT: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg',
            GOOD: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg',
            AVERAGE: 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg',
            POOR: 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
        };
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
    };

    const getPerformanceIcon = (status: string) => {
        switch (status) {
            case 'EXCELLENT': return '🚀';
            case 'GOOD': return '👍';
            case 'AVERAGE': return '📊';
            case 'POOR': return '📉';
            default: return '📈';
        }
    };

    const sortedAnalytics = [...analytics].sort((a, b) => {
        switch (sortBy) {
            case 'conversionRate':
                return b.conversionRate - a.conversionRate;
            case 'impressions':
                return b.totalImpressions - a.totalImpressions;
            case 'clicks':
                return b.totalClicks - a.totalClicks;
            default:
                return 0;
        }
    });

    const overallStats = {
        totalImpressions: analytics.reduce((sum, item) => sum + item.totalImpressions, 0),
        totalClicks: analytics.reduce((sum, item) => sum + item.totalClicks, 0),
        avgConversionRate: analytics.length > 0
            ? analytics.reduce((sum, item) => sum + item.conversionRate, 0) / analytics.length
            : 0,
        topPerformer: analytics.length > 0
            ? analytics.reduce((prev, current) =>
                prev.conversionRate > current.conversionRate ? prev : current
            )
            : null
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Hero Content Analytics</h3>
                    <div className="animate-pulse bg-gray-200 rounded-lg h-10 w-32"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-24"></div>
                    ))}
                </div>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-16"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Hero Content Analytics</h3>
                    <p className="text-gray-600 mt-1">Performance metrics and insights for all hero banners</p>
                </div>
                <div className="flex space-x-3 mt-4 lg:mt-0">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as any)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="all">All time</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="conversionRate">Sort by CTR</option>
                        <option value="impressions">Sort by Impressions</option>
                        <option value="clicks">Sort by Clicks</option>
                    </select>
                </div>
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

            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-600 text-sm font-medium">Total Impressions</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {overallStats.totalImpressions.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                            <span className="text-white text-xl">👁️</span>
                        </div>
                    </div>
                    <div className="mt-3 text-sm text-blue-600">
                        Total views across all hero banners
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-600 text-sm font-medium">Total Clicks</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {overallStats.totalClicks.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                            <span className="text-white text-xl">🖱️</span>
                        </div>
                    </div>
                    <div className="mt-3 text-sm text-green-600">
                        Total interactions with hero content
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-600 text-sm font-medium">Avg. Conversion</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {overallStats.avgConversionRate.toFixed(1)}%
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                            <span className="text-white text-xl">📊</span>
                        </div>
                    </div>
                    <div className="mt-3 text-sm text-purple-600">
                        Average click-through rate
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-600 text-sm font-medium">Top Performer</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">
                                {overallStats.topPerformer ? `${overallStats.topPerformer.conversionRate.toFixed(1)}%` : 'N/A'}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                            <span className="text-white text-xl">🏆</span>
                        </div>
                    </div>
                    <div className="mt-3 text-sm text-orange-600">
                        {overallStats.topPerformer ? overallStats.topPerformer.title : 'No data'}
                    </div>
                </div>
            </div>

            {/* Analytics Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hero Content
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Impressions
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Clicks
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Conversion Rate
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Performance
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {sortedAnalytics.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center">
                                <div className="text-gray-400 mb-3">
                                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-lg">No analytics data available</p>
                                <p className="text-gray-400 text-sm mt-1">Analytics will appear once hero content starts receiving traffic</p>
                            </td>
                        </tr>
                    ) : (
                        sortedAnalytics.map((item, index) => (
                            <tr key={item.heroContentId} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center mr-4">
                                                <span className="text-indigo-600 font-bold text-sm">
                                                    {index + 1}
                                                </span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {item.title}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                ID: {item.heroContentId}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {item.totalImpressions.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        views
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {item.totalClicks.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        clicks
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                        <div className={`text-lg font-bold ${
                                            item.conversionRate >= 10
                                                ? 'text-green-600'
                                                : item.conversionRate >= 5
                                                    ? 'text-blue-600'
                                                    : item.conversionRate >= 2
                                                        ? 'text-yellow-600'
                                                        : 'text-red-600'
                                        }`}>
                                            {item.conversionRate.toFixed(1)}%
                                        </div>
                                        {item.conversionRate >= 10 && (
                                            <span className="text-green-500 text-sm">🔥</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        click-through rate
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-lg">{getPerformanceIcon(item.performanceStatus)}</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPerformanceBadge(item.performanceStatus)}`}>
                                                {item.performanceStatus}
                                            </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-3 h-3 rounded-full ${
                                            item.conversionRate >= 5
                                                ? 'bg-green-400 animate-pulse'
                                                : item.conversionRate >= 2
                                                    ? 'bg-yellow-400'
                                                    : 'bg-red-400'
                                        }`}></div>
                                        <span className="text-sm text-gray-600">
                                                {item.conversionRate >= 5 ? 'High' : item.conversionRate >= 2 ? 'Medium' : 'Low'}
                                            </span>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* Performance Insights */}
            {sortedAnalytics.length > 0 && (
                <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Performance Insights
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h5 className="font-medium text-gray-900 mb-2">Top Performers</h5>
                            <ul className="space-y-2 text-sm text-gray-600">
                                {sortedAnalytics.slice(0, 3).map((item, index) => (
                                    <li key={item.heroContentId} className="flex items-center space-x-2">
                                        <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                                            {index + 1}
                                        </span>
                                        <span>{item.title}</span>
                                        <span className="text-green-600 font-medium ml-auto">
                                            {item.conversionRate.toFixed(1)}%
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-medium text-gray-900 mb-2">Recommendations</h5>
                            <ul className="space-y-2 text-sm text-gray-600">
                                {sortedAnalytics.filter(item => item.conversionRate < 2).length > 0 && (
                                    <li className="flex items-start space-x-2">
                                        <span className="text-yellow-500 mt-0.5">⚠️</span>
                                        <span>Consider updating hero content with low conversion rates (&lt;2%)</span>
                                    </li>
                                )}
                                {sortedAnalytics.filter(item => item.conversionRate >= 10).length > 0 && (
                                    <li className="flex items-start space-x-2">
                                        <span className="text-green-500 mt-0.5">💡</span>
                                        <span>High-performing content can be used as inspiration for new banners</span>
                                    </li>
                                )}
                                <li className="flex items-start space-x-2">
                                    <span className="text-blue-500 mt-0.5">📈</span>
                                    <span>Industry average CTR for hero banners is 3-5%</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}