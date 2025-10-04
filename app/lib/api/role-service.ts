// app/lib/api/role-service.ts
import { RoleRequest, RoleResponse, RolesResponse, UpdateRolePermissionsRequest } from '@/app/lib/types/role';
import { ApiService } from './api-service';

const API_BASE_URL = 'http://localhost:8090/api/v1/nexa';

export class RoleService {
    /**
     * Get all roles with pagination
     */
    static async getRoles(
        page: number = 0,
        size: number = 20,
        sortBy: string = 'name',
        sortDirection: string = 'asc'
    ): Promise<RolesResponse> {
        const response = await ApiService.get(
            `${API_BASE_URL}/admin/roles?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
        );
        return response;
    }

    /**
     * Get role by ID
     */
    static async getRoleById(id: number): Promise<RoleResponse> {
        const response = await ApiService.get(`${API_BASE_URL}/admin/roles/${id}`);
        return response;
    }

    /**
     * Create a new role
     */
    static async createRole(roleData: RoleRequest): Promise<RoleResponse> {
        const response = await ApiService.post(`${API_BASE_URL}/admin/roles`, roleData);
        return response;
    }

    /**
     * Update an existing role
     */
    static async updateRole(id: number, roleData: RoleRequest): Promise<RoleResponse> {
        const response = await ApiService.put(`${API_BASE_URL}/admin/roles/${id}`, roleData);
        return response;
    }

    /**
     * Update role permissions
     */
    static async updateRolePermissions(id: number, permissionIds: number[]): Promise<RoleResponse> {
        const response = await ApiService.put(
            `${API_BASE_URL}/admin/roles/${id}/permissions`,
            { permissionIds }
        );
        return response;
    }

    /**
     * Delete a role
     */
    static async deleteRole(id: number): Promise<{ success: boolean; message: string }> {
        await ApiService.delete(`${API_BASE_URL}/admin/roles/${id}`);
        return { success: true, message: 'Role deleted successfully' };
    }
}