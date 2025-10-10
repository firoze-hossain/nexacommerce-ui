// app/lib/types/category.ts
export interface Category {
    id: number;
    name: string;
    description: string | null;
    slug: string | null;
    imageUrl: string | null;
    displayOrder: number | null;
    featured: boolean;
    active: boolean;
    parentId: number | null;
    parentName: string | null;
    productCount: number | null;
    childrenCount: number;
    children: Category[];
    createdAt: string;
    updatedAt: string;
}

export interface CategoryCreateRequest {
    name: string;
    description?: string;
    slug?: string;
    imageUrl?: string;
    parentId?: number;
    displayOrder?: number;
    featured?: boolean;
    active?: boolean;
}

export interface CategoryUpdateRequest {
    name?: string;
    description?: string;
    slug?: string;
    imageUrl?: string;
    parentId?: number;
    displayOrder?: number;
    featured?: boolean;
    active?: boolean;
}

export interface CategoryResponse {
    success: boolean;
    message: string;
    data: Category;
    timestamp: string;
    statusCode: number;
}

export interface CategoriesResponse {
    success: boolean;
    message: string;
    data: PaginatedCategories;
    timestamp: string;
    statusCode: number;
}

export interface PaginatedCategories {
    items: Category[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}

export interface CategoryTreeResponse {
    id: number;
    name: string;
    slug: string | null;
    imageUrl: string | null;
    productCount: number;
    children: CategoryTreeResponse[];
}