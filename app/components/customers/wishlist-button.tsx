// app/components/customers/wishlist-button.tsx
'use client';

import { useState } from 'react';
import { useWishlist } from '@/app/contexts/wishlist-context';
import { useAuth } from '@/app/hooks/useAuth';

interface WishlistButtonProps {
    productId: number;
    productName?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'icon' | 'text' | 'both';
    className?: string;
    onToggle?: (isInWishlist: boolean) => void;
}

export default function WishlistButton({
                                           productId,
                                           productName,
                                           size = 'md',
                                           variant = 'icon',
                                           className = '',
                                           onToggle
                                       }: WishlistButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { isAuthenticated } = useAuth();

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            // You can redirect to login or show a login modal here
            alert('Please login to add items to your wishlist');
            return;
        }

        try {
            setIsLoading(true);
            const newState = await toggleWishlist(productId);
            onToggle?.(newState);
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const sizeClasses = {
        sm: 'p-1.5 text-sm',
        md: 'p-2 text-base',
        lg: 'p-3 text-lg'
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    const isInWishlistState = isInWishlist(productId);

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={`
        inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200
        ${sizeClasses[size]}
        ${isInWishlistState
                ? 'text-red-600 bg-red-50 hover:bg-red-100 border border-red-200'
                : 'text-gray-600 bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
            }
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
            title={isInWishlistState ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            {isLoading ? (
                <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${iconSizes[size]}`} />
            ) : (
                <svg
                    className={`${iconSizes[size]} ${isInWishlistState ? 'fill-current' : ''}`}
                    fill={isInWishlistState ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </svg>
            )}

            {(variant === 'text' || variant === 'both') && (
                <span className="whitespace-nowrap">
          {isInWishlistState ? 'Saved' : 'Save'}
        </span>
            )}
        </button>
    );
}