// hooks/useAuth.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/app/lib/api/auth-service';
import { LoginRequest, User } from '@/app/lib/types/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(() => {
    const token = AuthService.getToken();
    const userData = AuthService.getUserData();
    const isExpired = AuthService.isTokenExpired();

    if (token && userData && !isExpired) {
      setUser(userData);
      setIsAuthenticated(true);
    } else if (isExpired) {
      AuthService.logout();
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      const response = await AuthService.login(credentials);
      
      if (response.success) {
        AuthService.storeTokens(
          response.data.token, 
          response.data.refreshToken
        );
        AuthService.storeUserData(response.data.user);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true, data: response };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  }, [router]);

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };
}