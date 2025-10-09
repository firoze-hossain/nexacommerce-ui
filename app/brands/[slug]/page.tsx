// app/brands/[slug]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Brand } from '@/app/lib/types/brand';
import { Product } from '@/app/lib/types/product';
import { BrandService } from '@/app/lib/api/brand-service';
import { ProductService } from '@/app/lib/api/product-service';
import Header from '@/app/components/customers/header';
import Footer from '@/app/components/customers/footer';
import CartSidebar from '@/app/components/customers/cart-sidebar';
import { formatCurrency } from '@/app/lib/utils/formatters';
import Link from 'next/link';

export default function BrandPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [brand, setBrand] = useState<Brand | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            loadBrand();
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
            }
        } catch (error) {
            console.error('Error loading brand:', error);
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