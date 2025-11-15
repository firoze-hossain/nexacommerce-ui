// app/lib/api/hero-service.ts
import {
    HeroAnalyticsResponse,
    HeroContentCreateRequest,
    HeroContentResponse,
    HeroContentsResponse,
    HeroContentUpdateRequest
} from '@/app/lib/types/hero';
import {ApiService} from './api-service';

const API_BASE_URL = 'http://localhost:8090/api/v1/nexa';

export class HeroService {
    /**
     * Create new hero content
     */
    static async createHeroContent(heroData: HeroContentCreateRequest): Promise<HeroContentResponse> {
        const response = await ApiService.post(`${API_BASE_URL}/hero`, heroData);
        return response;
    }

    /**
     * Get hero content by ID
     */
    static async getHeroContentById(heroId: number): Promise<HeroContentResponse> {
        const response = await ApiService.get(`${API_BASE_URL}/hero/${heroId}`);
        return response;
    }

    /**
     * Get all hero content with pagination
     */
    // static async getHeroContents(
    //     page: number = 0,
    //     size: number = 10,
    //     sortBy: string = 'displayOrder',
    //     sortDirection: string = 'desc'
    // ): Promise<HeroContentsResponse> {
    //     const response = await ApiService.get(
    //         `${API_BASE_URL}/hero?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
    //     );
    //     return response;
    // }

    static async getHeroContents(
        page: number = 0,
        size: number = 10,
        sortBy: string = 'displayOrder',
        sortDirection: string = 'desc'
    ): Promise<HeroContentsResponse> {
        try {
            const response = await ApiService.get(
                `${API_BASE_URL}/hero?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
            );

            console.log('Raw API Response:', response); // Debug log

            // Handle both paginated and non-paginated responses
            if (response.data && Array.isArray(response.data)) {
                // Backend returns simple array (non-paginated)
                const items = response.data;
                const startIndex = page * size;
                const endIndex = startIndex + size;
                const paginatedItems = items.slice(startIndex, endIndex);

                return {
                    success: true,
                    message: response.message || 'Hero contents retrieved successfully',
                    data: {
                        items: paginatedItems,
                        totalItems: items.length,
                        currentPage: page,
                        pageSize: size,
                        totalPages: Math.ceil(items.length / size)
                    },
                    timestamp: response.timestamp || new Date().toISOString(),
                    statusCode: response.statusCode || 200
                };
            } else if (response.data && response.data.items) {
                // Backend returns paginated response
                return {
                    success: true,
                    message: response.message,
                    data: response.data,
                    timestamp: response.timestamp,
                    statusCode: response.statusCode
                };
            } else if (response.data) {
                // Handle case where data exists but not in expected format
                console.warn('Unexpected response structure:', response);
                return {
                    success: true,
                    message: 'Hero contents retrieved successfully',
                    data: {
                        items: Array.isArray(response.data) ? response.data : [],
                        totalItems: Array.isArray(response.data) ? response.data.length : 0,
                        currentPage: page,
                        pageSize: size,
                        totalPages: Array.isArray(response.data) ? Math.ceil(response.data.length / size) : 0
                    },
                    timestamp: new Date().toISOString(),
                    statusCode: 200
                };
            } else {
                // No data returned
                return {
                    success: true,
                    message: 'No hero content found',
                    data: {
                        items: [],
                        totalItems: 0,
                        currentPage: page,
                        pageSize: size,
                        totalPages: 0
                    },
                    timestamp: new Date().toISOString(),
                    statusCode: 200
                };
            }
        } catch (error) {
            console.error('Error in getHeroContents:', error);
            return {
                success: false,
                error: 'Failed to fetch hero contents',
                message: 'Failed to load hero contents',
                data: {
                    items: [],
                    totalItems: 0,
                    currentPage: page,
                    pageSize: size,
                    totalPages: 0
                },
                timestamp: new Date().toISOString(),
                statusCode: 500
            };
        }
    }

    /**
     * Update hero content
     */
    static async updateHeroContent(heroId: number, heroData: HeroContentUpdateRequest): Promise<HeroContentResponse> {
        const response = await ApiService.put(`${API_BASE_URL}/hero/${heroId}`, heroData);
        return response;
    }

    /**
     * Delete hero content
     */
    static async deleteHeroContent(heroId: number): Promise<{ success: boolean; message: string }> {
        await ApiService.delete(`${API_BASE_URL}/hero/${heroId}`);
        return {success: true, message: 'Hero content deleted successfully'};
    }

    /**
     * Toggle hero content status
     */
    static async toggleHeroContentStatus(heroId: number): Promise<HeroContentResponse> {
        const response = await ApiService.patch(`${API_BASE_URL}/hero/${heroId}/toggle-status`);
        return response;
    }

    /**
     * Get hero analytics
     */
    static async getHeroAnalytics(): Promise<HeroAnalyticsResponse> {
        const response = await ApiService.get(`${API_BASE_URL}/hero/analytics`);
        return response;
    }

    /**
     * Get hero content analytics by ID
     */
    static async getHeroContentAnalytics(heroId: number): Promise<HeroAnalyticsResponse> {
        const response = await ApiService.get(`${API_BASE_URL}/hero/${heroId}/analytics`);
        return response;
    }

    /**
     * Record impression
     */
    static async recordImpression(heroId: number): Promise<void> {
        await ApiService.post(`${API_BASE_URL}/hero/public/${heroId}/impression`);
    }

    /**
     * Record click
     */
    static async recordClick(heroId: number): Promise<void> {
        await ApiService.post(`${API_BASE_URL}/hero/public/${heroId}/click`);
    }

    /**
     * Get top performing content
     */
    static async getTopPerformingContent(): Promise<HeroContentsResponse> {
        const response = await ApiService.get(`${API_BASE_URL}/hero/top-performing`);
        return response;
    }

    /**
     * Deactivate expired content
     */
    static async deactivateExpiredContent(): Promise<{ success: boolean; message: string }> {
        await ApiService.post(`${API_BASE_URL}/hero/maintenance/deactivate-expired`);
        return {success: true, message: 'Expired content deactivated successfully'};
    }

    private static getUserSegment(): string {
        if (typeof window === 'undefined') return 'DESKTOP_USER';

        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent);
        const isTablet = /(ipad|tablet|playbook|silk)|(android(?!.*mobile))/g.test(userAgent);

        if (isMobile) return 'MOBILE_USER';
        if (isTablet) return 'TABLET_USER';
        return 'DESKTOP_USER';
    }

    static async getMainHeroContent(): Promise<HeroContentResponse> {
        const userSegment = this.getUserSegment();
        const response = await ApiService.get(
            `${API_BASE_URL}/hero/public/main?segment=${userSegment}`
        );
        return response;
    }

    /**
     * Get active hero content with user segmentation
     */
    static async getActiveHeroContent(): Promise<HeroContentsResponse> {
        const userSegment = this.getUserSegment();
        const response = await ApiService.get(
            `${API_BASE_URL}/hero/public/active?segment=${userSegment}`
        );
        return response;
    }

    /**
     * Get hero content by type
     */
    static async getHeroContentByType(type: string): Promise<HeroContentsResponse> {
        const userSegment = this.getUserSegment();
        const response = await ApiService.get(
            `${API_BASE_URL}/hero/public/type/${type}?segment=${userSegment}`
        );
        return response;
    }
}