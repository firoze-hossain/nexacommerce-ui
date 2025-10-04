// lib/api/user-service.ts
import {UserRequest, UserResponse, UsersResponse} from '@/app/lib/types/user';
import {ApiService} from './api-service';

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
        return response;
    }

    static async getUserById(id: number): Promise<UserResponse> {
        const response = await ApiService.get(`${API_BASE_URL}/users/${id}`);
        return response;
    }

    static async createUser(userData: UserRequest): Promise<UserResponse> {
        const response = await ApiService.post(`${API_BASE_URL}/users`, userData);
        return response;
    }

    static async updateUser(id: number, userData: Partial<UserRequest>): Promise<UserResponse> {
        const response = await ApiService.put(`${API_BASE_URL}/users/${id}`, userData);
        return response;
    }

    static async deleteUser(id: number): Promise<{ success: boolean; message: string }> {
        await ApiService.delete(`${API_BASE_URL}/users/${id}`);
        return {success: true, message: 'User deleted successfully'};
    }

    static async activateUser(id: number): Promise<UserResponse> {
        const response = await ApiService.patch(`${API_BASE_URL}/users/${id}/activate`, {});
        return response;
    }

    static async deactivateUser(id: number): Promise<UserResponse> {
        const response = await ApiService.patch(`${API_BASE_URL}/users/${id}/deactivate`, {});
        return response;
    }
}