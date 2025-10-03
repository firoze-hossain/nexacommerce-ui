// lib/api/auth-service.ts
import { LoginRequest, LoginResponse } from '@/app/lib/types/auth';

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

    return await response.json();
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
      localStorage.setItem('auth_token', token);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('token_timestamp', Date.now().toString());

      // Calculate token expiration (15 minutes from now)
      const expiresIn = Date.now() + (15 * 60 * 1000);
      localStorage.setItem('token_expires', expiresIn.toString());
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
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
}