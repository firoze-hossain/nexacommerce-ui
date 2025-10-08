// app/categories/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/app/lib/types/category';
import { CategoryService } from '@/app/lib/api/category-service';
import Header from '@/app/components/customers/header';
import Footer from '@/app/components/customers/footer';
import CartSidebar from '@/app/components/customers/cart-sidebar';
import Link from 'next/link';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [featuredCategories, setFeaturedCategories] = useState<Category[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
        loadFeaturedCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await CategoryService.getCategories(0, 50);
            if (response.success && response.data) {
                setCategories(response.data.items);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadFeaturedCategories = async () => {
        try {
            const response = await CategoryService.getFeaturedCategories();
            if (response.success && response.data) {
                setFeaturedCategories(response.data);
            }
        } catch (error) {
            console.error('Error loading featured categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = () => {
        // This would be implemented when viewing category products
    };

    const removeFromCart = (productId: number) => {
        setCartItems(prev => prev.filter(item => item.productId !== productId));
    };

    const updateCartQuantity = (productId: number, quantity: number) => {
        if (quantity === 0) {
            removeFromCart(productId);
            return;
        }
        setCartItems(prev =>
            prev.map(item =>
                item.productId === productId ? { ...item, quantity } : item
            )
        );
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartItemCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    const getCategoryIcon = (categoryName: string) => {
        const iconMap: { [key: string]: string } = {
            'Electronics': '📱',
            'Fashion': '👕',
            'Home & Garden': '🏠',
            'Beauty': '💄',
            'Sports': '⚽',
            'Books': '📚',
            'Toys': '🧸',
            'Automotive': '🚗',
            'Health': '💊',
            'Jewelry': '💎',
            'Food': '🍎',
            'Furniture': '🛋️'
        };
        return iconMap[categoryName] || '📦';
    };

    const getCategoryColor = (index: number) => {
        const colors = [
            'bg-blue-50 text-blue-600 border-blue-200',
            'bg-green-50 text-green-600 border-green-200',
            'bg-purple-50 text-purple-600 border-purple-200',
            'bg-orange-50 text-orange-600 border-orange-200',
            'bg-pink-50 text-pink-600 border-pink-200',
            'bg-indigo-50 text-indigo-600 border-indigo-200',
            'bg-teal-50 text-teal-600 border-teal-200',
            'bg-rose-50 text-rose-600 border-rose-200',
            'bg-amber-50 text-amber-600 border-amber-200',
            'bg-cyan-50 text-cyan-600 border-cyan-200',
            'bg-lime-50 text-lime-600 border-lime-200',
            'bg-violet-50 text-violet-600 border-violet-200'
        ];
        return colors[index % colors.length];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header cartItemCount={0} onCartClick={() => setIsCartOpen(true)} />
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-12"></div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, index) => (
                                <div key={index} className="bg-white rounded-2xl p-6">
                                    <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
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
            <Header
                cartItemCount={getCartItemCount()}
                onCartClick={() => setIsCartOpen(true)}
            />

            <main className="py-8">
                <div className="container mx-auto px-4">
                    {/* Page Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h1>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Explore our wide range of categories and discover products that suit your needs
                        </p>
                    </div>

                    {/* Featured Categories */}
                    {featuredCategories.length > 0 && (
                        <div className="mb-16">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Featured Categories</h2>
                                <div className="w-12 h-1 bg-indigo-600 rounded-full"></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {featuredCategories.slice(0, 4).map((category, index) => (
                                    <Link
                                        key={category.id}
                                        href={`/categories/${category.slug || category.id}`}
                                        className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-xl hover:border-indigo-300 transition-all duration-300 hover:scale-105"
                                    >
                                        <div className={`w-20 h-20 ${getCategoryColor(index)} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 border-2`}>
                                            <span className="text-3xl">{getCategoryIcon(category.name)}</span>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-indigo-600 transition-colors">
                                            {category.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {category.description || 'Discover amazing products'}
                                        </p>
                                        <div className="text-sm text-indigo-600 font-medium">
                                            {category.productCount || 0}+ products
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Categories */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">All Categories</h2>
                            <div className="text-sm text-gray-600">
                                {categories.length} categories available
                            </div>
                        </div>

                        {categories.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Categories Found</h3>
                                <p className="text-gray-600">Categories will be available soon.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                                {categories.map((category, index) => (
                                    <Link
                                        key={category.id}
                                        href={`/categories/${category.slug || category.id}`}
                                        className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-center hover:shadow-lg hover:border-indigo-300 transition-all duration-300"
                                    >
                                        <div className={`w-16 h-16 ${getCategoryColor(index)} rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                                            <span className="text-2xl">{getCategoryIcon(category.name)}</span>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                            {category.name}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {category.productCount || 0} products
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Category Features */}
                    <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">🚚</span>
                                </div>
                                <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
                                <p className="text-indigo-100 text-sm">
                                    Quick shipping across all categories
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">🛡️</span>
                                </div>
                                <h3 className="font-semibold text-lg mb-2">Quality Assured</h3>
                                <p className="text-indigo-100 text-sm">
                                    Premium products in every category
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">↩️</span>
                                </div>
                                <h3 className="font-semibold text-lg mb-2">Easy Returns</h3>
                                <p className="text-indigo-100 text-sm">
                                    30-day return policy on all items
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
                cartItems={cartItems}
                onUpdateQuantity={updateCartQuantity}
                onRemoveItem={removeFromCart}
                total={getCartTotal()}
            />
        </div>
    );
}