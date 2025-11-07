// app/components/customers/header.tsx - UPDATED WITH REAL SEARCH API
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { useWishlist } from '@/app/contexts/wishlist-context';
import { SearchService, AutocompleteResult, ProductSearchResult, CategorySearchResult, BrandSearchResult } from '@/app/lib/api/search-service';
import { debounce } from '@/app/lib/utils/debounce';

interface HeaderProps {
    cartItemCount: number;
    onCartClick: () => void;
}

export default function Header({ cartItemCount, onCartClick }: HeaderProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [autocompleteResults, setAutocompleteResults] = useState<AutocompleteResult | null>(null);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [popularSearches, setPopularSearches] = useState<string[]>([]);

    const { isAuthenticated, user, logout } = useAuth();
    const { wishlistCount } = useWishlist();
    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Check if user is an admin (any role except CUSTOMER)
    const isAdminUser = user?.role?.name !== 'CUSTOMER';

    // Menu items for admin users
    const adminMenuItems = [
        { href: '/profile', label: 'My Profile' },
        { href: '/dashboard', label: 'Dashboard' },
    ];

    // Menu items for customer users
    const customerMenuItems = [
        { href: '/orders', label: 'My Orders' },
        { href: '/wishlist', label: 'My Wishlist' },
        { href: '/profile', label: 'My Profile' },
    ];

    // Get the appropriate menu items based on user role
    const getUserMenuItems = () => {
        if (!isAuthenticated) return [];
        return isAdminUser ? adminMenuItems : customerMenuItems;
    };

    // Load popular searches on component mount
    useEffect(() => {
        loadPopularSearches();
    }, []);

    // Close autocomplete when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowAutocomplete(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Load popular searches
    const loadPopularSearches = async () => {
        try {
            const response = await SearchService.getPopularSearches(5);
            if (response.success && response.data) {
                setPopularSearches(response.data);
            }
        } catch (error) {
            console.error('Failed to load popular searches:', error);
        }
    };

    // Debounced search function
    const performSearch = useCallback(
        debounce(async (query: string) => {
            if (!query.trim() || query.length < 2) {
                setAutocompleteResults(null);
                setIsSearching(false);
                return;
            }

            try {
                setIsSearching(true);
                const response = await SearchService.autocomplete(query, 5);

                if (response.success && response.data) {
                    setAutocompleteResults(response.data);
                } else {
                    setAutocompleteResults(null);
                }
            } catch (error) {
                console.error('Search error:', error);
                setAutocompleteResults(null);
            } finally {
                setIsSearching(false);
            }
        }, 300),
        []
    );

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length >= 2) {
            setShowAutocomplete(true);
            performSearch(query);
        } else {
            setShowAutocomplete(false);
            setAutocompleteResults(null);
        }
    };

    // Handle search form submission
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (searchQuery.trim()) {
            setShowAutocomplete(false);
            // Navigate to search results page
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // Handle direct click on autocomplete item
    const handleAutocompleteItemClick = (item: ProductSearchResult | CategorySearchResult | BrandSearchResult) => {
        setShowAutocomplete(false);
        setSearchQuery('');

        switch (item.type) {
            case 'PRODUCT':
                router.push(`/products/${item.id}`);
                break;
            case 'CATEGORY':
                router.push(`/categories/${item.id}`);
                break;
            case 'BRAND':
                router.push(`/brands/${item.id}`);
                break;
        }
    };

    // Handle popular search click
    const handlePopularSearchClick = (searchTerm: string) => {
        setSearchQuery(searchTerm);
        setShowAutocomplete(false);
        router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    };

    // Clear search
    const handleClearSearch = () => {
        setSearchQuery('');
        setAutocompleteResults(null);
        setShowAutocomplete(false);
        inputRef.current?.focus();
    };

    // Render autocomplete results
    const renderAutocompleteResults = () => {
        if (!autocompleteResults || !showAutocomplete) return null;

        const hasResults =
            autocompleteResults.products.length > 0 ||
            autocompleteResults.categories.length > 0 ||
            autocompleteResults.brands.length > 0;

        return (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto z-50">
                {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-2 text-sm">Searching...</p>
                    </div>
                ) : hasResults ? (
                    <div className="p-2">
                        {/* Products Section */}
                        {autocompleteResults.products.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-sm font-semibold text-gray-900 px-2 py-1">Products</h3>
                                {autocompleteResults.products.map((product) => (
                                    <button
                                        key={`product-${product.id}`}
                                        onClick={() => handleAutocompleteItemClick(product)}
                                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md flex items-center space-x-3"
                                    >
                                        {product.imageUrl && (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-8 h-8 object-cover rounded"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {product.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                ${product.price}
                                                {product.compareAtPrice && product.compareAtPrice > product.price && (
                                                    <span className="line-through text-gray-400 ml-2">
                                                        ${product.compareAtPrice}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Categories Section */}
                        {autocompleteResults.categories.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-sm font-semibold text-gray-900 px-2 py-1">Categories</h3>
                                {autocompleteResults.categories.map((category) => (
                                    <button
                                        key={`category-${category.id}`}
                                        onClick={() => handleAutocompleteItemClick(category)}
                                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md flex items-center space-x-3"
                                    >
                                        {category.imageUrl && (
                                            <img
                                                src={category.imageUrl}
                                                alt={category.name}
                                                className="w-8 h-8 object-cover rounded"
                                            />
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {category.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {category.productCount} products
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Brands Section */}
                        {autocompleteResults.brands.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-sm font-semibold text-gray-900 px-2 py-1">Brands</h3>
                                {autocompleteResults.brands.map((brand) => (
                                    <button
                                        key={`brand-${brand.id}`}
                                        onClick={() => handleAutocompleteItemClick(brand)}
                                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md flex items-center space-x-3"
                                    >
                                        {brand.logoUrl && (
                                            <img
                                                src={brand.logoUrl}
                                                alt={brand.name}
                                                className="w-8 h-8 object-cover rounded"
                                            />
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {brand.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {brand.productCount} products
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : searchQuery.length >= 2 ? (
                    <div className="p-4 text-center text-gray-500">
                        <p>No results found for "{searchQuery}"</p>
                    </div>
                ) : null}

                {/* Popular Searches */}
                {(!hasResults || searchQuery.length === 0) && popularSearches.length > 0 && (
                    <div className="border-t border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Popular Searches</h3>
                        <div className="flex flex-wrap gap-2">
                            {popularSearches.map((search, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePopularSearchClick(search)}
                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                                >
                                    {search}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* View All Results */}
                {hasResults && searchQuery.trim() && (
                    <div className="border-t border-gray-200 p-2">
                        <button
                            // onClick={() => handleSearchSubmit(new Event('submit') as any)}
                            // className="w-full text-center py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md"
                            onClick={() => router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)}
                            className="w-full text-center py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md"
                        >
                            View all results for "{searchQuery}"
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            {/* Top Bar */}
            <div className="bg-indigo-600 text-white py-2">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-4">
                            <span>🔥 10.10 BRAND RUSH - Up to 75% OFF</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span>📞 Support: +1 234 567 890</span>
                            <span>🚚 Free Delivery on orders over $50</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">N</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">NexaCommerce</span>
                    </Link>

                    {/* Search Bar - UPDATED WITH REAL SEARCH */}
                    <div className="flex-1 max-w-2xl mx-8" ref={searchRef}>
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Search for products, brands and categories..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onFocus={() => searchQuery.length >= 2 && setShowAutocomplete(true)}
                                    className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                {/* Clear button */}
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!searchQuery.trim()}
                                >
                                    Search
                                </button>
                            </div>

                            {/* Autocomplete Dropdown */}
                            {renderAutocompleteResults()}
                        </form>
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Wishlist Icon - Only show for authenticated customers */}
                        {isAuthenticated && !isAdminUser && (
                            <Link
                                href="/wishlist"
                                className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors"
                                title="My Wishlist"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                                        {wishlistCount > 99 ? '99+' : wishlistCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* Cart */}
                        <button
                            onClick={onCartClick}
                            className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                                    {cartItemCount > 99 ? '99+' : cartItemCount}
                                </span>
                            )}
                        </button>

                        {/* User Account */}
                        {isAuthenticated ? (
                            <div className="relative group">
                                <button className="flex items-center space-x-2 p-2 text-gray-700 hover:text-indigo-600 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>Hi, {user?.name?.split(' ')[0]}</span>
                                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                                        {user?.role?.name}
                                    </span>
                                </button>
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="py-2">
                                        {/* Dynamic menu items based on role */}
                                        {getUserMenuItems().map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                        <button
                                            onClick={logout}
                                            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    href="/login"
                                    className="text-gray-700 hover:text-indigo-600 transition-colors"
                                >
                                    Login
                                </Link>
                                <span className="text-gray-300">|</span>
                                <Link
                                    href="/signup"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="hidden md:flex items-center justify-between mt-4 pb-2">
                    <div className="flex items-center space-x-8">
                        <Link href="/" className="text-gray-700 hover:text-indigo-600 font-medium">
                            Home
                        </Link>
                        <Link href="/products" className="text-gray-700 hover:text-indigo-600 font-medium">
                            All Products
                        </Link>
                        <Link href="/categories" className="text-gray-700 hover:text-indigo-600 font-medium">
                            Categories
                        </Link>
                        <Link href="/hot-deals" className="text-red-600 hover:text-red-700 font-medium">
                            🔥 Hot Deals
                        </Link>
                        <Link href="/brands" className="text-gray-700 hover:text-indigo-600 font-medium">
                            Brands
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>⭐ Download our App</span>
                        <span>🚚 Free Delivery</span>
                        <span>↩️ Easy Returns</span>
                    </div>
                </nav>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 py-4">
                    <div className="container mx-auto px-4 space-y-4">
                        <Link href="/" className="block text-gray-700 hover:text-indigo-600">
                            Home
                        </Link>
                        <Link href="/products" className="block text-gray-700 hover:text-indigo-600">
                            All Products
                        </Link>
                        <Link href="/categories" className="block text-gray-700 hover:text-indigo-600">
                            Categories
                        </Link>
                        <Link href="/hot-deals" className="block text-red-600 hover:text-red-700">
                            🔥 Hot Deals
                        </Link>
                        <Link href="/brands" className="block text-gray-700 hover:text-indigo-600">
                            Brands
                        </Link>

                        {/* Wishlist for Mobile - Only show for authenticated customers */}
                        {isAuthenticated && !isAdminUser && (
                            <Link
                                href="/wishlist"
                                className="block text-gray-700 hover:text-indigo-600 flex items-center"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                                My Wishlist
                                {wishlistCount > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* Dynamic user menu for mobile */}
                        {isAuthenticated ? (
                            <>
                                {getUserMenuItems().map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="block text-gray-700 hover:text-indigo-600"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                                <button
                                    onClick={logout}
                                    className="block text-gray-700 hover:text-indigo-600"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/signup"
                                className="block text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                Sign Up
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}