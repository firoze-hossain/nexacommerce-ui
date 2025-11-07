// app/products/[id]/page.tsx - UPDATED WITH WISHLIST
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Product } from '@/app/lib/types/product';
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
import ReviewSection from "@/app/components/customers/review-section";

export default function ProductDetailPage() {
    const params = useParams();
    const productId = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [addingToCart, setAddingToCart] = useState<boolean>(false);
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        if (productId) {
            loadProduct();
            loadCartItemCount();
        }
    }, [productId]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const response = await ProductService.getProductById(parseInt(productId));
            if (response.success && response.data) {
                setProduct(response.data);
                loadRelatedProducts(response.data.categoryId);
            } else {
                setError('Product not found');
            }
        } catch (error) {
            console.error('Error loading product:', error);
            setError('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const loadRelatedProducts = async (categoryId: number) => {
        try {
            const response = await ProductService.getProductsByCategory(categoryId, 0, 4);
            if (response.success && response.data) {
                setRelatedProducts(response.data.items.filter(p => p.id !== parseInt(productId)));
            }
        } catch (error) {
            console.error('Error loading related products:', error);
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

    const addToCart = async () => {
        if (!product) return;

        try {
            setAddingToCart(true);
            setError(null);

            const request: CartItemRequest = {
                productId: product.id,
                quantity: quantity
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

                // Reset quantity
                setQuantity(1);
            } else {
                setError(response.message || 'Failed to add product to cart');
            }
        } catch (error) {
            console.error('Error adding product to cart:', error);
            setError('Failed to add product to cart. Please try again.');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleCartUpdate = () => {
        // Refresh cart item count when cart is updated from sidebar
        loadCartItemCount();
    };

    const addRelatedToCart = async (relatedProduct: Product) => {
        try {
            setError(null);

            const request: CartItemRequest = {
                productId: relatedProduct.id,
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
                console.log('Related product added to cart successfully');

                // Open cart sidebar automatically
                setIsCartOpen(true);
            } else {
                setError(response.message || 'Failed to add product to cart');
            }
        } catch (error) {
            console.error('Error adding related product to cart:', error);
            setError('Failed to add product to cart. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading product...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
                    <p className="text-gray-600">The product you're looking for doesn't exist.</p>
                    <Link href="/products" className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
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
                        <Link href="/products" className="hover:text-indigo-600">Products</Link>
                        <span>›</span>
                        <span className="text-gray-900">{product.categoryName}</span>
                        <span>›</span>
                        <span className="text-gray-900">{product.name}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                        {/* Product Images */}
                        <div>
                            <div className="bg-gray-100 rounded-2xl p-8 mb-4 relative">
                                {/* Wishlist Button - Top Right */}
                                <div className="absolute top-4 right-4 z-10">
                                    <WishlistButton
                                        productId={product.id}
                                        size="md"
                                        variant="icon"
                                        className="bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200"
                                    />
                                </div>
                                <img
                                    src={product.images?.[selectedImage]?.imageUrl || '/api/placeholder/500/500'}
                                    alt={product.name}
                                    className="w-full h-96 object-contain"
                                />
                            </div>
                            {product.images && product.images.length > 1 && (
                                <div className="flex space-x-4 overflow-x-auto">
                                    {product.images.map((image, index) => (
                                        <button
                                            key={image.id}
                                            onClick={() => setSelectedImage(index)}
                                            className={`flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg border-2 ${
                                                selectedImage === index ? 'border-indigo-600' : 'border-transparent'
                                            }`}
                                        >
                                            <img
                                                src={image.imageUrl}
                                                alt={`${product.name} ${index + 1}`}
                                                className="w-full h-full object-cover rounded"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

                            {/* Brand and SKU */}
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                                {product.brandName && (
                                    <span>Brand: <strong>{product.brandName}</strong></span>
                                )}
                                <span>SKU: <strong>{product.sku}</strong></span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center space-x-4 mb-6">
                                <span className="text-3xl font-bold text-gray-900">
                                    {formatCurrency(product.price)}
                                </span>
                                {product.compareAtPrice && product.compareAtPrice > product.price && (
                                    <>
                                        <span className="text-xl text-gray-500 line-through">
                                            {formatCurrency(product.compareAtPrice)}
                                        </span>
                                        <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                                            Save {formatCurrency(product.compareAtPrice - product.price)}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Stock Status */}
                            <div className="mb-6">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    product.inStock
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                                {product.lowStock && product.inStock && (
                                    <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                                        Low Stock
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            <div className="prose prose-gray mb-6">
                                <p>{product.description}</p>
                            </div>

                            {/* Quantity and Add to Cart */}
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                    <button
                                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                        disabled={addingToCart}
                                    >
                                        -
                                    </button>
                                    <span className="px-4 py-2 border-l border-r border-gray-300">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(prev => prev + 1)}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                        disabled={addingToCart}
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={addToCart}
                                    disabled={!product.inStock || addingToCart}
                                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                                        !product.inStock
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : addingToCart
                                                ? 'bg-indigo-400 text-white cursor-wait'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                                >
                                    {addingToCart ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Adding...
                                        </div>
                                    ) : product.inStock ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                            </div>

                            {/* Product Features */}
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <span className="mr-2">🚚</span>
                                    Free shipping on orders over $50
                                </div>
                                <div className="flex items-center">
                                    <span className="mr-2">↩️</span>
                                    30-day return policy
                                </div>
                                <div className="flex items-center">
                                    <span className="mr-2">🛡️</span>
                                    1-year warranty
                                </div>
                                <div className="flex items-center">
                                    <span className="mr-2">📞</span>
                                    24/7 customer support
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Attributes */}
                    {product.attributes && product.attributes.length > 0 && (
                        <div className="mb-16">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
                            <div className="bg-gray-50 rounded-2xl p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {product.attributes.map((attribute) => (
                                        <div key={attribute.id} className="flex justify-between py-2 border-b border-gray-200">
                                            <span className="font-medium text-gray-700">{attribute.name}</span>
                                            <span className="text-gray-600">{attribute.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {relatedProducts.map((relatedProduct) => (
                                    <div key={relatedProduct.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group relative">

                                        {/* Wishlist Button for Related Products */}
                                        <div className="absolute top-3 right-3 z-10">
                                            <WishlistButton
                                                productId={relatedProduct.id}
                                                size="sm"
                                                variant="icon"
                                                className="bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                                            />
                                        </div>

                                        <img
                                            src={relatedProduct.images?.[0]?.imageUrl || '/api/placeholder/300/300'}
                                            alt={relatedProduct.name}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                                {relatedProduct.name}
                                            </h3>
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className="text-lg font-bold text-gray-900">
                                                    {formatCurrency(relatedProduct.price)}
                                                </span>
                                                {relatedProduct.compareAtPrice && (
                                                    <span className="text-sm text-gray-500 line-through">
                                                        {formatCurrency(relatedProduct.compareAtPrice)}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => addRelatedToCart(relatedProduct)}
                                                disabled={!relatedProduct.inStock}
                                                className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                                                    relatedProduct.inStock
                                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                            >
                                                {relatedProduct.inStock ? 'Add to Cart' : 'Out of Stock'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            {/* Reviews Section */}
            <ReviewSection
                productId={parseInt(productId)}
                productName={product.name}
            />
            <Footer />

            <CartSidebar
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                onCartUpdate={handleCartUpdate}
            />
        </div>
    );
}