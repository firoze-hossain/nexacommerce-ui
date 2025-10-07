// app/page.tsx - REPLACE YOUR CURRENT FILE WITH THIS
'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/components/customers/header';
import HeroSection from '@/app/components/customers/hero-section';
import CategorySection from '@/app/components/customers/category-section';
import FeaturedProducts from '@/app/components/customers/featured-products';
import HotDeals from '@/app/components/customers/hot-deals';
//import BrandSection from '@/app/components/customers/brand-section';
import Footer from '@/app/components/customers/footer';
import CartSidebar from '@/app/components/customers/cart-sidebar';
import { Product } from '@/app/lib/types/product';
import { Category } from '@/app/lib/types/category';
import { useAuth } from '@/app/hooks/useAuth'; // Named import

export default function HomePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            // Mock data - replace with actual API calls
            const mockProducts: Product[] = [
                {
                    id: 1,
                    vendorId: 1,
                    vendorName: 'TechStore',
                    categoryId: 1,
                    categoryName: 'Electronics',
                    name: 'Wireless Bluetooth Headphones',
                    description: 'High-quality wireless headphones with noise cancellation',
                    shortDescription: 'Wireless headphones with 30hr battery',
                    price: 99.99,
                    compareAtPrice: 149.99,
                    stock: 50,
                    lowStockThreshold: 10,
                    sku: 'WH-001',
                    barcode: '123456789',
                    trackQuantity: true,
                    allowBackorder: false,
                    weight: 0.3,
                    weightUnit: 'kg',
                    status: 'ACTIVE',
                    featured: true,
                    published: true,
                    metaTitle: 'Wireless Headphones',
                    metaDescription: 'Best wireless headphones',
                    tags: 'electronics,audio,wireless',
                    inStock: true,
                    lowStock: false,
                    available: true,
                    images: [{ id: 1, imageUrl: '/api/placeholder/300/300', altText: 'Headphones', displayOrder: 1, isPrimary: true }],
                    attributes: [],
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01'
                },
                // Add more mock products as needed
            ];

            const mockCategories: Category[] = [
                {
                    id: 1,
                    name: 'Electronics',
                    description: 'Latest gadgets and electronics',
                    slug: 'electronics',
                    imageUrl: null,
                    displayOrder: 1,
                    featured: true,
                    active: true,
                    parentId: null,
                    parentName: null,
                    productCount: 50,
                    childrenCount: 0,
                    children: [],
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01'
                },
                // Add more mock categories
            ];

            setProducts(mockProducts);
            setCategories(mockCategories);
        } catch (error) {
            console.error('Error loading data:', error);
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
                    <p className="mt-4 text-gray-600">Loading...</p>
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

            <main>
                <HeroSection />
                <CategorySection categories={categories} />
                <FeaturedProducts
                    products={products}
                    onAddToCart={addToCart}
                />
                <HotDeals
                    products={products.slice(0, 4)}
                    onAddToCart={addToCart}
                />
                {/*<BrandSection />*/}
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