// lib/api/auth-service.ts
import {LoginRequest, LoginResponse} from '@/app/lib/types/auth';

const API_BASE_URL = 'http://localhost:8090/api/v1/nexa';

export class AuthService {
    static async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Login failed: ${response.statusText}`);
        }
        const loginResponse = await response.json();

        // Store tokens properly
        if (loginResponse.success && loginResponse.data) {
            this.storeTokens(
                loginResponse.data.token,
                loginResponse.data.refreshToken
            );
            this.storeUserData(loginResponse.data.user);
        }

        //return await response.json();
        return loginResponse;
    }

    static async refreshToken(): Promise<LoginResponse> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await fetch(`${API_BASE_URL}/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Token refresh failed: ${response.statusText}`);
        }

        return await response.json();
    }

    static async logout(): Promise<void> {
        const token = this.getToken();

        // Call logout API if token exists
        if (token) {
            try {
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json',
                    },
                });
            } catch (error) {
                console.error('Logout API call failed:', error);
                // Continue with client-side logout even if API call fails
            }
        }

        // Always clear local storage
        this.clearTokens();
    }

    static storeTokens(token: string, refreshToken: string) {
        if (typeof window !== 'undefined') {
            // Store the token with Bearer prefix for consistency
            const tokenWithBearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
            localStorage.setItem('auth_token', tokenWithBearer);
            localStorage.setItem('refresh_token', refreshToken);
            localStorage.setItem('token_timestamp', Date.now().toString());

            // Calculate token expiration (15 minutes from now)
            const expiresIn = Date.now() + (15 * 60 * 1000);
            localStorage.setItem('token_expires', expiresIn.toString());
        }
    }

    static getToken(): string | null {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('auth_token');
            // Ensure token has Bearer prefix
            return token && !token.startsWith('Bearer ') ? `Bearer ${token}` : token;
        }
        return null;
    }

    static getRefreshToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('refresh_token');
        }
        return null;
    }

    static clearTokens() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('token_timestamp');
            localStorage.removeItem('token_expires');
            localStorage.removeItem('user_data');
        }
    }

    static storeUserData(user: any) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('user_data', JSON.stringify(user));
        }
    }

    static getUserData(): any {
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem('user_data');
            return userData ? JSON.parse(userData) : null;
        }
        return null;
    }

    static isTokenExpired(): boolean {
        if (typeof window !== 'undefined') {
            const expires = localStorage.getItem('token_expires');
            if (!expires) return true;

            return Date.now() >= parseInt(expires);
        }
        return true;
    }

    static shouldRefreshToken(): boolean {
        if (typeof window !== 'undefined') {
            const expires = localStorage.getItem('token_expires');
            if (!expires) return false;

            // Refresh if token expires in less than 5 minutes
            const timeUntilExpiry = parseInt(expires) - Date.now();
            return timeUntilExpiry < (5 * 60 * 1000);
        }
        return false;
    }

    // Enhanced fetch with automatic token refresh
    static async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
        let token = this.getToken();

        // Refresh token if needed before making the request
        if (this.shouldRefreshToken()) {
            try {
                await this.refreshToken();
                token = this.getToken(); // Get the new token
            } catch (error) {
                console.error('Token refresh failed:', error);
                this.clearTokens();
                throw new Error('Authentication failed');
            }
        }

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            (headers as any)['Authorization'] = token;
        }

        let response = await fetch(url, {
            ...options,
            headers,
        });

        // If token is expired, try to refresh and retry
        if (response.status === 401) {
            try {
                await this.refreshToken();
                const newToken = this.getToken();

                if (newToken) {
                    (headers as any)['Authorization'] = newToken;
                    response = await fetch(url, {
                        ...options,
                        headers,
                    });
                }
            } catch (error) {
                console.error('Token refresh failed after 401:', error);
                this.clearTokens();
                // Redirect to login page
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                throw error;
            }
        }

        return response;
    }

}