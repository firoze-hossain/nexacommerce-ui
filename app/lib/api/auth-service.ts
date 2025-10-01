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

  static storeTokens(token: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('token_timestamp', Date.now().toString());
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  static logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_timestamp');
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
      const timestamp = localStorage.getItem('token_timestamp');
      if (!timestamp) return true;
      
      const tokenAge = Date.now() - parseInt(timestamp);
      // Consider token expired after 24 hours
      return tokenAge > 24 * 60 * 60 * 1000;
    }
    return true;
  }
}