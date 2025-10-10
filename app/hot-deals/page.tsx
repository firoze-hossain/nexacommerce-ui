// app/hot-deals/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { HotDeal } from '@/app/lib/types/hot-deal';
import { HotDealService } from '@/app/lib/api/hot-deal-service';
import Header from '@/app/components/customers/header';
import Footer from '@/app/components/customers/footer';
import CartSidebar from '@/app/components/customers/cart-sidebar';
import Link from 'next/link';

export default function HotDealsPage() {
    const [hotDeals, setHotDeals] = useState<HotDeal[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('endDate');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        loadHotDeals();
    }, [sortBy, filterType]);

    const loadHotDeals = async () => {
        try {
            setLoading(true);
            const response = await HotDealService.getActiveHotDeals();
            if (response.success && response.data) {
                let filteredDeals = response.data;

                // Apply filters
                if (filterType === 'limited-stock') {
                    filteredDeals = filteredDeals.filter(deal => deal.stockLimit && deal.remainingStock && deal.remainingStock > 0);
                } else if (filterType === 'ending-soon') {
                    filteredDeals = filteredDeals.filter(deal => {
                        const timeLeft = new Date(deal.endDate).getTime() - new Date().getTime();
                        return timeLeft < 24 * 60 * 60 * 1000; // Less than 24 hours
                    });
                } else if (filterType === 'high-discount') {
                    filteredDeals = filteredDeals.filter(deal => deal.discountPercentage > 50);
                }

                // Apply sorting
                filteredDeals.sort((a, b) => {
                    switch (sortBy) {
                        case 'discount':
                            return b.discountPercentage - a.discountPercentage;
                        case 'price':
                            return a.dealPrice - b.dealPrice;
                        case 'ending':
                            return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
                        case 'popular':
                            return (b.soldCount / (b.stockLimit || 1)) - (a.soldCount / (a.stockLimit || 1));
                        default:
                            return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
                    }
                });

                setHotDeals(filteredDeals);
            }
        } catch (error) {
            console.error('Error loading hot deals:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product: any, hotDeal?: HotDeal) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item.productId === product.id);

            const price = hotDeal ? hotDeal.dealPrice : product.price;

            if (existingItem) {
                return prev.map(item =>
                    item.productId === product.id
                        ? {...item, quantity: item.quantity + 1, price}
                        : item
                );
            }
            return [...prev, {
                productId: product.id,
                product,
                quantity: 1,
                price: price,
                hotDeal: hotDeal ? {
                    id: hotDeal.id,
                    discountType: hotDeal.discountType,
                    discountValue: hotDeal.discountValue,
                    originalPrice: hotDeal.originalPrice
                } : undefined
            }];
        });

        // Increment sold count if it's a hot deal with stock limit
        if (hotDeal && hotDeal.stockLimit) {
            try {
                HotDealService.incrementSoldCount(hotDeal.id);
            } catch (err) {
                console.error('Error incrementing sold count:', err);
            }
        }
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

    const calculateTimeLeft = (endDate: string) => {
        const difference = new Date(endDate).getTime() - new Date().getTime();

        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            expired: false
        };
    };

    const [timeLeft, setTimeLeft] = useState<{[key: number]: any}>({});

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft: {[key: number]: any} = {};
            hotDeals.forEach(deal => {
                newTimeLeft[deal.id] = calculateTimeLeft(deal.endDate);
            });
            setTimeLeft(newTimeLeft);
        }, 1000);

        return () => clearInterval(timer);
    }, [hotDeals]);

    const formatTime = (time: number) => {
        return time.toString().padStart(2, '0');
    };

    const filteredDeals = hotDeals.filter(deal =>
        deal.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.product?.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getDiscountColor = (percentage: number) => {
        if (percentage >= 70) return 'bg-red-500';
        if (percentage >= 50) return 'bg-orange-500';
        if (percentage >= 30) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
                <Header cartItemCount={0} onCartClick={() => setIsCartOpen(true)} />
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-12"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, index) => (
                                <div key={index} className="bg-white rounded-2xl shadow-lg border-2 border-red-200 overflow-hidden">
                                    <div className="h-48 bg-gray-200"></div>
                                    <div className="p-4 space-y-3">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-10 bg-gray-200 rounded"></div>
                                    </div>
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
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
            <Header
                cartItemCount={getCartItemCount()}
                onCartClick={() => setIsCartOpen(true)}
            />

            <main className="py-8">
                <div className="container mx-auto px-4">
                    {/* Page Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-full text-lg font-bold mb-6 shadow-lg">
                            🔥 HOT DEALS
                        </div>
                        <h1 className="text-5xl font-bold text-gray-900 mb-4">Limited Time Offers</h1>
                        <p className="text-gray-600 text-xl max-w-2xl mx-auto">
                            Don't miss out on these incredible deals! Limited stock available at unbelievable prices.
                        </p>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-red-200">
                            <div className="text-2xl font-bold text-red-600">{hotDeals.length}</div>
                            <div className="text-sm text-gray-600">Active Deals</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-orange-200">
                            <div className="text-2xl font-bold text-orange-600">
                                {Math.max(...hotDeals.map(d => d.discountPercentage))}%
                            </div>
                            <div className="text-sm text-gray-600">Max Discount</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-yellow-200">
                            <div className="text-2xl font-bold text-yellow-600">
                                {hotDeals.filter(d => d.stockLimit && d.remainingStock && d.remainingStock < 10).length}
                            </div>
                            <div className="text-sm text-gray-600">Almost Gone</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-green-200">
                            <div className="text-2xl font-bold text-green-600">
                                {hotDeals.reduce((sum, deal) => sum + deal.soldCount, 0)}
                            </div>
                            <div className="text-sm text-gray-600">Total Sold</div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6 mb-8">
                        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                            <div className="flex-1 w-full lg:w-auto">
                                <input
                                    type="text"
                                    placeholder="Search deals by product name or SKU..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">Filter:</span>
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value="all">All Deals</option>
                                        <option value="limited-stock">Limited Stock</option>
                                        <option value="ending-soon">Ending Soon</option>
                                        <option value="high-discount">High Discount</option>
                                    </select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">Sort by:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value="endDate">Ending Soon</option>
                                        <option value="discount">Highest Discount</option>
                                        <option value="price">Lowest Price</option>
                                        <option value="popular">Most Popular</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hot Deals Grid */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">🔥 Hot Deals</h2>
                            <div className="text-sm text-gray-600">
                                {filteredDeals.length} deals available
                            </div>
                        </div>

                        {filteredDeals.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-red-200">
                                <div className="text-8xl mb-6">🔥</div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Hot Deals Found</h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    {searchTerm
                                        ? 'No deals match your search. Try different keywords or check back later for new deals!'
                                        : 'All hot deals have ended. Check back soon for new amazing offers!'
                                    }
                                </p>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                    >
                                        Clear Search
                                    </button>
                                )}
                                <Link
                                    href="/products"
                                    className="ml-4 bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                                >
                                    Browse All Products
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredDeals.map((deal) => {
                                    const timeLeftData = timeLeft[deal.id] || calculateTimeLeft(deal.endDate);
                                    const isExpired = timeLeftData.expired;

                                    return (
                                        <div
                                            key={deal.id}
                                            className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden hover:shadow-xl transition-all duration-300 ${
                                                isExpired ? 'border-gray-300 opacity-75' : 'border-red-200 hover:border-red-300'
                                            }`}
                                        >
                                            {/* Discount Badge */}
                                            <div className={`${getDiscountColor(deal.discountPercentage)} text-white text-center py-2 font-bold text-sm`}>
                                                {deal.discountType === 'PERCENTAGE'
                                                    ? `SAVE ${deal.discountValue}%`
                                                    : `SAVE $${deal.discountValue}`
                                                }
                                            </div>

                                            <div className="p-4">
                                                {/* Product Image */}
                                                <div className="text-center mb-4">
                                                    <img
                                                        src={deal.product?.images?.[0]?.imageUrl || '/api/placeholder/200/200'}
                                                        alt={deal.product?.name}
                                                        className="w-32 h-32 object-cover mx-auto rounded-lg"
                                                    />
                                                </div>

                                                {/* Product Info */}
                                                <h3 className="font-semibold text-gray-900 text-center mb-2 line-clamp-2">
                                                    {deal.product?.name}
                                                </h3>

                                                {/* Pricing */}
                                                <div className="text-center mb-4">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <span className="text-2xl font-bold text-red-600">
                                                            ${deal.dealPrice.toFixed(2)}
                                                        </span>
                                                        <span className="text-lg text-gray-500 line-through">
                                                            ${deal.originalPrice.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-green-600 font-medium mt-1">
                                                        You save ${(deal.originalPrice - deal.dealPrice).toFixed(2)}
                                                    </div>
                                                </div>

                                                {/* Progress Bar for Limited Stock */}
                                                {deal.stockLimit && (
                                                    <div className="mb-4">
                                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                            <span>Sold: {deal.soldCount}</span>
                                                            <span>Available: {deal.remainingStock}</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full ${
                                                                    (deal.soldCount / deal.stockLimit) > 0.8 ? 'bg-red-600' : 'bg-orange-500'
                                                                }`}
                                                                style={{
                                                                    width: `${Math.min((deal.soldCount / deal.stockLimit) * 100, 100)}%`
                                                                }}
                                                            ></div>
                                                        </div>
                                                        {deal.remainingStock && deal.remainingStock < 10 && (
                                                            <div className="text-xs text-red-600 font-medium text-center mt-1">
                                                                Almost gone!
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Timer */}
                                                <div className="text-center mb-4">
                                                    <div className="text-sm text-gray-600 mb-2">
                                                        {isExpired ? 'Deal expired' : 'Offer ends in:'}
                                                    </div>
                                                    {!isExpired && (
                                                        <div className="flex justify-center space-x-1 text-sm">
                                                            {timeLeftData.days > 0 && (
                                                                <>
                                                                    <span className="bg-gray-900 text-white px-2 py-1 rounded">
                                                                        {formatTime(timeLeftData.days)}d
                                                                    </span>
                                                                    <span>:</span>
                                                                </>
                                                            )}
                                                            <span className="bg-gray-900 text-white px-2 py-1 rounded">
                                                                {formatTime(timeLeftData.hours)}
                                                            </span>:
                                                            <span className="bg-gray-900 text-white px-2 py-1 rounded">
                                                                {formatTime(timeLeftData.minutes)}
                                                            </span>:
                                                            <span className="bg-gray-900 text-white px-2 py-1 rounded">
                                                                {formatTime(timeLeftData.seconds)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Add to Cart Button */}
                                                <button
                                                    onClick={() => addToCart(deal.product!, deal)}
                                                    disabled={isExpired || (deal.stockLimit && deal.remainingStock === 0)}
                                                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                                                        isExpired || (deal.stockLimit && deal.remainingStock === 0)
                                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                                            : 'bg-red-600 text-white hover:bg-red-700'
                                                    }`}
                                                >
                                                    {isExpired
                                                        ? 'Deal Expired'
                                                        : deal.stockLimit && deal.remainingStock === 0
                                                            ? 'Out of Stock'
                                                            : 'Add to Cart'
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Deal Benefits */}
                    <div className="mt-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2">Why Shop Hot Deals?</h2>
                            <p className="text-red-100">Get the best value with our exclusive limited-time offers</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <span className="text-xl">💰</span>
                                </div>
                                <h3 className="font-semibold text-sm mb-1">Massive Savings</h3>
                                <p className="text-red-100 text-xs">
                                    Up to 80% off on premium products
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <span className="text-xl">⚡</span>
                                </div>
                                <h3 className="font-semibold text-sm mb-1">Limited Time</h3>
                                <p className="text-red-100 text-xs">
                                    Deals expire quickly - act fast!
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <span className="text-xl">📦</span>
                                </div>
                                <h3 className="font-semibold text-sm mb-1">Limited Stock</h3>
                                <p className="text-red-100 text-xs">
                                    Exclusive quantities available
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <span className="text-xl">🛡️</span>
                                </div>
                                <h3 className="font-semibold text-sm mb-1">Full Warranty</h3>
                                <p className="text-red-100 text-xs">
                                    Same quality with better prices
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Never Miss a Deal!</h3>
                        <p className="text-gray-600 mb-4">
                            Subscribe to get notified about new hot deals and exclusive offers
                        </p>
                        <div className="flex max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <button className="bg-red-600 text-white px-6 py-3 rounded-r-lg font-semibold hover:bg-red-700 transition-colors">
                                Subscribe
                            </button>
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