// app/lib/api/category-service.ts
import {
    CategoryCreateRequest,
    CategoryUpdateRequest,
    CategoryResponse,
    CategoriesResponse,
    CategoryTreeResponse
} from '@/app/lib/types/category';
import { ApiService } from './api-service';

const API_BASE_URL = 'http://localhost:8090/api/v1/nexa';

export class CategoryService {
    /**
     * Create a new category
     */
    static async createCategory(categoryData: CategoryCreateRequest): Promise<CategoryResponse> {
        const response = await ApiService.post(`${API_BASE_URL}/categories`, categoryData);
        return response;
    }

    /**
     * Get category by ID
     */
    static async getCategoryById(categoryId: number): Promise<CategoryResponse> {
        const response = await ApiService.get(`${API_BASE_URL}/categories/${categoryId}`);
        return response;
    }

    /**
     * Get category by slug
     */
    static async getCategoryBySlug(slug: string): Promise<CategoryResponse> {
        const response = await ApiService.get(`${API_BASE_URL}/categories/slug/${slug}`);
        return response;
    }

    /**
     * Get all categories with pagination
     */
    static async getCategories(
        page: number = 0,
        size: number = 10,
        sortBy: string = 'name',
        sortDirection: string = 'asc'
    ): Promise<CategoriesResponse> {
        const response = await ApiService.get(
            `${API_BASE_URL}/categories?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
        );
        return response;
    }

    /**
     * Get category tree
     */
    static async getCategoryTree(): Promise<{ success: boolean; message: string; data: CategoryTreeResponse[] }> {
        const response = await ApiService.get(`${API_BASE_URL}/categories/tree`);
        return response;
    }

    /**
     * Get root categories
     */
    static async getRootCategories(): Promise<{ success: boolean; message: string; data: CategoryResponse[] }> {
        const response = await ApiService.get(`${API_BASE_URL}/categories/root`);
        return response;
    }

    /**
     * Get child categories
     */
    static async getChildCategories(parentId: number): Promise<{ success: boolean; message: string; data: CategoryResponse[] }> {
        const response = await ApiService.get(`${API_BASE_URL}/categories/${parentId}/children`);
        return response;
    }

    /**
     * Get featured categories
     */
    static async getFeaturedCategories(): Promise<{ success: boolean; message: string; data: CategoryResponse[] }> {
        const response = await ApiService.get(`${API_BASE_URL}/categories/featured`);
        return response;
    }

    /**
     * Update category
     */
    static async updateCategory(categoryId: number, categoryData: CategoryUpdateRequest): Promise<CategoryResponse> {
        const response = await ApiService.put(`${API_BASE_URL}/categories/${categoryId}`, categoryData);
        return response;
    }

    /**
     * Delete category
     */
    static async deleteCategory(categoryId: number): Promise<{ success: boolean; message: string }> {
        await ApiService.delete(`${API_BASE_URL}/categories/${categoryId}`);
        return { success: true, message: 'Category deleted successfully' };
    }

    /**
     * Toggle category status
     */
    static async toggleCategoryStatus(categoryId: number): Promise<CategoryResponse> {
        const response = await ApiService.patch(`${API_BASE_URL}/categories/${categoryId}/toggle-status`);
        return response;
    }
}