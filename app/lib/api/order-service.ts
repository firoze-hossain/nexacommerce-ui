// app/lib/api/order-service.ts
import { ApiService } from './api-service';
import { Order, GuestOrderCreateRequest, OrderCreateRequest } from '@/app/lib/types/order';
import {AuthService} from "@/app/lib/api/auth-service";

const API_BASE_URL = 'http://localhost:8090/api/v1/nexa';

export class OrderService {
    static async createOrder(request: OrderCreateRequest): Promise<{ success: boolean; message: string; data: Order }> {
        const response = await ApiService.post(`${API_BASE_URL}/orders`, request);
        return response;
    }

    // static async getMyOrders(
    //     page: number = 0,
    //     size: number = 10,
    //     sortBy: string = 'createdAt',
    //     sortDirection: string = 'desc'
    // ): Promise<{ success: boolean; message: string; data: any }> {
    //     const response = await ApiService.get(
    //         `${API_BASE_URL}/orders/my-orders?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
    //     );
    //     return response;
    // }

    static async getMyOrders(
        page: number = 0,
        size: number = 10,
        sortBy: string = 'createdAt',
        sortDirection: string = 'desc'
    ) {
        try {
            const response = await ApiService.get(
                `${API_BASE_URL}/orders/my-orders?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
            );
            return response;
        } catch (error) {
            return this.handleApiError(error);
        }
    }

    // static async getOrderById(orderId: number): Promise<{ success: boolean; message: string; data: Order }> {
    //     const response = await ApiService.get(`${API_BASE_URL}/orders/${orderId}`);
    //     return response;
    // }
    static async getOrderById(orderId: number) {
        try {
            const response = await ApiService.get(`${API_BASE_URL}/orders/${orderId}`);
            return response;
        } catch (error) {
            return this.handleApiError(error);
        }
    }

    static async getOrderByNumber(orderNumber: string): Promise<{ success: boolean; message: string; data: Order }> {
        const response = await ApiService.get(`${API_BASE_URL}/orders/number/${orderNumber}`);
        return response;
    }

    static async getRecentOrders(limit: number = 5): Promise<{ success: boolean; message: string; data: Order[] }> {
        const response = await ApiService.get(`${API_BASE_URL}/orders/recent?limit=${limit}`);
        return response;
    }

    static async cancelOrder(orderId: number): Promise<{ success: boolean; message: string; data: Order }> {
        const response = await ApiService.post(`${API_BASE_URL}/orders/${orderId}/cancel`);
        return response;
    }

    static async updateOrderStatus(orderId: number, status: string): Promise<{ success: boolean; message: string; data: Order }> {
        const response = await ApiService.patch(`${API_BASE_URL}/orders/${orderId}/status?status=${status}`);
        return response;
    }

    static async createGuestOrder(request: GuestOrderCreateRequest): Promise<{ success: boolean; message: string; data: Order }> {
        const response = await ApiService.post(`${API_BASE_URL}/orders/guest`, request);
        return response;
    }

    static async getGuestOrder(orderNumber: string, email: string): Promise<{ success: boolean; message: string; data: Order }> {
        const response = await ApiService.get(`${API_BASE_URL}/orders/guest/${orderNumber}?email=${encodeURIComponent(email)}`);
        return response;
    }

    static async handleApiError(error: any) {
        console.error('API Error:', error);

        if (error.message?.includes('Authentication failed') || error.message?.includes('401')) {
            AuthService.clearTokens();
            window.location.href = '/login';
            return {
                success: false,
                message: 'Authentication failed. Please login again.',
                data: null
            };
        }

        return {
            success: false,
            message: error.message || 'An error occurred',
            data: null
        };
    }

}