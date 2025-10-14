//app/lib/types/cart.ts
export interface CartItemRequest {
    productId: number;
    quantity: number;
}

export interface CartItemResponse {
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
    availableStock: number;
    inStock: boolean;
    lowStock: boolean;
}

export interface CartResponse {
    id: number;
    customerId: number | null;
    userId: number | null;
    sessionId: string;
    cartType: string;
    cartName: string;
    isActive: boolean;
    isSaved: boolean;
    items: CartItemResponse[];
    totalItems: number;
    totalUniqueItems: number;
    totalAmount: number;
    totalDiscount: number;
    createdAt: string;
    updatedAt: string;
}