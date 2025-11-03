// app/lib/api/order-service.ts
import { ApiService } from './api-service';
import { Order, GuestOrderCreateRequest, OrderCreateRequest } from '@/app/lib/types/order';
import {AuthService} from "@/app/lib/api/auth-service";
import {ManualOrderRequest, OrderSearchCriteria} from "@/app/lib/types/admin-order";

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
    static async getAdminOrders(
        criteria: OrderSearchCriteria = {},
        page: number = 0,
        size: number = 10,
        sortBy: string = 'createdAt',
        sortDirection: string = 'desc'
    ) {
        try {
            // Use admin endpoint for admin users, regular endpoint for others
            const isAdmin = await this.checkAdminAccess();
            const endpoint = isAdmin ? `${API_BASE_URL}/admin/orders` : `${API_BASE_URL}/orders/my-orders`;

            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString(),
                sortBy,
                sortDirection
            });

            // Add search criteria for admin
            if (isAdmin) {
                if (criteria.customerId) params.append('customerId', criteria.customerId.toString());
                if (criteria.status) params.append('status', criteria.status);
                if (criteria.paymentStatus) params.append('paymentStatus', criteria.paymentStatus);
                if (criteria.orderNumber) params.append('orderNumber', criteria.orderNumber);
            }

            const response = await ApiService.get(`${endpoint}?${params}`);
            return response;
        } catch (error) {
            return this.handleApiError(error);
        }
    }
    static async getAdminOrderStats() {
        try {
            const response = await ApiService.get(`${API_BASE_URL}/admin/orders/stats`);
            return response;
        } catch (error) {
            return this.handleApiError(error);
        }
    }
    static async updateOrderStatusAdmin(orderId: number, status: string, notes?: string) {
        try {
            const params = new URLSearchParams({ status });
            if (notes) params.append('notes', notes);

            const response = await ApiService.patch(
                `${API_BASE_URL}/admin/orders/${orderId}/status?${params}`
            );
            return response;
        } catch (error) {
            return this.handleApiError(error);
        }
    }

    static async updatePaymentStatus(orderId: number, paymentStatus: string, notes?: string) {
        try {
            const params = new URLSearchParams({ paymentStatus });
            if (notes) params.append('notes', notes);

            const response = await ApiService.patch(
                `${API_BASE_URL}/admin/orders/${orderId}/payment-status?${params}`
            );
            return response;
        } catch (error) {
            return this.handleApiError(error);
        }
    }

    static async processRefund(orderId: number, amount: number, reason: string) {
        try {
            const response = await ApiService.post(
                `${API_BASE_URL}/admin/orders/${orderId}/refund`,
                { amount, reason }
            );
            return response;
        } catch (error) {
            return this.handleApiError(error);
        }
    }
    static async getOrderWithHistory(orderId: number): Promise<{
        success: boolean;
        message: string;
        data: Order | null
    }> {
        try {
            const response = await ApiService.get(`${API_BASE_URL}/admin/orders/${orderId}`);
            return response;
        } catch (error) {
            return this.handleApiError(error);
        }
    }

    static async addOrderNote(orderId: number, note: string): Promise<{
        success: boolean;
        message: string;
        data: Order | null
    }> {
        try {
            const response = await ApiService.post(
                `${API_BASE_URL}/admin/orders/${orderId}/notes?note=${encodeURIComponent(note)}`
            );
            return response;
        } catch (error) {
            return this.handleApiError(error);
        }
    }

    static async reassignOrder(orderId: number, newVendorId: number): Promise<{
        success: boolean;
        message: string;
        data: Order | null
    }> {
        try {
            const response = await ApiService.put(
                `${API_BASE_URL}/admin/orders/${orderId}/reassign?newVendorId=${newVendorId}`
            );
            return response;
        } catch (error) {
            return this.handleApiError(error);
        }
    }
    static async createManualOrder(request: ManualOrderRequest): Promise<{
        success: boolean;
        message: string;
        data: Order | null
    }> {
        try {
            const response = await ApiService.post(`${API_BASE_URL}/admin/orders/manual`, request);
            return response;
        } catch (error) {
            return this.handleApiError(error);
        }
    }
    private static async checkAdminAccess(): Promise<boolean> {
        // Check if user has admin privileges
        const userStr = localStorage.getItem('user');
        if (!userStr) return false;

        const user = JSON.parse(userStr);
        return user?.role?.name === 'ADMIN' || user?.role?.name === 'SUPERADMIN';
    }
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