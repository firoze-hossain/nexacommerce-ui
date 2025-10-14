// app/components/customers/cart-sidebar.tsx - COMPLETE UPDATED VERSION
'use client';

import { useState, useEffect } from 'react';
import { CartService } from '@/app/lib/api/cart-service';
import { CartResponse, CartItemResponse } from '@/app/lib/types/cart';
import { useAuth } from '@/app/hooks/useAuth';
import Link from 'next/link';

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onCartUpdate?: () => void;
}

export default function CartSidebar({
                                        isOpen,
                                        onClose,
                                        onCartUpdate,
                                    }: CartSidebarProps) {
    const { isAuthenticated, user } = useAuth();
    const [cart, setCart] = useState<CartResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

    // Load cart data when sidebar opens or authentication changes
    useEffect(() => {
        if (isOpen) {
            loadCart();
        }
    }, [isOpen, isAuthenticated]);

    const loadCart = async () => {
        try {
            setLoading(true);
            setError(null);

            let response;

            if (isAuthenticated) {
                response = await CartService.getMyCart();
            } else {
                const sessionId = getSessionId();
                if (!sessionId) {
                    setCart(null);
                    return;
                }
                response = await CartService.getGuestCart(sessionId);
            }

            if (response.success) {
                setCart(response.data);
            } else {
                setError(response.message || 'Failed to load cart');
            }
        } catch (err) {
            console.error('Error loading cart:', err);
            setError('Failed to load cart. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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

    const updateQuantity = async (productId: number, newQuantity: number) => {
        if (newQuantity < 0) return;

        try {
            setUpdatingItems(prev => new Set(prev).add(productId));
            setError(null);

            let response;

            if (isAuthenticated) {
                response = await CartService.updateCartItem(productId, newQuantity);
            } else {
                const sessionId = getSessionId();
                response = await CartService.updateGuestCartItem(sessionId, productId, newQuantity);
            }

            if (response.success) {
                setCart(response.data);
                // Notify parent component about cart update
                if (onCartUpdate) {
                    onCartUpdate();
                }
            } else {
                setError(response.message || 'Failed to update quantity');
                await loadCart();
            }
        } catch (err) {
            console.error('Error updating quantity:', err);
            setError('Failed to update quantity. Please try again.');
            await loadCart();
        } finally {
            setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
        }
    };

    const removeItem = async (productId: number) => {
        try {
            setUpdatingItems(prev => new Set(prev).add(productId));
            setError(null);

            let response;

            if (isAuthenticated) {
                response = await CartService.removeItemFromCart(productId);
            } else {
                const sessionId = getSessionId();
                response = await CartService.removeItemFromGuestCart(sessionId, productId);
            }

            if (response.success) {
                setCart(response.data);
                // Notify parent component about cart update
                if (onCartUpdate) {
                    onCartUpdate();
                }
            } else {
                setError(response.message || 'Failed to remove item');
                await loadCart();
            }
        } catch (err) {
            console.error('Error removing item:', err);
            setError('Failed to remove item. Please try again.');
            await loadCart();
        } finally {
            setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
        }
    };

    const clearCart = async () => {
        try {
            setLoading(true);
            setError(null);

            let response;

            if (isAuthenticated) {
                response = await CartService.clearCart();
            } else {
                const sessionId = getSessionId();
                response = await CartService.clearGuestCart(sessionId);
            }

            if (response.success) {
                setCart(null);
                // Notify parent component about cart update
                if (onCartUpdate) {
                    onCartUpdate();
                }
            } else {
                setError(response.message || 'Failed to clear cart');
                await loadCart();
            }
        } catch (err) {
            console.error('Error clearing cart:', err);
            setError('Failed to clear cart. Please try again.');
            await loadCart();
        } finally {
            setLoading(false);
        }
    };

    const getTotalItems = () => {
        return cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
    };

    const getTotalAmount = () => {
        return cart?.totalAmount || 0;
    };

    const isUpdating = (productId: number) => updatingItems.has(productId);

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 backdrop-blur-[0.5px] z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            disabled={loading}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="text-red-600 text-xs mt-1 hover:text-red-800"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {/* Cart Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading cart...</p>
                            </div>
                        ) : !cart || cart.items.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🛒</div>
                                <p className="text-gray-600 mb-4">Your cart is empty</p>
                                <button
                                    onClick={onClose}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.items.map((item: CartItemResponse) => (
                                    <div
                                        key={item.id}
                                        className={`flex items-center space-x-4 p-4 border border-gray-200 rounded-lg ${
                                            isUpdating(item.productId) ? 'opacity-50' : ''
                                        }`}
                                    >
                                        <img
                                            src={item.productImage || '/api/placeholder/80/80'}
                                            alt={item.productName}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                                                {item.productName}
                                            </h3>
                                            <p className="text-gray-600 text-sm">${item.price.toFixed(2)}</p>
                                            {item.discountAmount > 0 && (
                                                <p className="text-green-600 text-xs">
                                                    Save ${item.discountAmount.toFixed(2)}
                                                </p>
                                            )}
                                            <div className="flex items-center space-x-2 mt-2">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    disabled={isUpdating(item.productId) || item.quantity <= 1}
                                                    className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    -
                                                </button>
                                                <span className="text-sm font-medium min-w-8 text-center">
                                                    {isUpdating(item.productId) ? '...' : item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    disabled={isUpdating(item.productId) || !item.inStock}
                                                    className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            {item.lowStock && (
                                                <p className="text-orange-600 text-xs mt-1">Low stock</p>
                                            )}
                                            {!item.inStock && (
                                                <p className="text-red-600 text-xs mt-1">Out of stock</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">
                                                ${item.subtotal.toFixed(2)}
                                            </p>
                                            <button
                                                onClick={() => removeItem(item.productId)}
                                                disabled={isUpdating(item.productId)}
                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {cart && cart.items.length > 0 && (
                        <div className="border-t border-gray-200 p-6">
                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Items:</span>
                                    <span className="text-gray-900">{getTotalItems()}</span>
                                </div>
                                {cart.totalDiscount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Discount:</span>
                                        <span className="text-green-600">-${cart.totalDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center border-t pt-2">
                                    <span className="text-gray-600 font-semibold">Total:</span>
                                    <span className="text-lg font-bold text-gray-900">
                                        ${getTotalAmount().toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                Proceed to Checkout
                            </Link>

                            <div className="flex space-x-2">
                                <button
                                    onClick={clearCart}
                                    disabled={loading}
                                    className="flex-1 border border-red-300 text-red-600 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                    Clear Cart
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}