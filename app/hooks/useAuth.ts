// app/hooks/useAuth.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/app/lib/api/auth-service';
import { LoginRequest, User } from '@/app/lib/types/auth';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    const refreshTokenSilently = useCallback(async () => {
        console.debug('🔄 Silent token refresh initiated');
        try {
            const response = await AuthService.refreshToken();
            if (response.success) {
                AuthService.storeTokens(
                    response.data.token,
                    response.data.refreshToken
                );
                AuthService.storeUserData(response.data.user);
                setUser(response.data.user);
                console.debug('✅ Silent token refresh successful');
            } else {
                console.warn('⚠️ Silent refresh response not successful:', response);
            }
        } catch (error) {
            console.error('❌ Silent token refresh failed:', error);
            // Don't logout immediately on refresh failure
            // Let the next API call trigger the logout
        }
    }, []);

    const checkAuth = useCallback(async () => {
        console.debug('🔐 Checking authentication status...');
        const token = AuthService.getToken();
        const userData = AuthService.getUserData();
        const isExpired = AuthService.isTokenExpired();

        console.debug('🔍 Auth check details:', {
            hasToken: !!token,
            hasUserData: !!userData,
            isExpired,
            hasRefreshToken: !!AuthService.getRefreshToken()
        });

        if (token && userData && !isExpired) {
            setUser(userData);
            setIsAuthenticated(true);
            console.debug('✅ User is authenticated');
        } else if (isExpired && AuthService.getRefreshToken()) {
            console.debug('🔄 Token expired, attempting refresh...');
            // Try to refresh token if expired
            try {
                await refreshTokenSilently();
            } catch (error) {
                console.error('❌ Token refresh during auth check failed:', error);
                AuthService.clearTokens();
                setUser(null);
                setIsAuthenticated(false);
                console.debug('🚪 User logged out due to refresh failure');
            }
        } else {
            console.debug('❌ No valid authentication found');
            AuthService.clearTokens();
            setUser(null);
            setIsAuthenticated(false);
        }
        setLoading(false);
        console.debug('🔐 Auth check completed:', { isAuthenticated, loading: false });
    }, [refreshTokenSilently]);

    useEffect(() => {
        console.debug('🏁 useAuth hook mounted');
        checkAuth();

        // Set up token refresh interval
        const interval = setInterval(() => {
            console.debug('⏰ Token refresh interval check');
            if (AuthService.shouldRefreshToken() && isAuthenticated) {
                console.debug('🔄 Interval-based token refresh triggered');
                refreshTokenSilently();
            }
        }, 60000); // Check every minute

        return () => {
            console.debug('🧹 useAuth hook cleanup');
            clearInterval(interval);
        };
    }, [isAuthenticated, refreshTokenSilently]);

    const login = async (credentials: LoginRequest) => {
        console.debug('🔐 Login function called:', { email: credentials.email });
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
                console.debug('✅ Login successful, user authenticated');
                return { success: true, data: response };
            } else {
                console.warn('⚠️ Login response not successful:', response);
                return { success: false, error: response.message };
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Login failed'
            };
        } finally {
            setLoading(false);
            console.debug('🔐 Login process completed');
        }
    };

    const logout = useCallback(async () => {
        console.debug('🚪 Logout function called');
        setLoading(true);
        try {
            await AuthService.logout();
        } catch (error) {
            console.error('❌ Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            console.debug('🔀 Redirecting to login page');
            router.push('/login');
            setLoading(false);
            console.debug('🚪 Logout process completed');
        }
    }, [router]);

    const refreshToken = useCallback(async () => {
        console.debug('🔄 Manual token refresh called');
        try {
            const response = await AuthService.refreshToken();
            if (response.success) {
                AuthService.storeTokens(
                    response.data.token,
                    response.data.refreshToken
                );
                AuthService.storeUserData(response.data.user);
                setUser(response.data.user);
                console.debug('✅ Manual token refresh successful');
                return { success: true };
            }
            console.warn('⚠️ Manual refresh response not successful');
            return { success: false };
        } catch (error) {
            console.error('❌ Manual token refresh failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Token refresh failed'
            };
        }
    }, []);

    console.debug('🔄 useAuth state update:', {
        user: user?.email,
        isAuthenticated,
        loading
    });

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