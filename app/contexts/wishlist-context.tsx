// app/contexts/wishlist-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { WishlistService } from '@/app/lib/api/wishlist-service';
import { WishlistItem } from '@/app/lib/types/wishlist';

interface WishlistContextType {
    wishlistItems: WishlistItem[];
    wishlistCount: number;
    loading: boolean;
    error: string | null;
    addToWishlist: (productId: number, notes?: string) => Promise<void>;
    removeFromWishlist: (productId: number) => Promise<void>;
    toggleWishlist: (productId: number, notes?: string) => Promise<boolean>;
    isInWishlist: (productId: number) => boolean;
    refreshWishlist: () => Promise<void>;
    clearError: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

interface WishlistProviderProps {
    children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, user } = useAuth();

    const getCurrentCustomerId = (): number | null => {
        if (!isAuthenticated || !user) return null;

        // Check if user is a customer
        const isCustomer = user.role?.name === 'CUSTOMER';
        if (!isCustomer) return null;

        // Return customerId if available, otherwise use userId as fallback
        // Note: You might need to adjust this based on your actual API response
        return user.customerId || user.id || null;
    };

    const loadWishlist = async () => {
        const customerId = getCurrentCustomerId();
        if (!customerId) {
            setWishlistItems([]);
            setWishlistCount(0);
            return;
        }

        try {
            setLoading(true);
            const response = await WishlistService.getWishlist(customerId);
            if (response.success && response.data) {
                setWishlistItems(response.data.items);
                setWishlistCount(response.data.totalItems);
            }
        } catch (err) {
            console.error('Error loading wishlist:', err);
            setError('Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    const loadWishlistCount = async () => {
        const customerId = getCurrentCustomerId();
        if (!customerId) {
            setWishlistCount(0);
            return;
        }

        try {
            const count = await WishlistService.getWishlistCount(customerId);
            setWishlistCount(count);
        } catch (err) {
            console.error('Error loading wishlist count:', err);
        }
    };

    const addToWishlist = async (productId: number, notes?: string) => {
        const customerId = getCurrentCustomerId();
        if (!customerId) {
            setError('Please login to add items to wishlist');
            return;
        }

        try {
            setLoading(true);
            await WishlistService.addToWishlist(customerId, { productId, notes });
            await loadWishlist();
        } catch (err) {
            console.error('Error adding to wishlist:', err);
            setError('Failed to add item to wishlist');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId: number) => {
        const customerId = getCurrentCustomerId();
        if (!customerId) return;

        try {
            setLoading(true);
            await WishlistService.removeFromWishlist(customerId, productId);
            await loadWishlist();
        } catch (err) {
            console.error('Error removing from wishlist:', err);
            setError('Failed to remove item from wishlist');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const toggleWishlist = async (productId: number, notes?: string): Promise<boolean> => {
        const customerId = getCurrentCustomerId();
        if (!customerId) {
            setError('Please login to manage wishlist');
            return false;
        }

        try {
            setLoading(true);
            const result = await WishlistService.toggleWishlist(customerId, productId, notes);
            await loadWishlist();
            return result.isInWishlist;
        } catch (err) {
            console.error('Error toggling wishlist:', err);
            setError('Failed to update wishlist');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const isInWishlist = (productId: number): boolean => {
        return wishlistItems.some(item => item.productId === productId);
    };

    const refreshWishlist = async () => {
        await loadWishlist();
    };

    const clearError = () => {
        setError(null);
    };

    useEffect(() => {
        if (isAuthenticated) {
            loadWishlist();
        } else {
            setWishlistItems([]);
            setWishlistCount(0);
        }
    }, [isAuthenticated]);

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                wishlistCount,
                loading,
                error,
                addToWishlist,
                removeFromWishlist,
                toggleWishlist,
                isInWishlist,
                refreshWishlist,
                clearError,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};