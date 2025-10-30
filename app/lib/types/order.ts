// app/lib/types/order.ts
import {Address, GuestAddressRequest} from "@/app/lib/types/address";

export interface Order {
    id: number;
    orderNumber: string;
    customerId: number;
    customerName: string;
    customerEmail: string;
    vendorId: number;
    vendorName: string;
    source: string;
    totalAmount: number;
    shippingAmount: number;
    taxAmount: number;
    discountAmount: number;
    couponDiscount: number;
    finalAmount: number;
    status: string;
    paymentStatus: string;
    shippingAddress: Address;
    billingAddress: Address;
    customerNotes: string;
    internalNotes: string;
    couponCode: string;
    items: OrderItem[];
    history: OrderHistory[];
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    productSku: string;
    productImage: string;
    quantity: number;
    price: number;
    compareAtPrice: number;
    subtotal: number;
    discountAmount: number;
}

export interface OrderHistory {
    id: number;
    action: string;
    description: string;
    oldValue: string;
    newValue: string;
    notes: string;
    performedByUserId: number;
    performedByName: string;
    createdAt: string;
}

export interface OrderCreateRequest {
    shippingAddressId: number;
    billingAddressId?: number;
    useShippingAsBilling?: boolean;
    customerNotes?: string;
    shippingAmount?: number;
    taxAmount?: number;
    discountAmount?: number;
    couponCode?: string;
    items: OrderItemRequest[];
}

export interface GuestOrderCreateRequest {
    guestEmail: string;
    guestName: string;
    //guestPhone: string; // ADDED THIS FIELD
    shippingAddress: GuestAddressRequest;
    billingAddress?: GuestAddressRequest;
    useShippingAsBilling?: boolean;
    customerNotes?: string;
    shippingAmount?: number;
    taxAmount?: number;
    discountAmount?: number;
    couponCode?: string;
    items: OrderItemRequest[];
    sessionId?: string;
}

export interface OrderItemRequest {
    productId: number;
    quantity: number;
}