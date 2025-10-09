// app/page.tsx - REPLACE YOUR CURRENT FILE WITH THIS
'use client';

import {useEffect, useState} from 'react';
import Header from '@/app/components/customers/header';
import HeroSection from '@/app/components/customers/hero-section';
import CategorySection from '@/app/components/customers/category-section';
import FeaturedProducts from '@/app/components/customers/featured-products';
import HotDeals from '@/app/components/customers/hot-deals';
import BrandSection from '@/app/components/customers/brand-section';
import Footer from '@/app/components/customers/footer';
import CartSidebar from '@/app/components/customers/cart-sidebar';
import {Product} from '@/app/lib/types/product';
import {Category} from '@/app/lib/types/category';
import {useAuth} from '@/app/hooks/useAuth'; // Named import
import {ProductService} from '@/app/lib/api/product-service';
import {CategoryService} from '@/app/lib/api/category-service';

export default function HomePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const {isAuthenticated, user} = useAuth();
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load featured products
            const featuredResponse = await ProductService.getFeaturedProducts();
            if (featuredResponse.success && featuredResponse.data) {
                setFeaturedProducts(featuredResponse.data);
            }

            // Load latest products for hot deals
            const latestResponse = await ProductService.getAllProducts(0, 8, 'createdAt', 'desc');
            if (latestResponse.success && latestResponse.data) {
                setProducts(latestResponse.data.items);
            }

            // Load categories
            const categoriesResponse = await CategoryService.getCategories(0, 8);
            if (categoriesResponse.success && categoriesResponse.data) {
                setCategories(categoriesResponse.data.items);
            }

        } catch (error) {
            console.error('Error loading data:', error);
            setError('Failed to load data. Please try again later.');
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
                        ? {...item, quantity: item.quantity + 1}
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
                item.productId === productId ? {...item, quantity} : item
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
                <HeroSection/>
                <CategorySection categories={categories}/>
                <FeaturedProducts
                    products={products}
                    onAddToCart={addToCart}
                />
                <HotDeals
                    products={products.slice(0, 4)}
                    onAddToCart={addToCart}
                />
                <BrandSection/>
            </main>

            <Footer/>

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