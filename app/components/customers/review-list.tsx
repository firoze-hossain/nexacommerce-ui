// app/components/customers/review-list.tsx
'use client';

import { useState } from 'react';
import { ReviewResponse } from '@/app/lib/types/review';
import { ReviewService } from '@/app/lib/api/review-service';
import { useAuth } from '@/app/hooks/useAuth';
import { isCustomer } from '@/app/lib/types/auth';

interface ReviewListProps {
    productId: number;
    reviews: ReviewResponse[];
    onReviewUpdate: () => void;
}

export default function ReviewList({ productId, reviews, onReviewUpdate }: ReviewListProps) {
    const [helpfulLoading, setHelpfulLoading] = useState<number | null>(null);
    const [notHelpfulLoading, setNotHelpfulLoading] = useState<number | null>(null);
    const { isAuthenticated, user } = useAuth();

    const handleHelpfulVote = async (reviewId: number) => {
        if (!isAuthenticated || !isCustomer(user)) {
            // Show login modal or redirect
            return;
        }

        try {
            setHelpfulLoading(reviewId);
            const response = await ReviewService.markReviewHelpful(reviewId);
            if (response.success) {
                onReviewUpdate();
            }
        } catch (error) {
            console.error('Error marking review as helpful:', error);
        } finally {
            setHelpfulLoading(null);
        }
    };

    const handleNotHelpfulVote = async (reviewId: number) => {
        if (!isAuthenticated || !isCustomer(user)) {
            // Show login modal or redirect
            return;
        }

        try {
            setNotHelpfulLoading(reviewId);
            const response = await ReviewService.markReviewNotHelpful(reviewId);
            if (response.success) {
                onReviewUpdate();
            }
        } catch (error) {
            console.error('Error marking review as not helpful:', error);
        } finally {
            setNotHelpfulLoading(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`w-4 h-4 ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                <p className="text-gray-600">Be the first to share your experience with this product!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                {review.customerProfileImage ? (
                                    <img
                                        src={review.customerProfileImage}
                                        alt={review.customerName}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white font-semibold text-sm">
                                        {review.customerName.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">{review.customerName}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                    {renderStars(review.rating)}
                                    <span className="text-sm text-gray-500">
                                        {formatDate(review.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Verified Purchase Badge */}
                        {review.verifiedPurchase && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Verified Purchase
                            </span>
                        )}
                    </div>

                    {/* Review Title */}
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                        {review.title}
                    </h3>

                    {/* Review Comment */}
                    <p className="text-gray-700 leading-relaxed mb-4">
                        {review.comment}
                    </p>

                    {/* Helpful Votes */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => handleHelpfulVote(review.id)}
                                disabled={helpfulLoading === review.id || notHelpfulLoading === review.id}
                                className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                    review.userVotedHelpful
                                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                } disabled:opacity-50`}
                            >
                                {helpfulLoading === review.id ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                    </svg>
                                )}
                                <span>Helpful ({review.helpfulCount})</span>
                            </button>

                            <button
                                onClick={() => handleNotHelpfulVote(review.id)}
                                disabled={helpfulLoading === review.id || notHelpfulLoading === review.id}
                                className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                    review.userVotedNotHelpful
                                        ? 'bg-red-100 text-red-700 border border-red-200'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                } disabled:opacity-50`}
                            >
                                {notHelpfulLoading === review.id ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m-7 0H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                    </svg>
                                )}
                                <span>Not Helpful ({review.notHelpfulCount})</span>
                            </button>
                        </div>

                        {!isAuthenticated && (
                            <div className="text-xs text-gray-500">
                                Sign in to vote
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}