// app/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/app/lib/types/product';
import { Category } from '@/app/lib/types/category';
import { ProductService } from '@/app/lib/api/product-service';
import { CategoryService } from '@/app/lib/api/category-service';
import Header from '@/app/components/customers/header';
import Footer from '@/app/components/customers/footer';
import CartSidebar from '@/app/components/customers/cart-sidebar';
import { formatCurrency } from '@/app/lib/utils/formatters';
import Link from 'next/link';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 12;

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, [currentPage, sortBy, sortDirection]);

    useEffect(() => {
        filterProducts();
    }, [products, searchTerm, selectedCategory, priceRange]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await ProductService.getAllProducts(
                currentPage,
                pageSize,
                sortBy,
                sortDirection
            );

            if (response.success && response.data) {
                setProducts(response.data.items);
                setTotalPages(response.data.totalPages);
                setTotalItems(response.data.totalItems);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const filterProducts = () => {
        let filtered = products;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product =>
                product.categoryName === selectedCategory
            );
        }

        // Price range filter
        filtered = filtered.filter(product =>
            product.price >= priceRange.min && product.price <= priceRange.max
        );

        setFilteredProducts(filtered);
    };

    const addToCart = (product: Product) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item.productId === product.id);
            if (existingItem) {
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                productId: product.id,
                product,
                quantity: 1,
                price: product.price
            }];
        });
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadProducts();
    };

    const handleSortChange = (newSortBy: string) => {
        if (sortBy === newSortBy) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortDirection('desc');
        }
        setCurrentPage(0);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setPriceRange({ min: 0, max: 10000 });
        setCurrentPage(0);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                cartItemCount={getCartItemCount()}
                onCartClick={() => setIsCartOpen(true)}
            />

            <main className="py-8">
                <div className="container mx-auto px-4">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">All Products</h1>
                        <p className="text-gray-600 text-lg">
                            Discover {totalItems} amazing products from our collection
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar Filters */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                                {/* Search */}
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-3">Search</h3>
                                    <form onSubmit={handleSearch} className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <button
                                            type="submit"
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            Search
                                        </button>
                                    </form>
                                </div>

                                {/* Categories */}
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="category"
                                                value="all"
                                                checked={selectedCategory === 'all'}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="ml-2 text-gray-700">All Categories</span>
                                        </label>
                                        {categories.map((category) => (
                                            <label key={category.id} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    value={category.name}
                                                    checked={selectedCategory === category.name}
                                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                                    className="text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="ml-2 text-gray-700">{category.name}</span>
                                                <span className="ml-auto text-sm text-gray-500">
                                                    ({category.productCount || 0})
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">${priceRange.min}</span>
                                            <span className="text-sm text-gray-600">${priceRange.max}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="10000"
                                            step="100"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange(prev => ({
                                                ...prev,
                                                max: parseInt(e.target.value)
                                            }))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Clear Filters */}
                                <button
                                    onClick={clearFilters}
                                    className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="lg:col-span-3">
                            {/* Sort and Results Info */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="text-sm text-gray-600">
                                        Showing {filteredProducts.length} of {totalItems} products
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-600">Sort by:</span>
                                        <select
                                            value={`${sortBy}-${sortDirection}`}
                                            onChange={(e) => {
                                                const [newSortBy, newSortDirection] = e.target.value.split('-');
                                                setSortBy(newSortBy);
                                                setSortDirection(newSortDirection);
                                                setCurrentPage(0);
                                            }}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="createdAt-desc">Newest First</option>
                                            <option value="createdAt-asc">Oldest First</option>
                                            <option value="price-asc">Price: Low to High</option>
                                            <option value="price-desc">Price: High to Low</option>
                                            <option value="name-asc">Name: A to Z</option>
                                            <option value="name-desc">Name: Z to A</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

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
                            ) : filteredProducts.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                                    <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                                    <button
                                        onClick={clearFilters}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredProducts.map((product) => (
                                            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                                {/* Product Image */}
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
                                                            <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                                                {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
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
                                                            <span>Brand: {product.brandName}</span>
                                                        )}
                                                        <span>{product.categoryName}</span>
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
                                                        disabled={!product.inStock}
                                                        className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                                                            product.inStock
                                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center space-x-2 mt-8">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                                disabled={currentPage === 0}
                                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Previous
                                            </button>
                                            <span className="text-sm text-gray-600">
                                                Page {currentPage + 1} of {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                                disabled={currentPage >= totalPages - 1}
                                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
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