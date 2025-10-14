// app/brands/page.tsx - UPDATED VERSION
'use client';

import { useState, useEffect } from 'react';
import { Brand } from '@/app/lib/types/brand';
import { BrandService } from '@/app/lib/api/brand-service';
import { CartService } from '@/app/lib/api/cart-service';
import { useAuth } from '@/app/hooks/useAuth';
import Header from '@/app/components/customers/header';
import Footer from '@/app/components/customers/footer';
import CartSidebar from '@/app/components/customers/cart-sidebar';
import Link from 'next/link';

export default function BrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [featuredBrands, setFeaturedBrands] = useState<Brand[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        loadBrands();
        loadFeaturedBrands();
        loadCartItemCount();
    }, [sortBy]);

    const loadBrands = async () => {
        try {
            const response = await BrandService.getBrands(0, 100, sortBy, 'asc');
            if (response.success && response.data) {
                setBrands(response.data.items);
            }
        } catch (error) {
            console.error('Error loading brands:', error);
            setError('Failed to load brands');
        }
    };

    const loadFeaturedBrands = async () => {
        try {
            const response = await BrandService.getFeaturedBrands();
            if (response.success && response.data) {
                setFeaturedBrands(response.data);
            }
        } catch (error) {
            console.error('Error loading featured brands:', error);
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

    const handleCartUpdate = () => {
        // Refresh cart item count when cart is updated from sidebar
        loadCartItemCount();
    };

    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getBrandInitial = (brandName: string) => {
        return brandName.charAt(0).toUpperCase();
    };

    const getBrandColor = (brandName: string) => {
        const colors = [
            'bg-gradient-to-r from-blue-500 to-blue-600',
            'bg-gradient-to-r from-green-500 to-green-600',
            'bg-gradient-to-r from-purple-500 to-purple-600',
            'bg-gradient-to-r from-orange-500 to-orange-600',
            'bg-gradient-to-r from-pink-500 to-pink-600',
            'bg-gradient-to-r from-indigo-500 to-indigo-600',
            'bg-gradient-to-r from-teal-500 to-teal-600',
            'bg-gradient-to-r from-red-500 to-red-600',
            'bg-gradient-to-r from-amber-500 to-amber-600',
            'bg-gradient-to-r from-cyan-500 to-cyan-600'
        ];

        const index = brandName.charCodeAt(0) % colors.length;
        return colors[index];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header cartItemCount={cartItemCount} onCartClick={() => setIsCartOpen(true)} />
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-12"></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {[...Array(12)].map((_, index) => (
                                <div key={index} className="bg-white rounded-2xl p-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <Footer />
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
                    {/* Page Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Shop by Brand</h1>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Discover products from trusted brands you know and love
                        </p>
                    </div>

                    {/* Search and Sort */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            <div className="flex-1 w-full md:w-auto">
                                <input
                                    type="text"
                                    placeholder="Search brands..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-600">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="name">Name (A-Z)</option>
                                    <option value="productCount">Popularity</option>
                                    <option value="createdAt">Newest</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Featured Brands */}
                    {featuredBrands.length > 0 && (
                        <div className="mb-16">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Featured Brands</h2>
                                <div className="w-12 h-1 bg-indigo-600 rounded-full"></div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {featuredBrands.slice(0, 8).map((brand) => (
                                    <Link
                                        key={brand.id}
                                        href={`/brands/${brand.slug || brand.id}`}
                                        className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-xl hover:border-indigo-300 transition-all duration-300 hover:scale-105"
                                    >
                                        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-50 transition-colors">
                                            {brand.logoUrl ? (
                                                <img
                                                    src={brand.logoUrl}
                                                    alt={brand.name}
                                                    className="w-12 h-12 object-contain"
                                                />
                                            ) : (
                                                <div className={`w-12 h-12 ${getBrandColor(brand.name)} rounded-lg flex items-center justify-center`}>
                                                    <span className="text-white font-bold text-lg">
                                                        {getBrandInitial(brand.name)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-indigo-600 transition-colors">
                                            {brand.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {brand.description || 'Premium quality products'}
                                        </p>
                                        <div className="text-sm text-indigo-600 font-medium">
                                            {brand.productCount || 0}+ products
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Brands */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">All Brands</h2>
                            <div className="text-sm text-gray-600">
                                {filteredBrands.length} brands available
                            </div>
                        </div>

                        {filteredBrands.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
                                <div className="text-6xl mb-4">🏢</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Brands Found</h3>
                                <p className="text-gray-600 mb-4">
                                    {searchTerm ? 'Try adjusting your search terms' : 'Brands will be available soon'}
                                </p>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                                {filteredBrands.map((brand) => (
                                    <Link
                                        key={brand.id}
                                        href={`/brands/${brand.slug || brand.id}`}
                                        className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-center hover:shadow-lg hover:border-indigo-300 transition-all duration-300"
                                    >
                                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-50 transition-colors">
                                            {brand.logoUrl ? (
                                                <img
                                                    src={brand.logoUrl}
                                                    alt={brand.name}
                                                    className="w-10 h-10 object-contain"
                                                />
                                            ) : (
                                                <div className={`w-10 h-10 ${getBrandColor(brand.name)} rounded-lg flex items-center justify-center`}>
                                                    <span className="text-white font-bold text-sm">
                                                        {getBrandInitial(brand.name)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                            {brand.name}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {brand.productCount || 0} products
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Brand Benefits */}
                    <div className="mt-16 bg-gradient-to-r from-gray-900 to-indigo-900 rounded-2xl p-8 text-white">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2">Why Shop by Brand?</h2>
                            <p className="text-gray-300">Discover the benefits of choosing trusted brands</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <span className="text-xl">🛡️</span>
                                </div>
                                <h3 className="font-semibold text-sm mb-1">Quality Assurance</h3>
                                <p className="text-gray-300 text-xs">
                                    Trusted quality from reputable brands
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <span className="text-xl">📦</span>
                                </div>
                                <h3 className="font-semibold text-sm mb-1">Warranty</h3>
                                <p className="text-gray-300 text-xs">
                                    Manufacturer warranty on all products
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <span className="text-xl">🚀</span>
                                </div>
                                <h3 className="font-semibold text-sm mb-1">Innovation</h3>
                                <p className="text-gray-300 text-xs">
                                    Latest technology and features
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <span className="text-xl">⭐</span>
                                </div>
                                <h3 className="font-semibold text-sm mb-1">Customer Support</h3>
                                <p className="text-gray-300 text-xs">
                                    Dedicated brand customer service
                                </p>
                            </div>
                        </div>
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