// app/lib/types/hot-deal.ts
export interface HotDeal {
    id: number;
    product: Product;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    originalPrice: number;
    dealPrice: number;
    startDate: string;
    endDate: string;
    stockLimit?: number;
    soldCount: number;
    remainingStock?: number;
    isActive: boolean;
    isCurrentlyActive: boolean;
    discountPercentage: number;
    createdAt: string;
    updatedAt: string;
}

export interface HotDealCreateRequest {
    productId: number;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    startDate: string;
    endDate: string;
    stockLimit?: number;
}

export interface HotDealUpdateRequest {
    discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue?: number;
    startDate?: string;
    endDate?: string;
    stockLimit?: number;
    isActive?: boolean;
}

export interface HotDealResponse {
    success: boolean;
    message: string;
    data: HotDeal;
    timestamp: string;
    statusCode: number;
}

export interface HotDealsResponse {
    success: boolean;
    message: string;
    data: PaginatedHotDeals;
    timestamp: string;
    statusCode: number;
}

export interface PaginatedHotDeals {
    items: HotDeal[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}

export interface Product {
    id: number;
    name: string;
    sku: string;
    price: number;
    compareAtPrice?: number;
    images?: ProductImage[];
    stock: number;
    status: string;
    published: boolean;
}

export interface ProductImage {
    id: number;
    imageUrl: string;
    altText?: string;
    displayOrder: number;
    isPrimary: boolean;
}