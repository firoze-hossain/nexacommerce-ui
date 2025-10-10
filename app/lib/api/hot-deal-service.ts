// app/lib/api/hot-deal-service.ts
import {
    HotDeal,
    HotDealCreateRequest,
    HotDealResponse,
    HotDealsResponse,
    HotDealUpdateRequest
} from '@/app/lib/types/hot-deal';
import {ApiService} from './api-service';

const API_BASE_URL = 'http://localhost:8090/api/v1/nexa';

export class HotDealService {
    /**
     * Create a new hot deal
     */
    static async createHotDeal(hotDealData: HotDealCreateRequest): Promise<HotDealResponse> {
        const response = await ApiService.post(`${API_BASE_URL}/hot-deals`, hotDealData);
        return response;
    }

    /**
     * Get hot deal by ID
     */
    static async getHotDealById(hotDealId: number): Promise<HotDealResponse> {
        const response = await ApiService.get(`${API_BASE_URL}/hot-deals/${hotDealId}`);
        return response;
    }

    /**
     * Get all hot deals with pagination
     */
    static async getHotDeals(
        page: number = 0,
        size: number = 10,
        sortBy: string = 'createdAt',
        sortDirection: string = 'desc'
    ): Promise<HotDealsResponse> {
        const response = await ApiService.get(
            `${API_BASE_URL}/hot-deals?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
        );
        return response;
    }

    /**
     * Get active hot deals
     */
    static async getActiveHotDeals(): Promise<{ success: boolean; message: string; data: HotDeal[] }> {
        const response = await ApiService.get(`${API_BASE_URL}/hot-deals/active`);
        return response;
    }

    /**
     * Update hot deal
     */
    static async updateHotDeal(hotDealId: number, hotDealData: HotDealUpdateRequest): Promise<HotDealResponse> {
        const response = await ApiService.put(`${API_BASE_URL}/hot-deals/${hotDealId}`, hotDealData);
        return response;
    }

    /**
     * Update hot deal status
     */
    static async updateHotDealStatus(hotDealId: number, isActive: boolean): Promise<HotDealResponse> {
        const response = await ApiService.patch(`${API_BASE_URL}/hot-deals/${hotDealId}/status?isActive=${isActive}`);
        return response;
    }

    /**
     * Delete hot deal
     */
    static async deleteHotDeal(hotDealId: number): Promise<{ success: boolean; message: string }> {
        await ApiService.delete(`${API_BASE_URL}/hot-deals/${hotDealId}`);
        return {success: true, message: 'Hot deal deleted successfully'};
    }

    /**
     * Increment sold count
     */
    static async incrementSoldCount(hotDealId: number): Promise<HotDealResponse> {
        const response = await ApiService.patch(`${API_BASE_URL}/hot-deals/${hotDealId}/increment-sold`);
        return response;
    }
}