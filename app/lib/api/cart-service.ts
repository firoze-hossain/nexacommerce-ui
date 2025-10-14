//app/lib/api/cart-service.ts
import { ApiService } from './api-service';
import { CartItemRequest, CartResponse } from '@/app/lib/types/cart';

const API_BASE_URL = 'http://localhost:8090/api/v1/nexa';

export class CartService {
    static async getMyCart(): Promise<{ success: boolean; message: string; data: CartResponse }> {
        const response = await ApiService.get(`${API_BASE_URL}/carts/my-cart`);
        return response;
    }

    static async getGuestCart(sessionId: string): Promise<{ success: boolean; message: string; data: CartResponse }> {
        const response = await ApiService.get(`${API_BASE_URL}/carts/guest/${sessionId}`);
        return response;
    }

    static async addItemToCart(request: CartItemRequest): Promise<{ success: boolean; message: string; data: CartResponse }> {
        const response = await ApiService.post(`${API_BASE_URL}/carts/items`, request);
        return response;
    }

    static async addItemToGuestCart(sessionId: string, request: CartItemRequest): Promise<{ success: boolean; message: string; data: CartResponse }> {
        const response = await ApiService.post(`${API_BASE_URL}/carts/guest/${sessionId}/items`, request);
        return response;
    }

    static async updateCartItem(productId: number, quantity: number): Promise<{ success: boolean; message: string; data: CartResponse }> {
        const response = await ApiService.put(`${API_BASE_URL}/carts/items/${productId}?quantity=${quantity}`);
        return response;
    }

    static async updateGuestCartItem(sessionId: string, productId: number, quantity: number): Promise<{ success: boolean; message: string; data: CartResponse }> {
        const response = await ApiService.put(`${API_BASE_URL}/carts/guest/${sessionId}/items/${productId}?quantity=${quantity}`);
        return response;
    }

    static async removeItemFromCart(productId: number): Promise<{ success: boolean; message: string; data: CartResponse }> {
        const response = await ApiService.delete(`${API_BASE_URL}/carts/items/${productId}`);
        return response;
    }

    static async removeItemFromGuestCart(sessionId: string, productId: number): Promise<{ success: boolean; message: string; data: CartResponse }> {
        const response = await ApiService.delete(`${API_BASE_URL}/carts/guest/${sessionId}/items/${productId}`);
        return response;
    }

    static async clearCart(): Promise<{ success: boolean; message: string }> {
        const response = await ApiService.delete(`${API_BASE_URL}/carts/clear`);
        return response;
    }

    static async clearGuestCart(sessionId: string): Promise<{ success: boolean; message: string }> {
        const response = await ApiService.delete(`${API_BASE_URL}/carts/guest/${sessionId}/clear`);
        return response;
    }
}