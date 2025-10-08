// app/components/customers/brand-section.tsx
'use client';

import { useState, useEffect } from 'react';
import { Brand } from '@/app/lib/types/brand';
import { BrandService } from '@/app/lib/api/brand-service';
import Link from 'next/link';

export default function BrandSection() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFeaturedBrands();
    }, []);

    const loadFeaturedBrands = async () => {
        try {
            const response = await BrandService.getFeaturedBrands();
            if (response.success && response.data) {
                setBrands(response.data);
            }
        } catch (error) {
            console.error('Error loading featured brands:', error);
            // Fallback to mock brands if API fails
            setBrands(getMockBrands());
        } finally {
            setLoading(false);
        }
    };

    const getMockBrands = (): Brand[] => [
        {
            id: 1,
            name: 'Samsung',
            slug: 'samsung',
            description: 'Leading electronics and technology brand',
            logoUrl: '/api/placeholder/120/60',
            websiteUrl: 'https://samsung.com',
            featured: true,
            active: true,
            productCount: 150,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
        },
        {
            id: 2,
            name: 'Apple',
            slug: 'apple',
            description: 'Innovative technology and electronics',
            logoUrl: '/api/placeholder/120/60',
            websiteUrl: 'https://apple.com',
            featured: true,
            active: true,
            productCount: 200,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
        },
        {
            id: 3,
            name: 'Nike',
            slug: 'nike',
            description: 'World-class sports apparel and footwear',
            logoUrl: '/api/placeholder/120/60',
            websiteUrl: 'https://nike.com',
            featured: true,
            active: true,
            productCount: 89,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
        },
        {
            id: 4,
            name: 'Adidas',
            slug: 'adidas',
            description: 'Premium sportswear and accessories',
            logoUrl: '/api/placeholder/120/60',
            websiteUrl: 'https://adidas.com',
            featured: true,
            active: true,
            productCount: 75,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
        },
        {
            id: 5,
            name: 'Sony',
            slug: 'sony',
            description: 'High-quality electronics and entertainment',
            logoUrl: '/api/placeholder/120/60',
            websiteUrl: 'https://sony.com',
            featured: true,
            active: true,
            productCount: 120,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
        },
        {
            id: 6,
            name: 'L\'Oreal',
            slug: 'loreal',
            description: 'Premium beauty and cosmetics',
            logoUrl: '/api/placeholder/120/60',
            websiteUrl: 'https://loreal.com',
            featured: true,
            active: true,
            productCount: 65,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
        }
    ];

    if (loading) {
        return (
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Brands</h2>
                        <p className="text-gray-600 text-lg">Loading top brands...</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <div className="w-full h-20 bg-gray-200 rounded-lg mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-gradient-to-br from-gray-50 to-indigo-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-600 rounded-full text-sm font-semibold mb-4">
                        🏆 TOP BRANDS
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Brand</h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Discover products from world-renowned brands you know and trust
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                    {brands.map((brand) => (
                        <Link
                            key={brand.id}
                            href={`/brands/${brand.slug || brand.id}`}
                            className="group text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-indigo-300 transition-all duration-300 hover:scale-105"
                        >
                            {/* Brand Logo */}
                            <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center p-3 group-hover:bg-indigo-50 transition-colors">
                                {brand.logoUrl ? (
                                    <img
                                        src={brand.logoUrl}
                                        alt={brand.name}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">
                                            {brand.name.charAt(0)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Brand Name */}
                            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
                                {brand.name}
                            </h3>

                            {/* Product Count */}
                            <p className="text-sm text-gray-500">
                                {brand.productCount}+ products
                            </p>

                            {/* Hover Effect Indicator */}
                            <div className="mt-3 w-8 h-1 bg-indigo-600 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </Link>
                    ))}
                </div>

                {/* View All Brands Button */}
                <div className="text-center">
                    <Link
                        href="/brands"
                        className="inline-flex items-center px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
                    >
                        Explore All Brands
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                {/* Brand Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-200">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">✅</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Authentic Products</h4>
                        <p className="text-gray-600 text-sm">
                            100% genuine products from authorized dealers
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🛡️</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Brand Warranty</h4>
                        <p className="text-gray-600 text-sm">
                            Full manufacturer warranty on all products
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🚚</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Fast Delivery</h4>
                        <p className="text-gray-600 text-sm">
                            Quick shipping from brand-authorized warehouses
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}