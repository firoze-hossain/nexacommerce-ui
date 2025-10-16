// app/lib/api/wishlist-service.ts
import { WishlistItem, WishlistRequest, WishlistResponse, PaginatedWishlistResponse } from '@/app/lib/types/wishlist';
import { ApiService } from './api-service';

const API_BASE_URL = 'http://localhost:8090/api/v1/nexa';

export class WishlistService {
    /**
     * Add product to wishlist
     */
    static async addToWishlist(customerId: number, request: WishlistRequest): Promise<WishlistResponse> {
        try {
            const response = await ApiService.post(
                `${API_BASE_URL}/customers/${customerId}/wishlist`,
                request
            );
            return response;
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            throw error;
        }
    }

    /**
     * Remove product from wishlist
     */
    static async removeFromWishlist(customerId: number, productId: number): Promise<{ success: boolean; message: string }> {
        try {
            await ApiService.delete(
                `${API_BASE_URL}/customers/${customerId}/wishlist/products/${productId}`
            );
            return { success: true, message: 'Product removed from wishlist' };
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            throw error;
        }
    }

    /**
     * Get customer wishlist
     */
    static async getWishlist(
        customerId: number,
        page: number = 0,
        size: number = 12,
        sortBy: string = 'createdAt',
        sortDirection: string = 'desc'
    ): Promise<PaginatedWishlistResponse> {
        try {
            const response = await ApiService.get(
                `${API_BASE_URL}/customers/${customerId}/wishlist?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            throw error;
        }
    }

    /**
     * Check if product is in wishlist
     */
    static async checkProductInWishlist(customerId: number, productId: number): Promise<boolean> {
        try {
            const response = await ApiService.get(
                `${API_BASE_URL}/customers/${customerId}/wishlist/products/${productId}/exists`
            );
            return response.data;
        } catch (error) {
            console.error('Error checking product in wishlist:', error);
            return false;
        }
    }

    /**
     * Get wishlist count
     */
    static async getWishlistCount(customerId: number): Promise<number> {
        try {
            const response = await ApiService.get(
                `${API_BASE_URL}/customers/${customerId}/wishlist/count`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching wishlist count:', error);
            return 0;
        }
    }

    /**
     * Toggle product in wishlist
     */
    static async toggleWishlist(customerId: number, productId: number, notes?: string): Promise<{
        success: boolean;
        message: string;
        isInWishlist: boolean
    }> {
        try {
            const isInWishlist = await this.checkProductInWishlist(customerId, productId);

            if (isInWishlist) {
                await this.removeFromWishlist(customerId, productId);
                return {
                    success: true,
                    message: 'Product removed from wishlist',
                    isInWishlist: false
                };
            } else {
                await this.addToWishlist(customerId, { productId, notes });
                return {
                    success: true,
                    message: 'Product added to wishlist',
                    isInWishlist: true
                };
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            throw error;
        }
    }
}