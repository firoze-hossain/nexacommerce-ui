// app/products/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Product } from '@/app/lib/types/product';
import { ProductService } from '@/app/lib/api/product-service';
import Header from '@/app/components/customers/header';
import Footer from '@/app/components/customers/footer';
import CartSidebar from '@/app/components/customers/cart-sidebar';
import { formatCurrency } from '@/app/lib/utils/formatters';

export default function ProductDetailPage() {
    const params = useParams();
    const productId = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (productId) {
            loadProduct();
        }
    }, [productId]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const response = await ProductService.getProductById(parseInt(productId));
            if (response.success && response.data) {
                setProduct(response.data);
                loadRelatedProducts(response.data.categoryId);
            }
        } catch (error) {
            console.error('Error loading product:', error);
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

    const addToCart = () => {
        if (!product) return;

        setCartItems(prev => {
            const existingItem = prev.find(item => item.productId === product.id);
            if (existingItem) {
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, {
                productId: product.id,
                product,
                quantity: quantity,
                price: product.price
            }];
        });
        setQuantity(1);
    };

    const removeFromCart = (productId: number) => {
        setCartItems(prev => prev.filter(item => item.productId !== productId));
    };

    const updateCartQuantity = (productId: number, newQuantity: number) => {
        if (newQuantity === 0) {
            removeFromCart(productId);
            return;
        }
        setCartItems(prev =>
            prev.map(item =>
                item.productId === productId ? { ...item, quantity: newQuantity } : item
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
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header
                cartItemCount={getCartItemCount()}
                onCartClick={() => setIsCartOpen(true)}
            />

            <main className="py-8">
                <div className="container mx-auto px-4">
                    {/* Breadcrumb */}
                    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
                        <a href="/" className="hover:text-indigo-600">Home</a>
                        <span>›</span>
                        <a href="/products" className="hover:text-indigo-600">Products</a>
                        <span>›</span>
                        <a href={`/categories/${product.categoryId}`} className="hover:text-indigo-600">{product.categoryName}</a>
                        <span>›</span>
                        <span className="text-gray-900">{product.name}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                        {/* Product Images */}
                        <div>
                            <div className="bg-gray-100 rounded-2xl p-8 mb-4">
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
                                    >
                                        -
                                    </button>
                                    <span className="px-4 py-2 border-l border-r border-gray-300">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(prev => prev + 1)}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={addToCart}
                                    disabled={!product.inStock}
                                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                                        product.inStock
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
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
                                    <div key={relatedProduct.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
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
                                                onClick={() => {
                                                    const productToAdd = relatedProduct;
                                                    setCartItems(prev => {
                                                        const existing = prev.find(item => item.productId === productToAdd.id);
                                                        if (existing) {
                                                            return prev.map(item =>
                                                                item.productId === productToAdd.id
                                                                    ? { ...item, quantity: item.quantity + 1 }
                                                                    : item
                                                            );
                                                        }
                                                        return [...prev, {
                                                            productId: productToAdd.id,
                                                            product: productToAdd,
                                                            quantity: 1,
                                                            price: productToAdd.price
                                                        }];
                                                    });
                                                }}
                                                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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