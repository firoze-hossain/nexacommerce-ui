// app/lib/api/permission-service.ts
import { PermissionRequest, PermissionResponse, PermissionsResponse } from '@/app/lib/types/role';
import { ApiService } from './api-service';

const API_BASE_URL = 'http://localhost:8090/api/v1/nexa';

export class PermissionService {
    /**
     * Get all permissions with pagination
     */
    static async getPermissions(
        page: number = 0,
        size: number = 50,
        sortBy: string = 'name',
        sortDirection: string = 'asc'
    ): Promise<PermissionsResponse> {
        const response = await ApiService.get(
            `${API_BASE_URL}/admin/permissions?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
        );
        return response;
    }

    /**
     * Create a new permission
     */
    static async createPermission(permissionData: PermissionRequest): Promise<PermissionResponse> {
        const response = await ApiService.post(`${API_BASE_URL}/admin/permissions`, permissionData);
        return response;
    }

    /**
     * Update an existing permission
     */
    static async updatePermission(id: number, permissionData: PermissionRequest): Promise<PermissionResponse> {
        const response = await ApiService.put(`${API_BASE_URL}/admin/permissions/${id}`, permissionData);
        return response;
    }

    /**
     * Delete a permission
     */
    static async deletePermission(id: number): Promise<{ success: boolean; message: string }> {
        await ApiService.delete(`${API_BASE_URL}/admin/permissions/${id}`);
        return { success: true, message: 'Permission deleted successfully' };
    }
}