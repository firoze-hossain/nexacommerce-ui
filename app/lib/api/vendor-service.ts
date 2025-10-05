// app/lib/api/vendor-service.ts
import {
    VendorDetail,
    VendorRegistrationRequest,
    VendorResponse,
    VendorsResponse,
    VendorStatus,
    VendorUpdateRequest
} from '@/app/lib/types/vendor';
import {ApiService} from './api-service';

const API_BASE_URL = 'http://localhost:8090/api/v1/nexa';

export class VendorService {
    /**
     * Register a new vendor
     */
    static async register(vendorData: VendorRegistrationRequest): Promise<VendorResponse> {
        const response = await ApiService.post(`${API_BASE_URL}/vendors/register`, vendorData);
        return response;
    }

    /**
     * Get all vendors with pagination
     */
    static async getVendors(
        page: number = 0,
        size: number = 10,
        sortBy: string = 'createdAt',
        sortDirection: string = 'desc'
    ): Promise<VendorsResponse> {
        const response = await ApiService.get(
            `${API_BASE_URL}/vendors?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
        );
        return response;
    }

    /**
     * Get vendors by status
     */
    static async getVendorsByStatus(
        status: VendorStatus,
        page: number = 0,
        size: number = 10
    ): Promise<VendorsResponse> {
        const response = await ApiService.get(
            `${API_BASE_URL}/vendors/status?status=${status}&page=${page}&size=${size}`
        );
        return response;
    }

    /**
     * Get vendor by ID
     */
    static async getVendorById(vendorId: number): Promise<VendorResponse> {
        const response = await ApiService.get(`${API_BASE_URL}/vendors/${vendorId}`);
        return response;
    }

    /**
     * Get vendor by user ID
     */
    static async getVendorByUserId(userId: number): Promise<VendorResponse> {
        const response = await ApiService.get(`${API_BASE_URL}/vendors/user/${userId}`);
        return response;
    }

    /**
     * Update vendor
     */
    static async updateVendor(vendorId: number, vendorData: VendorUpdateRequest): Promise<VendorResponse> {
        const response = await ApiService.put(`${API_BASE_URL}/vendors/${vendorId}`, vendorData);
        return response;
    }

    /**
     * Approve vendor
     */
    static async approveVendor(vendorId: number): Promise<VendorResponse> {
        const response = await ApiService.patch(`${API_BASE_URL}/vendors/${vendorId}/approve`, {});
        return response;
    }

    /**
     * Reject vendor
     */
    static async rejectVendor(vendorId: number, reason: string): Promise<VendorResponse> {
        const response = await ApiService.patch(`${API_BASE_URL}/vendors/${vendorId}/reject?reason=${encodeURIComponent(reason)}`, {});
        return response;
    }

    /**
     * Delete vendor
     */
    static async deleteVendor(vendorId: number): Promise<{ success: boolean; message: string }> {
        await ApiService.delete(`${API_BASE_URL}/vendors/${vendorId}`);
        return {success: true, message: 'Vendor deleted successfully'};
    }

    /**
     * Helper method to get vendor details with user info
     */
    static async getVendorDetail(vendorId: number): Promise<VendorDetail> {
        const response = await this.getVendorById(vendorId);
        return response.data;
    }
}