// app/lib/api/brand-service.ts
import {
    Brand,
    BrandCreateRequest,
    BrandResponse,
    BrandsResponse,
    BrandUpdateRequest,
    BrandWithProductsResponse
} from '@/app/lib/types/brand';
import {ApiService} from './api-service';

const API_BASE_URL = 'http://localhost:8090/api/v1/nexa';

export class BrandService {
    /**
     * Create a new brand
     */
    static async createBrand(brandData: BrandCreateRequest): Promise<BrandResponse> {
        const response = await ApiService.post(`${API_BASE_URL}/brands`, brandData);
        return response;
    }

    /**
     * Get brand by ID
     */
    static async getBrandById(brandId: number): Promise<BrandResponse> {
        const response = await ApiService.get(`${API_BASE_URL}/brands/${brandId}`);
        return response;
    }

    /**
     * Get brand by slug
     */
    static async getBrandBySlug(slug: string): Promise<BrandResponse> {
        const response = await ApiService.get(`${API_BASE_URL}/brands/slug/${slug}`);
        return response;
    }

    /**
     * Get brand with products
     */
    static async getBrandWithProducts(brandId: number): Promise<{
        success: boolean;
        message: string;
        data: BrandWithProductsResponse
    }> {
        const response = await ApiService.get(`${API_BASE_URL}/brands/${brandId}/with-products`);
        return response;
    }

    /**
     * Get all brands with pagination
     */
    static async getBrands(
        page: number = 0,
        size: number = 10,
        sortBy: string = 'name',
        sortDirection: string = 'asc'
    ): Promise<BrandsResponse> {
        const response = await ApiService.get(
            `${API_BASE_URL}/brands?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
        );
        return response;
    }

    /**
     * Get active brands
     */
    static async getActiveBrands(): Promise<{ success: boolean; message: string; data: Brand[] }> {
        const response = await ApiService.get(`${API_BASE_URL}/brands/active`);
        return response;
    }

    /**
     * Get featured brands
     */
    static async getFeaturedBrands(): Promise<{ success: boolean; message: string; data: Brand[] }> {
        const response = await ApiService.get(`${API_BASE_URL}/brands/featured`);
        return response;
    }

    /**
     * Update brand
     */
    static async updateBrand(brandId: number, brandData: BrandUpdateRequest): Promise<BrandResponse> {
        const response = await ApiService.put(`${API_BASE_URL}/brands/${brandId}`, brandData);
        return response;
    }

    /**
     * Delete brand
     */
    static async deleteBrand(brandId: number): Promise<{ success: boolean; message: string }> {
        await ApiService.delete(`${API_BASE_URL}/brands/${brandId}`);
        return {success: true, message: 'Brand deleted successfully'};
    }

    /**
     * Toggle brand status
     */
    static async toggleBrandStatus(brandId: number): Promise<BrandResponse> {
        const response = await ApiService.patch(`${API_BASE_URL}/brands/${brandId}/toggle-status`);
        return response;
    }
}