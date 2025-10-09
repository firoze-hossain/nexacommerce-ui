// app/lib/api/product-service.ts
import {ProductCreateRequest, ProductResponse, ProductsResponse, ProductUpdateRequest} from '@/app/lib/types/product';
import {ApiService} from './api-service';

const API_BASE_URL = 'http://localhost:8090/api/v1/nexa';

export class ProductService {
    /**
     * Create a new product
     */
    static async createProduct(productData: ProductCreateRequest, vendorId?: number): Promise<ProductResponse> {
        try {
            const url = vendorId
                ? `${API_BASE_URL}/products?vendorId=${vendorId}`
                : `${API_BASE_URL}/products`;
            const response = await ApiService.post(url, productData);
            return response;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    /**
     * Get product by ID
     */
    static async getProductById(productId: number): Promise<ProductResponse> {
        try {
            const response = await ApiService.get(`${API_BASE_URL}/products/${productId}`);
            return response;
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    }

    /**
     * Get product by SKU
     */
    static async getProductBySku(sku: string): Promise<ProductResponse> {
        try {
            const response = await ApiService.get(`${API_BASE_URL}/products/sku/${sku}`);
            return response;
        } catch (error) {
            console.error('Error fetching product by SKU:', error);
            throw error;
        }
    }

    /**
     * Get all products with pagination
     */
    static async getAllProducts(
        page: number = 0,
        size: number = 12,
        sortBy: string = 'createdAt',
        sortDirection: string = 'desc'
    ): Promise<ProductsResponse> {
        try {
            const response = await ApiService.get(
                `${API_BASE_URL}/products?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    /**
     * Get products by vendor
     */
    static async getProductsByVendor(
        vendorId: number,
        page: number = 0,
        size: number = 12
    ): Promise<ProductsResponse> {
        try {
            const response = await ApiService.get(
                `${API_BASE_URL}/products/vendor/${vendorId}?page=${page}&size=${size}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching vendor products:', error);
            throw error;
        }
    }

    /**
     * Get products by brand
     */

    static async getProductsByBrand(
        brandId: number,
        page: number = 0,
        size: number = 12
    ): Promise<ProductsResponse> {
        try {
            const response = await ApiService.get(
                `${API_BASE_URL}/products/brand/${brandId}?page=${page}&size=${size}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching brand products:', error);
            throw error;
        }
    }

    /**
     * Get products by category
     */
    static async getProductsByCategory(
        categoryId: number,
        page: number = 0,
        size: number = 12
    ): Promise<ProductsResponse> {
        try {
            const response = await ApiService.get(
                `${API_BASE_URL}/products/category/${categoryId}?page=${page}&size=${size}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching category products:', error);
            throw error;
        }
    }

    /**
     * Get products by status
     */
    static async getProductsByStatus(
        status: string,
        page: number = 0,
        size: number = 12
    ): Promise<ProductsResponse> {
        const response = await ApiService.get(
            `${API_BASE_URL}/products/status?status=${status}&page=${page}&size=${size}`
        );
        return response;
    }

    /**
     * Search products
     */
    static async searchProducts(
        query: string,
        page: number = 0,
        size: number = 12
    ): Promise<ProductsResponse> {
        const response = await ApiService.get(
            `${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`
        );
        return response;
    }

    /**
     * Get products by price range
     */
    static async getProductsByPriceRange(
        minPrice: number,
        maxPrice: number,
        page: number = 0,
        size: number = 12
    ): Promise<ProductsResponse> {
        const response = await ApiService.get(
            `${API_BASE_URL}/products/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}&page=${page}&size=${size}`
        );
        return response;
    }

    /**
     * Get featured products
     */
    static async getFeaturedProducts(): Promise<{ success: boolean; message: string; data: ProductResponse[] }> {
        try {
            const response = await ApiService.get(`${API_BASE_URL}/products/featured`);
            return response;
        } catch (error) {
            console.error('Error fetching featured products:', error);
            // Return empty array instead of throwing to prevent home page crash
            return {success: false, message: 'Failed to load featured products', data: []};
        }
    }

    /**
     * Update product
     */
    static async updateProduct(productId: number, productData: ProductUpdateRequest): Promise<ProductResponse> {
        const response = await ApiService.put(`${API_BASE_URL}/products/${productId}`, productData);
        return response;
    }

    /**
     * Update product status
     */
    static async updateProductStatus(productId: number, status: string): Promise<ProductResponse> {
        const response = await ApiService.patch(`${API_BASE_URL}/products/${productId}/status?status=${status}`);
        return response;
    }

    /**
     * Update product stock
     */
    static async updateProductStock(productId: number, stock: number): Promise<ProductResponse> {
        const response = await ApiService.patch(`${API_BASE_URL}/products/${productId}/stock?stock=${stock}`);
        return response;
    }

    /**
     * Delete product
     */
    static async deleteProduct(productId: number): Promise<{ success: boolean; message: string }> {
        await ApiService.delete(`${API_BASE_URL}/products/${productId}`);
        return {success: true, message: 'Product deleted successfully'};
    }
}