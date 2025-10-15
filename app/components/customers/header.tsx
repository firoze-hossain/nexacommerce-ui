// app/components/customers/header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

interface HeaderProps {
    cartItemCount: number;
    onCartClick: () => void;
}

export default function Header({ cartItemCount, onCartClick }: HeaderProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();

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

                    {/* Search Bar */}
                    <div className="flex-1 max-w-2xl mx-8">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search for products, brands and categories..."
                                className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors">
                                Search
                            </button>
                        </div>
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Cart */}
                        <button
                            onClick={onCartClick}
                            className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartItemCount}
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