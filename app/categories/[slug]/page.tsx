// app/categories/[slug]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Category } from '@/app/lib/types/category';
import { Product } from '@/app/lib/types/product';
import { CategoryService } from '@/app/lib/api/category-service';
import { ProductService } from '@/app/lib/api/product-service';
import Header from '@/app/components/customers/header';
import Footer from '@/app/components/customers/footer';
import CartSidebar from '@/app/components/customers/cart-sidebar';
import { formatCurrency } from '@/app/lib/utils/formatters';
import Link from 'next/link';

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [category, setCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            loadCategory();
        }
    }, [slug]);

    const loadCategory = async () => {
        try {
            setLoading(true);
            // Try to get category by slug first, then by ID
            let response;
            if (isNaN(Number(slug))) {
                response = await CategoryService.getCategoryBySlug(slug);
            } else {
                response = await CategoryService.getCategoryById(Number(slug));
            }

            if (response.success && response.data) {
                setCategory(response.data);
                loadCategoryProducts(response.data.id);
            }
        } catch (error) {
            console.error('Error loading category:', error);
            setLoading(false);
        }
    };

    const loadCategoryProducts = async (categoryId: number) => {
        try {
            const response = await ProductService.getProductsByCategory(categoryId, 0, 50);
            if (response.success && response.data) {
                setProducts(response.data.items);
            }
        } catch (error) {
            console.error('Error loading category products:', error);
        } finally {
            setLoading(false);
        }
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading category...</p>
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h1>
                    <p className="text-gray-600">The category you're looking for doesn't exist.</p>
                    <Link href="/categories" className="text-indigo-600 hover:text-indigo-500 mt-4 inline-block">
                        ← Back to Categories
                    </Link>
                </div>
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
                    {/* Breadcrumb */}
                    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
                        <Link href="/" className="hover:text-indigo-600">Home</Link>
                        <span>›</span>
                        <Link href="/categories" className="hover:text-indigo-600">Categories</Link>
                        <span>›</span>
                        <span className="text-gray-900">{category.name}</span>
                    </nav>

                    {/* Category Header */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{category.name}</h1>
                            {category.description && (
                                <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
                                    {category.description}
                                </p>
                            )}
                            <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
                                <span>{products.length} products available</span>
                                {category.featured && (
                                    <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full text-xs font-medium">
                                        Featured
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Products in {category.name}</h2>

                        {products.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
                                <p className="text-gray-600">Products will be available soon in this category.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
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
                        )}
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