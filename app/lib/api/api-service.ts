import { AuthService } from './auth-service';

export class ApiService {
    static async get(url: string, options: RequestInit = {}) {
        return AuthService.fetchWithAuth(url, {
            ...options,
            method: 'GET',
        });
    }

    static async post(url: string, data: any = {}, options: RequestInit = {}) {
        return AuthService.fetchWithAuth(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async put(url: string, data: any = {}, options: RequestInit = {}) {
        return AuthService.fetchWithAuth(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    static async patch(url: string, data: any = {}, options: RequestInit = {}) {
        return AuthService.fetchWithAuth(url, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    static async delete(url: string, options: RequestInit = {}) {
        return AuthService.fetchWithAuth(url, {
            ...options,
            method: 'DELETE',
        });
    }

    // Helper method to handle API responses
    static async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API error: ${response.statusText}`);
        }
        return response.json();
    }
}