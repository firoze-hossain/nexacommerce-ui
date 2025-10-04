// lib/api/api-service.ts
import {AuthService} from './auth-service';

export class ApiService {
    private static async getHeaders(): Promise<HeadersInit> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        const token = AuthService.getToken();
        if (token) {
            headers['Authorization'] = token;
        }

        return headers;
    }

    static async get(url: string, options: RequestInit = {}): Promise<any> {
        const headers = await this.getHeaders();
        const response = await AuthService.fetchWithAuth(url, {
            ...options,
            method: 'GET',
            headers: {...headers, ...options.headers},
        });
        return this.handleResponse(response);
    }

    static async post(url: string, data: any = {}, options: RequestInit = {}): Promise<any> {
        const headers = await this.getHeaders();
        const response = await AuthService.fetchWithAuth(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
            headers: {...headers, ...options.headers},
        });
        return this.handleResponse(response);
    }

    static async put(url: string, data: any = {}, options: RequestInit = {}): Promise<any> {
        const headers = await this.getHeaders();
        const response = await AuthService.fetchWithAuth(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {...headers, ...options.headers},
        });
        return this.handleResponse(response);
    }

    static async patch(url: string, data: any = {}, options: RequestInit = {}): Promise<any> {
        const headers = await this.getHeaders();
        const response = await AuthService.fetchWithAuth(url, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data),
            headers: {...headers, ...options.headers},
        });
        return this.handleResponse(response);
    }

    static async delete(url: string, options: RequestInit = {}): Promise<any> {
        const headers = await this.getHeaders();
        const response = await AuthService.fetchWithAuth(url, {
            ...options,
            method: 'DELETE',
            headers: {...headers, ...options.headers},
        });
        return this.handleResponse(response);
    }

    static async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `API error: ${response.statusText}`;
            console.error('API Error:', {
                status: response.status,
                statusText: response.statusText,
                errorData,
                url: response.url
            });
            throw new Error(errorMessage);
        }
        return response.json();
    }
}