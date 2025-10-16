// app/wishlist/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/app/contexts/wishlist-context';
import { useAuth } from '@/app/hooks/useAuth';
import Header from '@/app/components/customers/header';
import Footer from '@/app/components/customers/footer';
import CartSidebar from '@/app/components/customers/cart-sidebar';
import WishlistButton from '@/app/components/customers/wishlist-button';
import { formatCurrency } from '@/app/lib/utils/formatters';
import { CartService } from '@/app/lib/api/cart-service';
import { CartItemRequest } from '@/app/lib/types/cart';

export default function WishlistPage() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [addingToCart, setAddingToCart] = useState<number | null>(null);
    const { wishlistItems, loading, error, removeFromWishlist, refreshWishlist } = useWishlist();
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        loadCartItemCount();
    }, []);

    const getSessionId = (): string => {
        if (typeof window !== 'undefined') {
            let sessionId = localStorage.getItem('guestSessionId');
            if (!sessionId) {
                sessionId = 'guest-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('guestSessionId', sessionId);
            }
            return sessionId;
        }
        return '';
    };

    const loadCartItemCount = async () => {
        try {
            let response;

            if (isAuthenticated) {
                response = await CartService.getMyCart();
            } else {
                const sessionId = getSessionId();
                if (!sessionId) {
                    setCartItemCount(0);
                    return;
                }
                response = await CartService.getGuestCart(sessionId);
            }

            if (response.success && response.data) {
                const totalItems = response.data.items.reduce((total: number, item: any) => total + item.quantity, 0);
                setCartItemCount(totalItems);
            } else {
                setCartItemCount(0);
            }
        } catch (error) {
            console.error('Error loading cart item count:', error);
            setCartItemCount(0);
        }
    };

    const addToCart = async (productId: number) => {
        try {
            setAddingToCart(productId);

            const request: CartItemRequest = {
                productId: productId,
                quantity: 1
            };

            let response;

            if (isAuthenticated) {
                response = await CartService.addItemToCart(request);
            } else {
                const sessionId = getSessionId();
                response = await CartService.addItemToGuestCart(sessionId, request);
            }

            if (response.success) {
                await loadCartItemCount();
                setIsCartOpen(true);
            }
        } catch (error) {
            console.error('Error adding product to cart:', error);
        } finally {
            setAddingToCart(null);
        }
    };

    const handleCartUpdate = () => {
        loadCartItemCount();
    };

    const handleRemoveFromWishlist = async (productId: number) => {
        try {
            await removeFromWishlist(productId);
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
    };

    const handleMoveAllToCart = async () => {
        for (const item of wishlistItems) {
            try {
                await addToCart(item.productId);
            } catch (error) {
                console.error(`Error adding product ${item.productId} to cart:`, error);
            }
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header cartItemCount={cartItemCount} onCartClick={() => setIsCartOpen(true)} />
                <div className="flex items-center justify-center py-16">
                    <div className="text-center max-w-md mx-auto">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
                        <p className="text-gray-600 mb-6">Please sign in to view your wishlist and save your favorite items.</p>
                        <Link
                            href="/login"
                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header cartItemCount={cartItemCount} onCartClick={() => setIsCartOpen(true)} />

            <main className="py-8">
                <div className="container mx-auto px-4">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
                                <p className="text-gray-600">
                                    {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
                                </p>
                            </div>
                            {wishlistItems.length > 0 && (
                                <button
                                    onClick={handleMoveAllToCart}
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                >
                                    Move All to Cart
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-red-800 text-sm font-medium">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Wishlist Content */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, index) => (
                                <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 animate-pulse">
                                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                </div>
                            ))}
                        </div>
                    ) : wishlistItems.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                            <p className="text-gray-600 mb-6">Start adding items you love to your wishlist</p>
                            <Link
                                href="/products"
                                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                            >
                                Browse Products
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {wishlistItems.map((item) => (
                                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                    {/* Product Image */}
                                    <Link href={`/products/${item.productId}`}>
                                        <div className="relative overflow-hidden bg-gray-100">
                                            <img
                                                src={item.productImage || '/api/placeholder/300/300'}
                                                alt={item.productName}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute top-3 right-3">
                                                <WishlistButton
                                                    productId={item.productId}
                                                    size="sm"
                                                    variant="icon"
                                                    className="bg-white/90 backdrop-blur-sm"
                                                    onToggle={() => refreshWishlist()}
                                                />
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <Link href={`/products/${item.productId}`}>
                                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                                {item.productName}
                                            </h3>
                                        </Link>

                                        {/* Price */}
                                        <div className="flex items-center space-x-2 mb-4">
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(item.productPrice)}
                      </span>
                                        </div>

                                        {/* Notes */}
                                        {item.notes && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                                                    {item.notes}
                                                </p>
                                            </div>
                                        )}

                                        {/* Added Date */}
                                        <div className="text-xs text-gray-500 mb-4">
                                            Added {new Date(item.addedAt).toLocaleDateString()}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => addToCart(item.productId)}
                                                disabled={addingToCart === item.productId}
                                                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                            >
                                                {addingToCart === item.productId ? (
                                                    <div className="flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Adding...
                                                    </div>
                                                ) : (
                                                    'Add to Cart'
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleRemoveFromWishlist(item.productId)}
                                                className="px-3 py-2 text-gray-600 hover:text-red-600 transition-colors"
                                                title="Remove from wishlist"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />

            <CartSidebar
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                onCartUpdate={handleCartUpdate}
            />
        </div>
    );
}