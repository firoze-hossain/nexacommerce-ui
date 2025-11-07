// app/search/page.tsx - PROFESSIONAL VERSION
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product } from '@/app/lib/types/product';
import { Category } from '@/app/lib/types/category';
import { Brand } from '@/app/lib/types/brand';
import {
    SearchService,
    SearchResult,
    SearchFilters,
    CategorySearchResult,
    BrandSearchResult, ProductSearchResult, AvailableFilters
} from '@/app/lib/api/search-service';
import { CartService } from '@/app/lib/api/cart-service';
import { CartItemRequest } from '@/app/lib/types/cart';
import { useAuth } from '@/app/hooks/useAuth';
import Header from '@/app/components/customers/header';
import Footer from '@/app/components/customers/footer';
import CartSidebar from '@/app/components/customers/cart-sidebar';
import WishlistButton from '@/app/components/customers/wishlist-button';
import { formatCurrency } from '@/app/lib/utils/formatters';
import Link from 'next/link';

interface FilterState {
    categories: number[];
    brands: number[];
    priceRange: { min: number; max: number };
    inStock: boolean | null;
    featured: boolean | null;
    sortBy: string;
}

function SearchResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';

    const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
    const [products, setProducts] = useState<ProductSearchResult[]>([]);
    // const [categories, setCategories] = useState<Category[]>([]);
    // const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<CategorySearchResult[]>([]); // Change this type
    const [brands, setBrands] = useState<BrandSearchResult[]>([]); //
    const [availableFilters, setAvailableFilters] = useState<AvailableFilters | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [addingToCart, setAddingToCart] = useState<number | null>(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Filter state
    const [filters, setFilters] = useState<FilterState>({
        categories: [],
        brands: [],
        priceRange: { min: 0, max: 10000 },
        inStock: null,
        featured: null,
        sortBy: 'relevance'
    });

    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (query) {
            performSearch();
            loadCartItemCount();
        }
    }, [query, filters]);

    // const performSearch = async () => {
    //     if (!query.trim()) return;
    //
    //     try {
    //         setLoading(true);
    //         setError(null);
    //
    //         const response = await SearchService.searchProducts({
    //             query: query,
    //             page: 0,
    //             size: 50,
    //             filters: {
    //                 categories: filters.categories.length > 0 ? filters.categories : undefined,
    //                 brands: filters.brands.length > 0 ? filters.brands : undefined,
    //                 minPrice: filters.priceRange.min > 0 ? filters.priceRange.min : undefined,
    //                 maxPrice: filters.priceRange.max < 10000 ? filters.priceRange.max : undefined,
    //                 inStock: filters.inStock,
    //                 featured: filters.featured,
    //                 sortBy: filters.sortBy as any
    //             }
    //         });
    //
    //         if (response.success && response.data) {
    //             setSearchResults(response.data);
    //             setProducts(response.data.products);
    //             setAvailableFilters(response.data.availableFilters);
    //
    //             // Update available categories and brands from search results
    //             if (response.data.categories) {
    //                 setCategories(response.data.categories);
    //             }
    //             if (response.data.brands) {
    //                 setBrands(response.data.brands);
    //             }
    //         } else {
    //             setError(response.message || 'No results found');
    //             setSearchResults(null);
    //             setProducts([]);
    //             setAvailableFilters(null);
    //         }
    //     } catch (error) {
    //         console.error('Search error:', error);
    //         setError('Failed to perform search. Please try again.');
    //         setSearchResults(null);
    //         setProducts([]);
    //         setAvailableFilters(null);
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    const performSearch = async () => {
        if (!query.trim()) return;

        try {
            setLoading(true);
            setError(null);

            const response = await SearchService.searchProducts({
                query: query,
                page: 0,
                size: 50,
                filters: {
                    categories: filters.categories.length > 0 ? filters.categories : undefined,
                    brands: filters.brands.length > 0 ? filters.brands : undefined,
                    minPrice: filters.priceRange.min > 0 ? filters.priceRange.min : undefined,
                    maxPrice: filters.priceRange.max < 10000 ? filters.priceRange.max : undefined,
                    inStock: filters.inStock,
                    featured: filters.featured,
                    sortBy: filters.sortBy as any
                }
            });

            if (response.success && response.data) {
                setSearchResults(response.data);
                setProducts(response.data.products);

                // FIX: Handle undefined case by providing null
                setAvailableFilters(response.data.availableFilters || null);

                // Update available categories and brands from search results
                if (response.data.categories) {
                    setCategories(response.data.categories);
                }
                if (response.data.brands) {
                    setBrands(response.data.brands);
                }
            } else {
                setError(response.message || 'No results found');
                setSearchResults(null);
                setProducts([]);
                setAvailableFilters(null);
            }
        } catch (error) {
            console.error('Search error:', error);
            setError('Failed to perform search. Please try again.');
            setSearchResults(null);
            setProducts([]);
            setAvailableFilters(null);
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

    const addToCart = async (product: ProductSearchResult) => {
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
                const totalItems = response.data.items.reduce((total: number, item: any) => total + item.quantity, 0);
                setCartItemCount(totalItems);
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
        loadCartItemCount();
    };

    // Filter handlers
    const toggleCategory = (categoryId: number) => {
        setFilters(prev => ({
            ...prev,
            categories: prev.categories.includes(categoryId)
                ? prev.categories.filter(id => id !== categoryId)
                : [...prev.categories, categoryId]
        }));
    };

    const toggleBrand = (brandId: number) => {
        setFilters(prev => ({
            ...prev,
            brands: prev.brands.includes(brandId)
                ? prev.brands.filter(id => id !== brandId)
                : [...prev.brands, brandId]
        }));
    };

    const updatePriceRange = (min: number, max: number) => {
        setFilters(prev => ({
            ...prev,
            priceRange: { min, max }
        }));
    };

    const toggleInStock = () => {
        setFilters(prev => ({
            ...prev,
            inStock: prev.inStock === null ? true : prev.inStock === true ? false : null
        }));
    };

    const toggleFeatured = () => {
        setFilters(prev => ({
            ...prev,
            featured: prev.featured === null ? true : prev.featured === true ? false : null
        }));
    };

    const updateSortBy = (sortBy: string) => {
        setFilters(prev => ({ ...prev, sortBy }));
    };

    const clearAllFilters = () => {
        setFilters({
            categories: [],
            brands: [],
            priceRange: { min: 0, max: 10000 },
            inStock: null,
            featured: null,
            sortBy: 'relevance'
        });
    };

    const hasActiveFilters =
        filters.categories.length > 0 ||
        filters.brands.length > 0 ||
        filters.priceRange.min > 0 ||
        filters.priceRange.max < 10000 ||
        filters.inStock !== null ||
        filters.featured !== null;

    // Get filter counts
    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.categories.length > 0) count += filters.categories.length;
        if (filters.brands.length > 0) count += filters.brands.length;
        if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) count += 1;
        if (filters.inStock !== null) count += 1;
        if (filters.featured !== null) count += 1;
        return count;
    };

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
                    {/* Search Header */}
                    <div className="mb-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Search Results for "{query}"
                                </h1>
                                {searchResults && (
                                    <p className="text-gray-600">
                                        Found {searchResults.totalResults} results in {searchResults.searchTime}ms
                                    </p>
                                )}
                            </div>

                            {/* Mobile Filter Button */}
                            <div className="lg:hidden">
                                <button
                                    onClick={() => setShowMobileFilters(true)}
                                    className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    Filters
                                    {getActiveFilterCount() > 0 && (
                                        <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {getActiveFilterCount()}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Desktop Sidebar Filters */}
                        <div className="hidden lg:block lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-semibold text-gray-900 text-lg">Filters</h3>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearAllFilters}
                                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>

                                {/* Categories Filter */}
                                {availableFilters?.categories && availableFilters.categories.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {availableFilters.categories.map((category) => (
                                                <label key={category.id} className="flex items-center group cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.categories.includes(category.id)}
                                                        onChange={() => toggleCategory(category.id)}
                                                        className="text-indigo-600 focus:ring-indigo-500 rounded"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                                                        {category.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                        {category.productCount}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Brands Filter */}
                                {availableFilters?.brands && availableFilters.brands.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="font-medium text-gray-900 mb-3">Brands</h4>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {availableFilters.brands.map((brand) => (
                                                <label key={brand.id} className="flex items-center group cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.brands.includes(brand.id)}
                                                        onChange={() => toggleBrand(brand.id)}
                                                        className="text-indigo-600 focus:ring-indigo-500 rounded"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                                                        {brand.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                        {brand.productCount}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Price Range Filter */}
                                {availableFilters?.priceRange && (
                                    <div className="mb-6">
                                        <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">${filters.priceRange.min}</span>
                                                <span className="text-gray-600">${filters.priceRange.max}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="Min"
                                                    value={filters.priceRange.min}
                                                    onChange={(e) => updatePriceRange(Number(e.target.value), filters.priceRange.max)}
                                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                                />
                                                <span className="self-center text-gray-400">-</span>
                                                <input
                                                    type="number"
                                                    placeholder="Max"
                                                    value={filters.priceRange.max}
                                                    onChange={(e) => updatePriceRange(filters.priceRange.min, Number(e.target.value))}
                                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                                />
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="10000"
                                                step="100"
                                                value={filters.priceRange.max}
                                                onChange={(e) => updatePriceRange(filters.priceRange.min, parseInt(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Stock Status Filter */}
                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-900 mb-3">Availability</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filters.inStock === true}
                                                onChange={toggleInStock}
                                                className="text-indigo-600 focus:ring-indigo-500 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Featured Filter */}
                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-900 mb-3">Product Type</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filters.featured === true}
                                                onChange={toggleFeatured}
                                                className="text-indigo-600 focus:ring-indigo-500 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Featured Products</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Results */}
                        <div className="lg:col-span-3">
                            {/* Results Header */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="text-sm text-gray-600">
                                        Showing {products.length} of {searchResults?.totalResults || 0} products
                                        {hasActiveFilters && (
                                            <span className="ml-2 text-indigo-600">
                                                ({getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? 's' : ''})
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-600">Sort by:</span>
                                        <select
                                            value={filters.sortBy}
                                            onChange={(e) => updateSortBy(e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="relevance">Relevance</option>
                                            <option value="price_asc">Price: Low to High</option>
                                            <option value="price_desc">Price: High to Low</option>
                                            <option value="name">Name: A to Z</option>
                                            <option value="newest">Newest First</option>
                                            <option value="popular">Most Popular</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Category & Brand Results */}
                            {(categories.length > 0 || brands.length > 0) && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Categories & Brands</h2>

                                    {/* Categories Grid */}
                                    {categories.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-medium text-gray-900 mb-3">Categories</h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {categories.map((category) => (
                                                    <Link
                                                        key={category.id}
                                                        href={`/categories/${category.id}`}
                                                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 text-center group"
                                                    >
                                                        {category.imageUrl && (
                                                            <img
                                                                src={category.imageUrl}
                                                                alt={category.name}
                                                                className="w-12 h-12 object-cover rounded-full mx-auto mb-2 group-hover:scale-110 transition-transform"
                                                            />
                                                        )}
                                                        <h4 className="font-medium text-gray-900 text-sm group-hover:text-indigo-600">
                                                            {category.name}
                                                        </h4>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {category.productCount} products
                                                        </p>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Brands Grid */}
                                    {brands.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-3">Brands</h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {brands.map((brand) => (
                                                    <Link
                                                        key={brand.id}
                                                        href={`/brands/${brand.id}`}
                                                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 text-center group"
                                                    >
                                                        {brand.logoUrl && (
                                                            <img
                                                                src={brand.logoUrl}
                                                                alt={brand.name}
                                                                className="w-12 h-12 object-cover rounded-full mx-auto mb-2 group-hover:scale-110 transition-transform"
                                                            />
                                                        )}
                                                        <h4 className="font-medium text-gray-900 text-sm group-hover:text-indigo-600">
                                                            {brand.name}
                                                        </h4>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {brand.productCount} products
                                                        </p>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Products Grid */}
                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[...Array(6)].map((_, index) => (
                                        <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 animate-pulse">
                                            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                                    <p className="text-gray-600 mb-4">Try adjusting your search terms or filters</p>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <button
                                            onClick={clearAllFilters}
                                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            Clear All Filters
                                        </button>
                                        <Link
                                            href="/products"
                                            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            Browse All Products
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Products Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {products.map((product) => {
                                            const isAdding = addingToCart === product.id;

                                            return (
                                                <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group relative">

                                                    {/* Wishlist Button */}
                                                    <div className="absolute top-3 right-3 z-10">
                                                        <WishlistButton
                                                            productId={product.id}
                                                            size="sm"
                                                            variant="icon"
                                                            className="bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                                                        />
                                                    </div>

                                                    {/* Product Image */}
                                                    <Link href={`/products/${product.id}`}>
                                                        <div className="relative overflow-hidden bg-gray-100">
                                                            <img
                                                                src={product.imageUrl || '/api/placeholder/300/300'}
                                                                alt={product.name}
                                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                                                                <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                                                    {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
                                                                </div>
                                                            )}
                                                            {product.featured && (
                                                                <div className="absolute top-3 left-3 bg-purple-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                                                    Featured
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Link>

                                                    {/* Product Info */}
                                                    <div className="p-4">
                                                        <Link href={`/products/${product.id}`}>
                                                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                                                {product.name}
                                                            </h3>
                                                        </Link>

                                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                            {product.shortDescription || product.description}
                                                        </p>

                                                        {/* Brand and Category */}
                                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                                            {product.brandName && (
                                                                <span className="bg-gray-100 px-2 py-1 rounded">{product.brandName}</span>
                                                            )}
                                                            <span className="bg-gray-100 px-2 py-1 rounded">{product.categoryName}</span>
                                                        </div>

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
                                                            <span className={`text-sm font-medium ${
                                                                product.inStock ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                                                            </span>
                                                            {product.lowStock && product.inStock && (
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
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Filters Modal */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
                    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Mobile filter content - same as desktop but in modal */}
                            <div className="space-y-6">
                                {/* Categories Filter */}
                                {availableFilters?.categories && availableFilters.categories.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {availableFilters.categories.map((category) => (
                                                <label key={category.id} className="flex items-center group cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.categories.includes(category.id)}
                                                        onChange={() => toggleCategory(category.id)}
                                                        className="text-indigo-600 focus:ring-indigo-500 rounded"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                                                        {category.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                        {category.productCount}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Brands Filter */}
                                {availableFilters?.brands && availableFilters.brands.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Brands</h4>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {availableFilters.brands.map((brand) => (
                                                <label key={brand.id} className="flex items-center group cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.brands.includes(brand.id)}
                                                        onChange={() => toggleBrand(brand.id)}
                                                        className="text-indigo-600 focus:ring-indigo-500 rounded"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                                                        {brand.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                        {brand.productCount}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Apply Filters Button */}
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />

            <CartSidebar
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                onCartUpdate={handleCartUpdate}
            />
        </div>
    );
}

export default function SearchResultsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading search results...</p>
                </div>
            </div>
        }>
            <SearchResultsContent />
        </Suspense>
    );
}