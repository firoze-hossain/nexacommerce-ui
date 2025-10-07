// app/hooks/useAuth.ts - CORRECTED VERSION
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/app/lib/api/auth-service';
import { LoginRequest, User } from '@/app/lib/types/auth';

// Use named export instead of default export
export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        checkAuth();

        // Set up token refresh interval
        const interval = setInterval(() => {
            if (AuthService.shouldRefreshToken() && isAuthenticated) {
                refreshTokenSilently();
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const refreshTokenSilently = useCallback(async () => {
        try {
            const response = await AuthService.refreshToken();
            if (response.success) {
                AuthService.storeTokens(
                    response.data.token,
                    response.data.refreshToken
                );
                AuthService.storeUserData(response.data.user);
                setUser(response.data.user);
                console.log('Token refreshed successfully');
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            // If refresh fails, logout user
            logout();
        }
    }, []);

    const checkAuth = useCallback(async () => {
        const token = AuthService.getToken();
        const userData = AuthService.getUserData();
        const isExpired = AuthService.isTokenExpired();

        if (token && userData && !isExpired) {
            setUser(userData);
            setIsAuthenticated(true);
        } else if (isExpired && AuthService.getRefreshToken()) {
            // Try to refresh token if expired
            try {
                await refreshTokenSilently();
            } catch (error) {
                AuthService.clearTokens();
                setUser(null);
                setIsAuthenticated(false);
            }
        } else {
            AuthService.clearTokens();
            setUser(null);
            setIsAuthenticated(false);
        }
        setLoading(false);
    }, [refreshTokenSilently]);

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

    const logout = useCallback(async () => {
        setLoading(true);
        try {
            await AuthService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            router.push('/login');
            setLoading(false);
        }
    }, [router]);

    const refreshToken = useCallback(async () => {
        try {
            const response = await AuthService.refreshToken();
            if (response.success) {
                AuthService.storeTokens(
                    response.data.token,
                    response.data.refreshToken
                );
                AuthService.storeUserData(response.data.user);
                setUser(response.data.user);
                return { success: true };
            }
            return { success: false };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Token refresh failed'
            };
        }
    }, []);

    return {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        refreshToken,
        checkAuth,
    };
};