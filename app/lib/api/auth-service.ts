// lib/api/auth-service.ts
import {LoginRequest, LoginResponse} from '@/app/lib/types/auth';

const API_BASE_URL = 'http://localhost:8090/api/v1/nexa';

export class AuthService {
    static async login(credentials: LoginRequest): Promise<LoginResponse> {
        console.debug('🔐 Login attempt:', { email: credentials.email });

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Login failed:', { status: response.status, errorData });
            throw new Error(errorData.message || `Login failed: ${response.statusText}`);
        }

        const loginResponse = await response.json();
        console.debug('✅ Login successful:', { success: loginResponse.success });

        // Store tokens properly
        if (loginResponse.success && loginResponse.data) {
            this.storeTokens(
                loginResponse.data.token,
                loginResponse.data.refreshToken
            );
            this.storeUserData(loginResponse.data.user);
            console.debug('📦 Tokens stored successfully');
        }

        return loginResponse;
    }

    static async refreshToken(): Promise<LoginResponse> {
        const refreshToken = this.getRefreshToken();
        console.debug('🔄 Refresh token attempt:', {
            hasRefreshToken: !!refreshToken,
            refreshTokenLength: refreshToken?.length
        });

        if (!refreshToken) {
            console.error('❌ No refresh token available');
            throw new Error('No refresh token available');
        }

        try {
            const url = `${API_BASE_URL}/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`;
            console.debug('🌐 Refresh API call:', { url: url.substring(0, 100) + '...' });

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.debug('📡 Refresh response:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                let errorMessage = `Token refresh failed: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    console.error('❌ Refresh error details:', errorData);
                    errorMessage = errorData.message || errorData.error || errorMessage;

                    // Check for specific backend errors
                    if (errorData.data) {
                        console.error('🔍 Backend error data:', errorData.data);
                    }
                } catch (parseError) {
                    console.error('❌ Could not parse error response:', parseError);
                    // Try to get text if not JSON
                    try {
                        const text = await response.text();
                        console.error('📄 Raw error response:', text);
                    } catch (textError) {
                        console.error('❌ Could not read response text');
                    }
                }
                throw new Error(errorMessage);
            }

            const refreshResponse = await response.json();
            console.debug('✅ Refresh successful:', {
                success: refreshResponse.success,
                hasNewToken: !!refreshResponse.data?.token,
                hasNewRefreshToken: !!refreshResponse.data?.refreshToken
            });

            // Store new tokens if refresh was successful
            if (refreshResponse.success && refreshResponse.data) {
                this.storeTokens(
                    refreshResponse.data.token,
                    refreshResponse.data.refreshToken
                );
                this.storeUserData(refreshResponse.data.user);
                console.debug('📦 New tokens stored successfully');
            } else {
                console.warn('⚠️ Refresh response missing data:', refreshResponse);
            }

            return refreshResponse;
        } catch (error) {
            console.error('💥 Refresh token process failed:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Token refresh failed: Unknown error');
        }
    }

    static async logout(): Promise<void> {
        const token = this.getToken();
        console.debug('🚪 Logout initiated:', { hasToken: !!token });

        // Call logout API if token exists
        if (token) {
            try {
                console.debug('🌐 Calling logout API...');
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json',
                    },
                });
                console.debug('✅ Logout API call successful');
            } catch (error) {
                console.error('❌ Logout API call failed:', error);
                // Continue with client-side logout even if API call fails
            }
        }

        // Always clear local storage
        this.clearTokens();
        console.debug('🧹 Local storage cleared');
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

            console.debug('💾 Tokens stored:', {
                tokenLength: tokenWithBearer.length,
                refreshTokenLength: refreshToken.length,
                expiresAt: new Date(expiresIn).toISOString()
            });
        }
    }

    static getToken(): string | null {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('auth_token');
            // Ensure token has Bearer prefix
            const formattedToken = token && !token.startsWith('Bearer ') ? `Bearer ${token}` : token;
            console.debug('🔍 Token retrieved:', { exists: !!formattedToken });
            return formattedToken;
        }
        return null;
    }

    static getRefreshToken(): string | null {
        if (typeof window !== 'undefined') {
            const refreshToken = localStorage.getItem('refresh_token');
            console.debug('🔍 Refresh token retrieved:', {
                exists: !!refreshToken,
                length: refreshToken?.length
            });
            return refreshToken;
        }
        return null;
    }

    static clearTokens() {
        if (typeof window !== 'undefined') {
            console.debug('🗑️ Clearing all tokens from storage');
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
            console.debug('👤 User data stored:', { userId: user?.id, email: user?.email });
        }
    }

    static getUserData(): any {
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem('user_data');
            const parsedData = userData ? JSON.parse(userData) : null;
            console.debug('🔍 User data retrieved:', { exists: !!parsedData });
            return parsedData;
        }
        return null;
    }

    static isTokenExpired(): boolean {
        if (typeof window !== 'undefined') {
            const expires = localStorage.getItem('token_expires');
            const isExpired = !expires || Date.now() >= parseInt(expires);
            console.debug('⏰ Token expiry check:', {
                expires: expires ? new Date(parseInt(expires)).toISOString() : 'none',
                isExpired
            });
            return isExpired;
        }
        return true;
    }

    static shouldRefreshToken(): boolean {
        if (typeof window !== 'undefined') {
            const expires = localStorage.getItem('token_expires');
            if (!expires) {
                console.debug('⏰ No expiry time found');
                return false;
            }

            // Refresh if token expires in less than 5 minutes
            const timeUntilExpiry = parseInt(expires) - Date.now();
            const shouldRefresh = timeUntilExpiry < (5 * 60 * 1000);

            console.debug('⏰ Token refresh check:', {
                timeUntilExpiry: Math.round(timeUntilExpiry / 1000) + 's',
                shouldRefresh
            });

            return shouldRefresh;
        }
        return false;
    }

    // Enhanced fetch with automatic token refresh
    static async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
        console.debug('🌐 fetchWithAuth called:', { url, method: options.method });

        let token = this.getToken();

        // Refresh token if needed before making the request
        if (this.shouldRefreshToken()) {
            console.debug('🔄 Pre-request token refresh needed');
            try {
                await this.refreshToken();
                token = this.getToken(); // Get the new token
                console.debug('✅ Pre-request refresh successful');
            } catch (error) {
                console.error('❌ Pre-request refresh failed:', error);
                // Don't throw here, let the 401 handling deal with it
            }
        }

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            (headers as any)['Authorization'] = token;
            console.debug('🔑 Adding authorization header');
        }

        console.debug('🌐 Making initial request...');
        let response = await fetch(url, {
            ...options,
            headers,
        });

        console.debug('📡 Initial response:', {
            status: response.status,
            ok: response.ok
        });

        // If token is expired, try to refresh and retry
        if (response.status === 401) {
            console.debug('🔐 401 received, attempting token refresh...');
            try {
                await this.refreshToken();
                const newToken = this.getToken();

                if (newToken) {
                    console.debug('🔄 Retrying request with new token');
                    (headers as any)['Authorization'] = newToken;
                    response = await fetch(url, {
                        ...options,
                        headers,
                    });
                    console.debug('📡 Retry response:', { status: response.status });
                } else {
                    console.error('❌ No new token after refresh');
                    this.clearTokens();
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }
                    throw new Error('Authentication failed');
                }
            } catch (error) {
                console.error('❌ Token refresh failed after 401:', error);
                this.clearTokens();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                throw error;
            }
        }

        console.debug('✅ fetchWithAuth completed successfully');
        return response;
    }
}