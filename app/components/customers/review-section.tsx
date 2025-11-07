// app/components/customers/review-section.tsx
'use client';

import { useState, useEffect } from 'react';
import { ReviewResponse, ReviewSummaryResponse } from '@/app/lib/types/review';
import { ReviewService } from '@/app/lib/api/review-service';
import { useAuth } from '@/app/hooks/useAuth';
import { isCustomer } from '@/app/lib/types/auth';
import ReviewSummary from './review-summary';
import ReviewList from './review-list';
import ReviewForm from './review-form';

interface ReviewSectionProps {
    productId: number;
    productName: string;
}

export default function ReviewSection({ productId, productName }: ReviewSectionProps) {
    const [reviews, setReviews] = useState<ReviewResponse[]>([]);
    const [summary, setSummary] = useState<ReviewSummaryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const { isAuthenticated, user } = useAuth();

    const pageSize = 10;

    useEffect(() => {
        loadReviewData();
    }, [productId, selectedRating, sortBy, sortDirection, page]);

    const loadReviewData = async () => {
        try {
            setLoading(true);

            // Load review summary
            const summaryResponse = await ReviewService.getProductReviewSummary(productId);
            if (summaryResponse.success) {
                setSummary(summaryResponse.data);
            }

            // Load reviews
            const reviewsResponse = await ReviewService.getProductReviews(
                productId,
                page,
                pageSize,
                sortBy,
                sortDirection,
                selectedRating || undefined
            );

            if (reviewsResponse.success && reviewsResponse.data) {
                if (page === 0) {
                    setReviews(reviewsResponse.data.items);
                } else {
                    setReviews(prev => [...prev, ...reviewsResponse.data.items]);
                }
                setHasMore(reviewsResponse.data.items.length === pageSize);
            }
        } catch (error) {
            console.error('Error loading review data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRatingFilter = (rating: number | null) => {
        setSelectedRating(rating);
        setPage(0);
    };

    const handleSortChange = (newSortBy: string) => {
        if (sortBy === newSortBy) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortDirection('desc');
        }
        setPage(0);
    };

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
    };

    const handleReviewSubmitted = () => {
        setShowReviewForm(false);
        setPage(0);
        loadReviewData();
    };

    // Check if user can write a review
    const canWriteReview = isAuthenticated && isCustomer(user);

    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar - Review Summary */}
                    <div className="lg:col-span-1">
                        {summary && (
                            <ReviewSummary
                                summary={summary}
                                onRatingFilter={handleRatingFilter}
                                selectedRating={selectedRating}
                            />
                        )}
                    </div>

                    {/* Main Content - Reviews */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            {/* Header with Sort Options */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Customer Reviews ({reviews.length})
                                    </h2>
                                    {selectedRating && (
                                        <p className="text-gray-600 text-sm mt-1">
                                            Filtered by {selectedRating}-star reviews
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-4">
                                    {/* Write Review Button */}
                                    {canWriteReview && !showReviewForm && (
                                        <button
                                            onClick={() => setShowReviewForm(true)}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                                        >
                                            Write a Review
                                        </button>
                                    )}

                                    {/* Sort Options */}
                                    <select
                                        value={`${sortBy}-${sortDirection}`}
                                        onChange={(e) => {
                                            const [newSortBy, newSortDirection] = e.target.value.split('-');
                                            setSortBy(newSortBy);
                                            setSortDirection(newSortDirection);
                                        }}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="createdAt-desc">Most Recent</option>
                                        <option value="createdAt-asc">Oldest First</option>
                                        <option value="helpfulCount-desc">Most Helpful</option>
                                        <option value="rating-desc">Highest Rated</option>
                                        <option value="rating-asc">Lowest Rated</option>
                                    </select>
                                </div>
                            </div>

                            {/* Review Form */}
                            {showReviewForm && (
                                <div className="mb-8">
                                    <ReviewForm
                                        productId={productId}
                                        productName={productName}
                                        onReviewSubmitted={handleReviewSubmitted}
                                        onCancel={() => setShowReviewForm(false)}
                                    />
                                </div>
                            )}

                            {/* Reviews List */}
                            {loading && page === 0 ? (
                                <div className="space-y-6">
                                    {[...Array(3)].map((_, index) => (
                                        <div key={index} className="bg-gray-50 rounded-2xl p-6 animate-pulse">
                                            <div className="flex items-center space-x-3 mb-4">
                                                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                                <div>
                                                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                                                </div>
                                            </div>
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <ReviewList
                                        productId={productId}
                                        reviews={reviews}
                                        onReviewUpdate={loadReviewData}
                                    />

                                    {/* Load More Button */}
                                    {hasMore && (
                                        <div className="text-center mt-8">
                                            <button
                                                onClick={handleLoadMore}
                                                disabled={loading}
                                                className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                                            >
                                                {loading ? 'Loading...' : 'Load More Reviews'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}