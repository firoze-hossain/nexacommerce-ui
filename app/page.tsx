// app/page.tsx - COMPLETE UPDATED VERSION
'use client';

import { useEffect, useState } from 'react';
import Header from '@/app/components/customers/header';
import HeroSection from '@/app/components/customers/hero-section';
import CategorySection from '@/app/components/customers/category-section';
import FeaturedProducts from '@/app/components/customers/featured-products';
import HotDeals from '@/app/components/customers/hot-deals';
import BrandSection from '@/app/components/customers/brand-section';
import Footer from '@/app/components/customers/footer';
import CartSidebar from '@/app/components/customers/cart-sidebar';
import { Product } from '@/app/lib/types/product';
import { Category } from '@/app/lib/types/category';
import { HotDeal } from '@/app/lib/types/hot-deal';
import { useAuth } from '@/app/hooks/useAuth';
import { ProductService } from '@/app/lib/api/product-service';
import { CategoryService } from '@/app/lib/api/category-service';
import { CartService } from '@/app/lib/api/cart-service';
import { CartItemRequest } from '@/app/lib/types/cart';

export default function HomePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const { isAuthenticated, user } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [addingToCart, setAddingToCart] = useState<{ productId: number, hotDealId?: number } | null>(null);

    useEffect(() => {
        loadInitialData();
        loadCartItemCount();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load featured products
            const featuredResponse = await ProductService.getFeaturedProducts();
            if (featuredResponse.success && featuredResponse.data) {
                setFeaturedProducts(featuredResponse.data);
            }

            // Load latest products for featured products section
            const latestResponse = await ProductService.getAllProducts(0, 8, 'createdAt', 'desc');
            if (latestResponse.success && latestResponse.data) {
                setProducts(latestResponse.data.items);
            }

            // Load categories
            const categoriesResponse = await CategoryService.getCategories(0, 8);
            if (categoriesResponse.success && categoriesResponse.data) {
                console.log('Categories with product counts:', categoriesResponse.data.items.map(cat => ({
                    name: cat.name,
                    productCount: cat.productCount,
                    hasProductCount: cat.productCount !== undefined && cat.productCount !== null
                })));
                setCategories(categoriesResponse.data.items);
            }

        } catch (error) {
            console.error('Error loading data:', error);
            setError('Failed to load data. Please try again later.');
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

    const addToCart = async (product: Product, hotDeal?: HotDeal) => {
        try {
            setAddingToCart({ productId: product.id, hotDealId: hotDeal?.id });
            setError(null);

            const request: CartItemRequest = {
                productId: product.id,
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
                // Update cart item count
                const totalItems = response.data.items.reduce((total: number, item: any) => total + item.quantity, 0);
                setCartItemCount(totalItems);

                // Show success feedback
                console.log('Product added to cart successfully');

                // Open cart sidebar automatically
                setIsCartOpen(true);
            } else {
                setError(response.message || 'Failed to add product to cart');
            }
        } catch (error) {
            console.error('Error adding product to cart:', error);
            setError('Failed to add product to cart. Please try again.');
        } finally {
            setAddingToCart(null);
        }
    };

    const handleCartUpdate = () => {
        // Refresh cart item count when cart is updated from sidebar
        loadCartItemCount();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                        <div className="ml-auto pl-3">
                            <div className="-mx-1.5 -my-1.5">
                                <button
                                    onClick={() => setError(null)}
                                    className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                                >
                                    <span className="sr-only">Dismiss</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Header
                cartItemCount={cartItemCount}
                onCartClick={() => setIsCartOpen(true)}
            />

            <main>
                <HeroSection />
                <CategorySection categories={categories} />
                <FeaturedProducts
                    products={products}
                    onAddToCart={addToCart}
                    addingToCart={addingToCart?.productId || null}
                />
                <HotDeals
                    onAddToCart={addToCart}
                    addingToCart={addingToCart}
                />
                <BrandSection />
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