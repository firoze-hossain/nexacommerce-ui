// app/components/customers/hot-deals.tsx
import { Product } from '@/app/lib/types/product';
import { HotDeal } from '@/app/lib/types/hot-deal';
import { useEffect, useState } from 'react';
import { HotDealService } from '@/app/lib/api/hot-deal-service';

interface HotDealsProps {
    onAddToCart: (product: Product, hotDeal?: HotDeal) => void;
}

export default function HotDeals({ onAddToCart }: HotDealsProps) {
    const [hotDeals, setHotDeals] = useState<HotDeal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadHotDeals();
    }, []);

    const loadHotDeals = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await HotDealService.getActiveHotDeals();

            if (response.success && response.data) {
                setHotDeals(response.data);
            } else {
                setError('Failed to load hot deals');
            }
        } catch (err) {
            console.error('Error loading hot deals:', err);
            setError('Failed to load hot deals');
        } finally {
            setLoading(false);
        }
    };

    const calculateTimeLeft = (endDate: string) => {
        const difference = new Date(endDate).getTime() - new Date().getTime();

        if (difference <= 0) {
            return { hours: 0, minutes: 0, seconds: 0 };
        }

        return {
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
    };

    const [timeLeft, setTimeLeft] = useState<{[key: number]: {hours: number, minutes: number, seconds: number}}>({});

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft: {[key: number]: {hours: number, minutes: number, seconds: number}} = {};
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

    if (loading) {
        return (
            <section className="py-16 bg-gradient-to-r from-red-50 to-orange-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-full text-sm font-semibold mb-4">
                            🔥 HOT DEALS
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Too Hot, Big Shot Savings</h2>
                        <p className="text-gray-600">Loading amazing deals...</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-lg border-2 border-red-200 overflow-hidden animate-pulse">
                                <div className="h-48 bg-gray-300"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                    <div className="h-10 bg-gray-300 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-16 bg-gradient-to-r from-red-50 to-orange-50">
                <div className="container mx-auto px-4 text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-full text-sm font-semibold mb-4">
                        🔥 HOT DEALS
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Too Hot, Big Shot Savings</h2>
                    <p className="text-gray-600 mb-4">Limited time offers - Don't miss out!</p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                        <p className="text-red-800">{error}</p>
                    </div>
                </div>
            </section>
        );
    }

    if (hotDeals.length === 0) {
        return null; // Don't show section if no active hot deals
    }

    return (
        <section className="py-16 bg-gradient-to-r from-red-50 to-orange-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-full text-sm font-semibold mb-4">
                        🔥 HOT DEALS
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Too Hot, Big Shot Savings</h2>
                    <p className="text-gray-600">Limited time offers - Don't miss out!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {hotDeals.slice(0, 4).map((deal) => (
                        <div key={deal.id} className="bg-white rounded-2xl shadow-lg border-2 border-red-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                            {/* Sale Badge */}
                            <div className="bg-red-600 text-white text-center py-2 font-bold">
                                {deal.discountType === 'PERCENTAGE'
                                    ? `SAVE ${deal.discountValue}%`
                                    : `SAVE $${deal.discountValue}`
                                }
                            </div>

                            <div className="p-4">
                                <div className="text-center mb-4">
                                    <img
                                        src={deal.product?.images?.[0]?.imageUrl || '/api/placeholder/200/200'}
                                        alt={deal.product?.name}
                                        className="w-32 h-32 object-cover mx-auto rounded-lg"
                                    />
                                </div>

                                <h3 className="font-semibold text-gray-900 text-center mb-2 line-clamp-2">
                                    {deal.product?.name}
                                </h3>

                                <div className="text-center mb-4">
                                    <div className="flex items-center justify-center space-x-2">
                                        <span className="text-2xl font-bold text-red-600">
                                            ${deal.dealPrice.toFixed(2)}
                                        </span>
                                        <span className="text-lg text-gray-500 line-through">
                                            ${deal.originalPrice.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                {deal.stockLimit && (
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                            <span>Sold: {deal.soldCount}</span>
                                            <span>Available: {deal.remainingStock}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-red-600 h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min((deal.soldCount / deal.stockLimit) * 100, 100)}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Timer */}
                                <div className="text-center mb-4">
                                    <div className="text-sm text-gray-600 mb-2">Offer ends in:</div>
                                    <div className="flex justify-center space-x-1 text-sm">
                                        <span className="bg-gray-900 text-white px-2 py-1 rounded">
                                            {formatTime(timeLeft[deal.id]?.hours || 0)}
                                        </span>:
                                        <span className="bg-gray-900 text-white px-2 py-1 rounded">
                                            {formatTime(timeLeft[deal.id]?.minutes || 0)}
                                        </span>:
                                        <span className="bg-gray-900 text-white px-2 py-1 rounded">
                                            {formatTime(timeLeft[deal.id]?.seconds || 0)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onAddToCart(deal.product!, deal)}
                                    disabled={deal.stockLimit && deal.remainingStock === 0}
                                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                                        deal.stockLimit && deal.remainingStock === 0
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                            : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                                >
                                    {deal.stockLimit && deal.remainingStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-8">
                    <button
                        onClick={() => window.location.href = '/hot-deals'}
                        className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                        View All Hot Deals
                    </button>
                </div>
            </div>
        </section>
    );
}