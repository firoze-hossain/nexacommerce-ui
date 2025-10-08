// app/lib/types/brand.ts
export interface Brand {
    id: number;
    name: string;
    slug: string | null;
    description: string | null;
    logoUrl: string | null;
    websiteUrl: string | null;
    featured: boolean;
    active: boolean;
    productCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface BrandCreateRequest {
    name: string;
    slug?: string;
    description?: string;
    logoUrl?: string;
    websiteUrl?: string;
    featured?: boolean;
    active?: boolean;
}

export interface BrandUpdateRequest {
    name?: string;
    slug?: string;
    description?: string;
    logoUrl?: string;
    websiteUrl?: string;
    featured?: boolean;
    active?: boolean;
}

export interface BrandResponse {
    success: boolean;
    message: string;
    data: Brand;
    timestamp: string;
    statusCode: number;
}

export interface BrandsResponse {
    success: boolean;
    message: string;
    data: PaginatedBrands;
    timestamp: string;
    statusCode: number;
}

export interface PaginatedBrands {
    items: Brand[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}

export interface BrandWithProductsResponse {
    id: number;
    name: string;
    slug: string | null;
    description: string | null;
    logoUrl: string | null;
    websiteUrl: string | null;
    featured: boolean;
    active: boolean;
    products: ProductSummary[];
    createdAt: string;
    updatedAt: string;
}

export interface ProductSummary {
    id: number;
    name: string;
    sku: string;
    imageUrl: string | null;
    published: boolean;
}