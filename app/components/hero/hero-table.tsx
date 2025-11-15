// app/components/hero/hero-table.tsx
'use client';

import { HeroContent } from '@/app/lib/types/hero';
import { Button } from '@/app/components/ui/button';
import { formatDate } from '@/app/lib/utils/formatters';

interface HeroTableProps {
    heroContents?: HeroContent[]; // Make optional with ?
    onView: (hero: HeroContent) => void;
    onEdit: (hero: HeroContent) => void;
    onDelete: (id: number) => void;
    onToggleStatus: (id: number) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    pageSize: number;
    loading?: boolean;
}

export default function HeroTable({
                                      heroContents = [], // Provide default empty array
                                      onView,
                                      onEdit,
                                      onDelete,
                                      onToggleStatus,
                                      currentPage,
                                      totalPages,
                                      onPageChange,
                                      totalItems,
                                      pageSize,
                                      loading = false
                                  }: HeroTableProps) {
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

    const getAudienceBadgeColor = (audience: string) => {
        switch (audience) {
            case 'ALL': return 'bg-gray-100 text-gray-800';
            case 'GUEST': return 'bg-orange-100 text-orange-800';
            case 'CUSTOMER': return 'bg-green-100 text-green-800';
            case 'NEW_CUSTOMER': return 'bg-blue-100 text-blue-800';
            case 'RETURNING_CUSTOMER': return 'bg-purple-100 text-purple-800';
            case 'VIP_CUSTOMER': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Use heroContents.length directly since we now have a default value
    if (heroContents.length === 0 && !loading) {
        return (
            <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hero content found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating your first hero banner.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hero Content
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type & Audience
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Analytics
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Schedule
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {heroContents.map((hero) => (
                        <tr key={hero.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-16 w-24">
                                        <img
                                            className="h-16 w-24 rounded-lg object-cover border border-gray-200"
                                            src={hero.backgroundImage}
                                            alt={hero.title}
                                        />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {hero.title}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {hero.subtitle || 'No subtitle'}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            Order: {hero.displayOrder}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="space-y-1">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeBadgeColor(hero.type)}`}>
                                            {hero.type.replace('_', ' ')}
                                        </span>
                                    <div>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getAudienceBadgeColor(hero.targetAudience)}`}>
                                                {hero.targetAudience.replace('_', ' ')}
                                            </span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-gray-500">Impressions:</span>
                                        <span className="font-medium">{hero.impressions}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-gray-500">Clicks:</span>
                                        <span className="font-medium">{hero.clicks}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-gray-500">CTR:</span>
                                        <span className={`font-medium ${
                                            hero.conversionRate >= 5 ? 'text-green-600' :
                                                hero.conversionRate >= 2 ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                                {hero.conversionRate.toFixed(1)}%
                                            </span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="space-y-2">
                                    <button
                                        onClick={() => onToggleStatus(hero.id)}
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            hero.active
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                        }`}
                                    >
                                        {hero.active ? 'Active' : 'Inactive'}
                                    </button>
                                    {hero.currentlyActive && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                Live
                                            </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="space-y-1">
                                    <div>Start: {formatDate(hero.startDate)}</div>
                                    {hero.endDate && (
                                        <div>End: {formatDate(hero.endDate)}</div>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onView(hero)}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(hero)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => onDelete(hero.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(currentPage * pageSize) + 1}</span> to{' '}
                                <span className="font-medium">
                                    {Math.min((currentPage + 1) * pageSize, totalItems)}
                                </span> of{' '}
                                <span className="font-medium">{totalItems}</span> results
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}