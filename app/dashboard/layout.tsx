// app/dashboard/layout.tsx - UPDATED
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import DashboardSidebar from '@/app/components/dashboard/sidebar';
import DashboardHeader from '@/app/components/dashboard/header';

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, user, loading } = useAuth();
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        if (!loading) {
            setIsCheckingAuth(false);

            // Only redirect if we're sure about the auth state
            if (!isAuthenticated) {
                console.log('🚫 Not authenticated, redirecting to login');
                router.replace('/login');
            } else if (user?.role?.name === 'CUSTOMER') {
                console.log('👤 Customer role, redirecting to home');
                router.replace('/');
            }
        }
    }, [loading, isAuthenticated, user, router]);

    // Show loading spinner while checking auth
    if (isCheckingAuth || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Don't render dashboard for unauthenticated users or customers
    if (!isAuthenticated || user?.role?.name === 'CUSTOMER') {
        return null;
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader />
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}