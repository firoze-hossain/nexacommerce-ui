// app/components/customers/review-form.tsx
'use client';

import { useState } from 'react';
import { ReviewService } from '@/app/lib/api/review-service';
import { CreateReviewRequest } from '@/app/lib/types/review';

interface ReviewFormProps {
    productId: number;
    productName: string;
    onReviewSubmitted: () => void;
    onCancel: () => void;
}

export default function ReviewForm({ productId, productName, onReviewSubmitted, onCancel }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        if (!title.trim()) {
            setError('Please add a title for your review');
            return;
        }

        if (!comment.trim()) {
            setError('Please write your review');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const reviewRequest: CreateReviewRequest = {
                productId,
                rating,
                title: title.trim(),
                comment: comment.trim()
            };

            const response = await ReviewService.createReview(reviewRequest);

            if (response.success) {
                onReviewSubmitted();
                // Reset form
                setRating(0);
                setTitle('');
                setComment('');
            } else {
                setError(response.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            setError('Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Write a Review</h3>
            <p className="text-gray-600 mb-6">Share your experience with {productName}</p>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red-700 text-sm">{error}</span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Overall Rating *
                    </label>
                    <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
                            >
                                <svg
                                    className={`w-8 h-8 ${
                                        star <= (hoverRating || rating)
                                            ? 'text-yellow-400'
                                            : 'text-gray-300'
                                    } transition-colors duration-150`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </button>
                        ))}
                        <span className="ml-3 text-sm text-gray-500">
                            {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
                        </span>
                    </div>
                </div>

                {/* Review Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Review Title *
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Summarize your experience in a few words"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        maxLength={100}
                    />
                    <div className="text-xs text-gray-500 mt-1 text-right">
                        {title.length}/100 characters
                    </div>
                </div>

                {/* Review Comment */}
                <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review *
                    </label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share details of your experience with this product..."
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                        maxLength={1000}
                    />
                    <div className="text-xs text-gray-500 mt-1 text-right">
                        {comment.length}/1000 characters
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={submitting}
                        className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Submitting...
                            </div>
                        ) : (
                            'Submit Review'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}