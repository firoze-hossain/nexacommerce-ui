import { UserRequest, UserResponse, UsersResponse, UserResponseSingle, PaginatedUsers } from '@/app/lib/types/user';
import { ApiService } from './api-service';

const API_BASE_URL = 'http://localhost:8090/api/v1/nexa';

export class UserService {
    static async getUsers(
        page: number = 0,
        size: number = 10,
        sortBy: string = 'createdAt',
        sortDirection: string = 'desc'
    ): Promise<UsersResponse> {
        const response = await ApiService.get(
            `${API_BASE_URL}/users?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
        );
        return ApiService.handleResponse<UsersResponse>(response);
    }

    static async getUserById(id: number): Promise<UserResponseSingle> {
        const response = await ApiService.get(`${API_BASE_URL}/users/${id}`);
        return ApiService.handleResponse<UserResponseSingle>(response);
    }

    static async createUser(userData: UserRequest): Promise<UserResponseSingle> {
        const response = await ApiService.post(`${API_BASE_URL}/users`, userData);
        return ApiService.handleResponse<UserResponseSingle>(response);
    }

    static async updateUser(id: number, userData: Partial<UserRequest>): Promise<UserResponseSingle> {
        const response = await ApiService.put(`${API_BASE_URL}/users/${id}`, userData);
        return ApiService.handleResponse<UserResponseSingle>(response);
    }

    static async deleteUser(id: number): Promise<{ success: boolean; message: string }> {
        const response = await ApiService.delete(`${API_BASE_URL}/users/${id}`);
        if (response.ok) {
            return { success: true, message: 'User deleted successfully' };
        }
        throw new Error('Failed to delete user');
    }

    static async activateUser(id: number): Promise<UserResponseSingle> {
        const response = await ApiService.patch(`${API_BASE_URL}/users/${id}/activate`);
        return ApiService.handleResponse<UserResponseSingle>(response);
    }

    static async deactivateUser(id: number): Promise<UserResponseSingle> {
        const response = await ApiService.patch(`${API_BASE_URL}/users/${id}/deactivate`);
        return ApiService.handleResponse<UserResponseSingle>(response);
    }
}
