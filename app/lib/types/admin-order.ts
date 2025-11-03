//app/lib/types/admin-order.ts
import {Order} from "@/app/lib/types/order";

export interface ManualOrderRequest {
    customerId: number;
    shippingAddressId: number;
    billingAddressId?: number;
    useShippingAsBilling?: boolean;
    customerNotes?: string;
    internalNotes?: string;
    shippingAmount?: number;
    taxAmount?: number;
    discountAmount?: number;
    couponCode?: string;
    source?: 'WEBSTORE' | 'PHONE' | 'ADMIN_PANEL' | 'POS' | 'MARKETPLACE' | 'API';
    items: OrderItemRequest[];
}

export interface OrderItemRequest {
    productId: number;
    quantity: number;
}

export interface OrderSearchCriteria {
    customerId?: number;
    vendorId?: number;
    status?: string;
    paymentStatus?: string;
    orderNumber?: string;
    customerName?: string;
    customerEmail?: string;
    startDate?: string;
    endDate?: string;
}

export interface RefundRequest {
    amount: number;
    reason: string;
}

export interface OrderStatsResponse {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    monthlyRevenue: number;
    ordersByStatus: Record<string, number>;
    revenueByMonth: Record<string, number>;
}

export interface AdminOrdersResponse {
    items: Order[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}