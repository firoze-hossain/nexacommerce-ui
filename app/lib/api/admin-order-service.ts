//app/lib/api/admin-order-service.ts
import { ApiService } from './api-service';
import {
    ManualOrderRequest,
    OrderSearchCriteria,
    RefundRequest,
    OrderStatsResponse,
    AdminOrdersResponse
} from '@/app/lib/types/admin-order';
import { Order } from '@/app/lib/types/order';

const API_BASE_URL = 'http://localhost:8090/api/v1/nexa';

export class AdminOrderService {

    /**
     * Create a manual order as admin
     */
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

    /**
     * Search orders with criteria
     */
    static async searchOrders(
        criteria: OrderSearchCriteria = {},
        page: number = 0,
        size: number = 10,
        sortBy: string = 'createdAt',
        sortDirection: string = 'desc'
    ): Promise<{
        success: boolean;
        message: string;
        data: AdminOrdersResponse | null
    }> {
        try {
            // Build query parameters
            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString(),
                sort: `${sortBy},${sortDirection}`
            });

            // Add search criteria
            if (criteria.customerId) params.append('customerId', criteria.customerId.toString());
            if (criteria.vendorId) params.append('vendorId', criteria.vendorId.toString());
            if (criteria.status) params.append('status', criteria.status);
            if (criteria.paymentStatus) params.append('paymentStatus', criteria.paymentStatus);
            if (criteria.orderNumber) params.append('orderNumber', criteria.orderNumber);
            if (criteria.customerName) params.append('customerName', criteria.customerName);
            if (criteria.customerEmail) params.append('customerEmail', criteria.customerEmail);
            if (criteria.startDate) params.append('startDate', criteria.startDate);
            if (criteria.endDate) params.append('endDate', criteria.endDate);

            const response = await ApiService.get(`${API_BASE_URL}/admin/orders?${params}`);
            return response;
        } catch (error) {
            return this.handleApiError(error);
        }
    }

    /**
     * Get order with full history
     */
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

    /**
     * Get orders by status
     */
    static async getOrdersByStatus(status: string): Promise<{
        success: boolean;
        message: string;
        data: Order[] | null
    }> {
        try {
            const response = await ApiService.get(`${API_BASE_URL}/admin/orders/status/${status}`);
            return response;
        } catch (error) {
            return this.handleApiError(error);
        }
    }

    /**
     * Update order status
     */
    static async updateOrderStatus(
        orderId: number,
        status: string,
        notes?: string
    ): Promise<{
        success: boolean;
        message: string;
        data: Order | null
    }> {
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

    /**
     * Update payment status
     */
    static async updatePaymentStatus(
        orderId: number,
        paymentStatus: string,
        notes?: string
    ): Promise<{
        success: boolean;
        message: string;
        data: Order | null
    }> {
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

    /**
     * Process refund
     */
    static async processRefund(
        orderId: number,
        request: RefundRequest
    ): Promise<{
        success: boolean;
        message: string;
        data: Order | null
    }> {
        try {
            const response = await ApiService.post(
                `${API_BASE_URL}/admin/orders/${orderId}/refund`,
                request
            );
            return response;
        } catch (error) {
            return this.handleApiError(error);
        }
    }

    /**
     * Add order note
     */
    static async addOrderNote(
        orderId: number,
        note: string
    ): Promise<{
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

    /**
     * Reassign order to different vendor
     */
    static async reassignOrder(
        orderId: number,
        newVendorId: number
    ): Promise<{
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

    /**
     * Get order statistics
     */
    static async getOrderStats(): Promise<{
        success: boolean;
        message: string;
        data: OrderStatsResponse | null
    }> {
        try {
            const response = await ApiService.get(`${API_BASE_URL}/admin/orders/stats`);
            return response;
        } catch (error) {
            return this.handleApiError(error);
        }
    }

    /**
     * Handle API errors consistently
     */
    private static handleApiError(error: any) {
        console.error('Admin Order API Error:', error);

        return {
            success: false,
            message: error.message || 'An error occurred while processing your request',
            data: null
        };
    }
}