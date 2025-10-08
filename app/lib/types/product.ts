// app/lib/types/product.ts
export interface Product {
    id: number;
    vendorId: number;
    vendorName: string;
    categoryId: number;
    categoryName: string;
    brandId: number | null;
    brandName: string | null;
    brandSlug: string | null;
    name: string;
    description: string | null;
    shortDescription: string | null;
    price: number;
    compareAtPrice: number | null;
    stock: number;
    lowStockThreshold: number | null;
    sku: string;
    barcode: string | null;
    trackQuantity: boolean;
    allowBackorder: boolean;
    weight: number | null;
    weightUnit: string | null;
    status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
    featured: boolean;
    published: boolean;
    metaTitle: string | null;
    metaDescription: string | null;
    tags: string | null;
    inStock: boolean;
    lowStock: boolean;
    available: boolean;
    images: ProductImage[];
    attributes: ProductAttribute[];
    createdAt: string;
    updatedAt: string;
}

export interface ProductImage {
    id: number;
    imageUrl: string;
    altText: string | null;
    displayOrder: number | null;
    isPrimary: boolean;
}

export interface ProductAttribute {
    id: number;
    name: string;
    value: string;
    displayType: string | null;
    displayOrder: number | null;
}

export interface ProductCreateRequest {
    categoryId: number;
    brandId?: number;
    name: string;
    description?: string;
    shortDescription?: string;
    price: number;
    compareAtPrice?: number;
    stock: number;
    lowStockThreshold?: number;
    sku: string;
    barcode?: string;
    trackQuantity?: boolean;
    allowBackorder?: boolean;
    weight?: number;
    weightUnit?: string;
    status?: string;
    featured?: boolean;
    published?: boolean;
    metaTitle?: string;
    metaDescription?: string;
    tags?: string;
    images?: ProductImageRequest[];
    attributes?: ProductAttributeRequest[];
}

export interface ProductUpdateRequest {
    categoryId?: number;
    brandId?: number;
    name?: string;
    description?: string;
    shortDescription?: string;
    price?: number;
    compareAtPrice?: number;
    stock?: number;
    lowStockThreshold?: number;
    sku?: string;
    barcode?: string;
    trackQuantity?: boolean;
    allowBackorder?: boolean;
    weight?: number;
    weightUnit?: string;
    status?: string;
    featured?: boolean;
    published?: boolean;
    metaTitle?: string;
    metaDescription?: string;
    tags?: string;
    images?: ProductImageRequest[];
    attributes?: ProductAttributeRequest[];
}

export interface ProductImageRequest {
    imageUrl: string;
    altText?: string | null;
    displayOrder?: number | null;
    isPrimary?: boolean;
}

export interface ProductAttributeRequest {
    name: string;
    value: string;
    displayType?: string | null;
    displayOrder?: number | null;
}

export interface ProductResponse {
    success: boolean;
    message: string;
    data: Product;
    timestamp: string;
    statusCode: number;
}

export interface ProductsResponse {
    success: boolean;
    message: string;
    data: PaginatedProducts;
    timestamp: string;
    statusCode: number;
}

export interface PaginatedProducts {
    items: Product[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}