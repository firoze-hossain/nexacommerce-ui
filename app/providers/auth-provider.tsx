// app/providers/auth-provider.tsx - CORRECTED
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/app/hooks/useAuth'; // Named import

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within AuthProvider');
    }
    return context;
}