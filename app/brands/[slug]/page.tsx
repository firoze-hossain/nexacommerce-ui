// app/brands/[slug]/page.tsx - UPDATED WITH WISHLIST
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Brand } from '@/app/lib/types/brand';
import { Product } from '@/app/lib/types/product';
import { BrandService } from '@/app/lib/api/brand-service';
import { ProductService } from '@/app/lib/api/product-service';
import { CartService } from '@/app/lib/api/cart-service';
import { CartItemRequest } from '@/app/lib/types/cart';
import { useAuth } from '@/app/hooks/useAuth';
import Header from '@/app/components/customers/header';
import Footer from '@/app/components/customers/footer';
import CartSidebar from '@/app/components/customers/cart-sidebar';
import WishlistButton from '@/app/components/customers/wishlist-button';
import { formatCurrency } from '@/app/lib/utils/formatters';
import Link from 'next/link';

export default function BrandPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [brand, setBrand] = useState<Brand | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [addingToCart, setAddingToCart] = useState<number | null>(null);
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        if (slug) {
            loadBrand();
            loadCartItemCount();
        }
    }, [slug]);

    const loadBrand = async () => {
        try {
            setLoading(true);
            // Try to get brand by slug first, then by ID
            let response;
            if (isNaN(Number(slug))) {
                response = await BrandService.getBrandBySlug(slug);
            } else {
                response = await BrandService.getBrandById(Number(slug));
            }

            if (response.success && response.data) {
                setBrand(response.data);
                loadBrandProducts(response.data.id);
            } else {
                setError('Brand not found');
            }
        } catch (error) {
            console.error('Error loading brand:', error);
            setError('Failed to load brand');
            setLoading(false);
        }
    };

    const loadBrandProducts = async (brandId: number) => {
        try {
            // You'll need to add this method to your ProductService
            const response = await ProductService.getProductsByBrand(brandId, 0, 50);
            if (response.success && response.data) {
                setProducts(response.data.items);
            }
        } catch (error) {
            console.error('Error loading brand products:', error);
            setError('Failed to load products');
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

    const addToCart = async (product: Product) => {
        try {
            setAddingToCart(product.id);
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
                    <p className="mt-4 text-gray-600">Loading brand...</p>
                </div>
            </div>
        );
    }

    if (!brand) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Brand Not Found</h1>
                    <p className="text-gray-600">The brand you're looking for doesn't exist.</p>
                    <Link href="/brands" className="text-indigo-600 hover:text-indigo-500 mt-4 inline-block">
                        ← Back to Brands
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
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

            <main className="py-8">
                <div className="container mx-auto px-4">
                    {/* Breadcrumb */}
                    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
                        <Link href="/" className="hover:text-indigo-600">Home</Link>
                        <span>›</span>
                        <Link href="/brands" className="hover:text-indigo-600">Brands</Link>
                        <span>›</span>
                        <span className="text-gray-900">{brand.name}</span>
                    </nav>

                    {/* Brand Header */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            {/* Brand Logo */}
                            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center">
                                {brand.logoUrl ? (
                                    <img
                                        src={brand.logoUrl}
                                        alt={brand.name}
                                        className="w-16 h-16 object-contain"
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-xl">
                                            {brand.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Brand Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{brand.name}</h1>
                                {brand.description && (
                                    <p className="text-gray-600 text-lg mb-4">
                                        {brand.description}
                                    </p>
                                )}
                                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm text-gray-500">
                                    <span>{products.length} products available</span>
                                    {brand.featured && (
                                        <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full text-xs font-medium">
                                            Featured Brand
                                        </span>
                                    )}
                                    {brand.websiteUrl && (
                                        <a
                                            href={brand.websiteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:text-indigo-500"
                                        >
                                            Visit Website
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Products by {brand.name}</h2>

                        {products.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
                                <p className="text-gray-600">Products will be available soon from this brand.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map((product) => {
                                    const isAdding = addingToCart === product.id;

                                    return (
                                        <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group relative">

                                            {/* Wishlist Button - Top Right */}
                                            <div className="absolute top-3 right-3 z-10">
                                                <WishlistButton
                                                    productId={product.id}
                                                    size="sm"
                                                    variant="icon"
                                                    className="bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                                                />
                                            </div>

                                            <Link href={`/products/${product.id}`}>
                                                <div className="relative overflow-hidden bg-gray-100">
                                                    <img
                                                        src={product.images?.[0]?.imageUrl || '/api/placeholder/300/300'}
                                                        alt={product.name}
                                                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    {product.featured && (
                                                        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                                            Featured
                                                        </div>
                                                    )}
                                                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                                                        <div className="absolute top-10 left-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                                            {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>

                                            <div className="p-4">
                                                <Link href={`/products/${product.id}`}>
                                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                                        {product.name}
                                                    </h3>
                                                </Link>

                                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                    {product.shortDescription || product.description}
                                                </p>

                                                {/* Price */}
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <span className="text-lg font-bold text-gray-900">
                                                        {formatCurrency(product.price)}
                                                    </span>
                                                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                                                        <span className="text-sm text-gray-500 line-through">
                                                            {formatCurrency(product.compareAtPrice)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Stock Status */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                                                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                                                    </span>
                                                    {product.lowStock && (
                                                        <span className="text-sm text-orange-600">Low Stock</span>
                                                    )}
                                                </div>

                                                {/* Add to Cart Button */}
                                                <button
                                                    onClick={() => addToCart(product)}
                                                    disabled={!product.inStock || isAdding}
                                                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                                                        !product.inStock
                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            : isAdding
                                                                ? 'bg-indigo-400 text-white cursor-wait'
                                                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                    }`}
                                                >
                                                    {isAdding ? (
                                                        <div className="flex items-center justify-center">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                            Adding...
                                                        </div>
                                                    ) : product.inStock ? 'Add to Cart' : 'Out of Stock'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
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