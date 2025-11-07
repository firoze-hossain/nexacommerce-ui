// app/lib/api/review-service.ts
import { CreateReviewRequest, ReviewResponse, ReviewSummaryResponse, PaginatedReviews } from '@/app/lib/types/review';
import { ApiService } from './api-service';

const API_BASE_URL = 'http://localhost:8090/api/v1/nexa';

export class ReviewService {
    /**
     * Create a new review
     */
    static async createReview(reviewData: CreateReviewRequest): Promise<{ success: boolean; message: string; data: ReviewResponse }> {
        const response = await ApiService.post(`${API_BASE_URL}/reviews`, reviewData);
        return response;
    }

    /**
     * Update a review
     */
    static async updateReview(reviewId: number, reviewData: any): Promise<{ success: boolean; message: string; data: ReviewResponse }> {
        const response = await ApiService.put(`${API_BASE_URL}/reviews/${reviewId}`, reviewData);
        return response;
    }

    /**
     * Delete a review
     */
    static async deleteReview(reviewId: number): Promise<{ success: boolean; message: string }> {
        await ApiService.delete(`${API_BASE_URL}/reviews/${reviewId}`);
        return { success: true, message: 'Review deleted successfully' };
    }

    /**
     * Get product reviews
     */
    static async getProductReviews(
        productId: number,
        page: number = 0,
        size: number = 10,
        sortBy: string = 'createdAt',
        sortDirection: string = 'desc',
        rating?: number
    ): Promise<{ success: boolean; message: string; data: PaginatedReviews }> {
        let url = `${API_BASE_URL}/reviews/product/${productId}?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`;

        if (rating) {
            url += `&rating=${rating}`;
        }

        const response = await ApiService.get(url);
        return response;
    }

    /**
     * Get product review summary
     */
    static async getProductReviewSummary(productId: number): Promise<{ success: boolean; message: string; data: ReviewSummaryResponse }> {
        const response = await ApiService.get(`${API_BASE_URL}/reviews/product/${productId}/summary`);
        return response;
    }

    /**
     * Mark review as helpful
     */
    static async markReviewHelpful(reviewId: number): Promise<{ success: boolean; message: string }> {
        const response = await ApiService.post(`${API_BASE_URL}/reviews/${reviewId}/helpful`);
        return response;
    }

    /**
     * Mark review as not helpful
     */
    static async markReviewNotHelpful(reviewId: number): Promise<{ success: boolean; message: string }> {
        const response = await ApiService.post(`${API_BASE_URL}/reviews/${reviewId}/not-helpful`);
        return response;
    }

    /**
     * Get customer's reviews
     */
    static async getCustomerReviews(
        customerId: number,
        page: number = 0,
        size: number = 10
    ): Promise<{ success: boolean; message: string; data: PaginatedReviews }> {
        const response = await ApiService.get(
            `${API_BASE_URL}/reviews/customer/${customerId}?page=${page}&size=${size}`
        );
        return response;
    }
}