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
        // Check if response is not successful
        if (!response.ok) {
            let errorData;
            try {
                // Try to parse error response as JSON
                errorData = await response.json();
            } catch {
                // If JSON parsing fails, create a generic error object
                errorData = { message: response.statusText };
            }

            const errorMessage = errorData.message || `API error: ${response.statusText}`;
            console.error('API Error:', {
                status: response.status,
                statusText: response.statusText,
                errorData,
                url: response.url
            });
            throw new Error(errorMessage);
        }

        // For successful responses, check if there's content to parse
        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');

        // If no content or empty response, return empty object
        if (response.status === 204 || // No Content
            contentLength === '0' ||
            !contentType ||
            !contentType.includes('application/json')) {
            return {} as T;
        }

        try {
            // Try to parse JSON response
            return await response.json();
        } catch (error) {
            console.warn('Empty or invalid JSON response, returning empty object');
            return {} as T;
        }
    }
}