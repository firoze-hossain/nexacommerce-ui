// app/lib/types/wishlist.ts
export interface WishlistItem {
    id: number;
    productId: number;
    productName: string;
    productPrice: number;
    productImage: string;
    productSlug?: string;
    notes: string;
    addedAt: string;
    product?: {
        id: number;
        name: string;
        price: number;
        compareAtPrice?: number;
        images: Array<{ imageUrl: string }>;
        inStock: boolean;
        slug?: string;
    };
}

export interface WishlistResponse {
    success: boolean;
    message: string;
    data: WishlistItem;
    timestamp: string;
    statusCode: number;
}

export interface PaginatedWishlistResponse {
    success: boolean;
    message: string;
    data: {
        items: WishlistItem[];
        totalItems: number;
        currentPage: number;
        pageSize: number;
        totalPages: number;
    };
    timestamp: string;
    statusCode: number;
}

export interface WishlistRequest {
    productId: number;
    notes?: string;
}