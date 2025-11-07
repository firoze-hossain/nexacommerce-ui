// app/lib/api/search-service.ts
import {ApiService} from './api-service';

const API_BASE_URL = 'http://localhost:8090/api/v1/nexa';

export interface SearchResult {
    products: ProductSearchResult[];
    categories: CategorySearchResult[];
    brands: BrandSearchResult[];
    availableFilters?: AvailableFilters | null;
    totalResults: number;
    searchTime: number;
}
// Add these new interfaces for available filters
export interface AvailableFilters {
    categories?: CategoryFilter[];
    brands?: BrandFilter[];
    priceRange?: PriceRange;
    inStock?: boolean;
    featured?: boolean;
}
export interface CategoryFilter {
    id: number;
    name: string;
    productCount: number;
}

export interface BrandFilter {
    id: number;
    name: string;
    productCount: number;
}

export interface PriceRange {
    min: number;
    max: number;
}
export interface ProductSearchResult {
    id: number;
    name: string;
    sku: string;
    description: string;
    shortDescription: string;
    price: number;
    compareAtPrice: number;
    imageUrl: string;
    categoryName: string;
    brandName: string;
    vendorName: string;
    inStock: boolean;
    lowStock?: boolean;
    featured?: boolean;
    slug: string;
    type: 'PRODUCT';
}

export interface CategorySearchResult {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    slug: string;
    productCount: number;
    type: 'CATEGORY';
}

export interface BrandSearchResult {
    id: number;
    name: string;
    description: string;
    logoUrl: string;
    slug: string;
    productCount: number;
    type: 'BRAND';
}

export interface SearchFilters {
    categories?: number[];
    brands?: number[];
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean | null;
    featured?: boolean | null;
    sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'name' | 'newest';
}

export interface SearchRequest {
    query: string;
    page?: number;
    size?: number;
    filters?: SearchFilters;
}

export interface AutocompleteResult {
    products: ProductSearchResult[];
    categories: CategorySearchResult[];
    brands: BrandSearchResult[];
    popularSearches: string[];
}

export class SearchService {
    // static async searchProducts(request: SearchRequest): Promise<{
    //     success: boolean;
    //     message: string;
    //     data: SearchResult
    // }> {
    //     const params = new URLSearchParams({
    //         q: request.query,
    //         page: (request.page || 0).toString(),
    //         size: (request.size || 12).toString()
    //     });
    //
    //     // Add filters
    //     if (request.filters) {
    //         if (request.filters.categories?.length) {
    //             params.append('categories', request.filters.categories.join(','));
    //         }
    //         if (request.filters.brands?.length) {
    //             params.append('brands', request.filters.brands.join(','));
    //         }
    //         if (request.filters.minPrice !== undefined) {
    //             params.append('minPrice', request.filters.minPrice.toString());
    //         }
    //         if (request.filters.maxPrice !== undefined) {
    //             params.append('maxPrice', request.filters.maxPrice.toString());
    //         }
    //         if (request.filters.inStock !== undefined) {
    //             params.append('inStock', request.filters.inStock.toString());
    //         }
    //         if (request.filters.featured !== undefined) {
    //             params.append('featured', request.filters.featured.toString());
    //         }
    //         if (request.filters.sortBy) {
    //             params.append('sortBy', request.filters.sortBy);
    //         }
    //     }
    //
    //     const response = await ApiService.get(`${API_BASE_URL}/search?${params}`);
    //     return response;
    // }
    static async searchProducts(request: SearchRequest): Promise<{
        success: boolean;
        message: string;
        data: SearchResult
    }> {
        const params = new URLSearchParams({
            q: request.query,
            page: (request.page || 0).toString(),
            size: (request.size || 12).toString()
        });

        // Add filters - FIXED: Check for null/undefined properly
        if (request.filters) {
            if (request.filters.categories?.length) {
                params.append('categories', request.filters.categories.join(','));
            }
            if (request.filters.brands?.length) {
                params.append('brands', request.filters.brands.join(','));
            }
            if (request.filters.minPrice !== undefined && request.filters.minPrice !== null) {
                params.append('minPrice', request.filters.minPrice.toString());
            }
            if (request.filters.maxPrice !== undefined && request.filters.maxPrice !== null) {
                params.append('maxPrice', request.filters.maxPrice.toString());
            }
            // FIX: Check for both undefined and null, and use String() instead of toString()
            if (request.filters.inStock !== undefined && request.filters.inStock !== null) {
                params.append('inStock', String(request.filters.inStock));
            }
            if (request.filters.featured !== undefined && request.filters.featured !== null) {
                params.append('featured', String(request.filters.featured));
            }
            if (request.filters.sortBy) {
                params.append('sortBy', request.filters.sortBy);
            }
        }

        const response = await ApiService.get(`${API_BASE_URL}/search?${params}`);
        return response;
    }
    static async autocomplete(query: string, limit: number = 5): Promise<{
        success: boolean;
        message: string;
        data: AutocompleteResult
    }> {
        const params = new URLSearchParams({
            q: query,
            limit: limit.toString()
        });

        const response = await ApiService.get(`${API_BASE_URL}/search/autocomplete?${params}`);
        return response;
    }

    static async getPopularSearches(limit: number = 10): Promise<{
        success: boolean;
        message: string;
        data: string[]
    }> {
        const response = await ApiService.get(`${API_BASE_URL}/search/popular?limit=${limit}`);
        return response;
    }

    static async getSearchSuggestions(query: string): Promise<{
        success: boolean;
        message: string;
        data: string[]
    }> {
        const response = await ApiService.get(`${API_BASE_URL}/search/suggestions?q=${encodeURIComponent(query)}`);
        return response;
    }
}