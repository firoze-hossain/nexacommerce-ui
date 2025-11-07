// app/components/customers/review-summary.tsx
'use client';

import { ReviewSummaryResponse } from '@/app/lib/types/review';

interface ReviewSummaryProps {
    summary: ReviewSummaryResponse;
    onRatingFilter?: (rating: number | null) => void;
    selectedRating?: number | null;
}

export default function ReviewSummary({ summary, onRatingFilter, selectedRating }: ReviewSummaryProps) {
    const totalRatings = summary.totalRatings || 0;
    const averageRating = summary.averageRating || 0;
    const distribution = summary.distribution;

    const getPercentage = (count: number) => {
        return totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
    };

    const renderRatingBar = (rating: number, count: number) => {
        const percentage = getPercentage(count);
        const isSelected = selectedRating === rating;

        return (
            <button
                key={rating}
                onClick={() => onRatingFilter?.(isSelected ? null : rating)}
                className={`flex items-center space-x-3 w-full p-2 rounded-lg transition-colors ${
                    isSelected ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'
                }`}
            >
                <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm font-medium text-gray-900 w-4">{rating}</span>
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </div>

                <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>

                <div className="text-right w-16">
                    <span className="text-sm text-gray-600">{count}</span>
                    <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                </div>
            </button>
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Customer Reviews</h3>

            {/* Overall Rating */}
            <div className="flex items-center space-x-6 mb-6">
                <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                    <div className="flex items-center justify-center space-x-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                                key={star}
                                className={`w-5 h-5 ${
                                    star <= Math.round(averageRating)
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                        {totalRatings} {totalRatings === 1 ? 'review' : 'reviews'}
                    </div>
                </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-3">
                {distribution && [
                    { rating: 5, count: distribution.fiveStar },
                    { rating: 4, count: distribution.fourStar },
                    { rating: 3, count: distribution.threeStar },
                    { rating: 2, count: distribution.twoStar },
                    { rating: 1, count: distribution.oneStar },
                ].map(({ rating, count }) => renderRatingBar(rating, count))}
            </div>

            {/* Filter Info */}
            {selectedRating && (
                <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-indigo-700">
                            Showing {selectedRating}-star reviews only
                        </span>
                        <button
                            onClick={() => onRatingFilter?.(null)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                            Clear filter
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}