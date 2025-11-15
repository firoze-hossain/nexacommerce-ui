// app/components/customers/hero-section.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { HeroContent } from '@/app/lib/types/hero';
import { HeroService } from '@/app/lib/api/hero-service';

export default function HeroSection() {
    const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFeature, setActiveFeature] = useState(0);
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();
    const impressionRecorded = useRef(false);

    const features = [
        { icon: '⚡', text: 'Fast Delivery', color: 'from-blue-400 to-cyan-500' },
        { icon: '🔒', text: 'Secure Payment', color: 'from-purple-400 to-pink-500' },
        { icon: '⭐', text: 'Premium Quality', color: 'from-yellow-400 to-orange-500' },
        { icon: '↩️', text: 'Easy Returns', color: 'from-green-400 to-emerald-500' }
    ];

    useEffect(() => {
        loadHeroContent();

        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % features.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [isAuthenticated]);

    useEffect(() => {
        if (heroContent && !impressionRecorded.current) {
            HeroService.recordImpression(heroContent.id);
            impressionRecorded.current = true;
        }
    }, [heroContent]);

    const loadHeroContent = async () => {
        try {
            setIsLoading(true);
            const response = await HeroService.getMainHeroContent();

            if (response.success && response.data) {
                setHeroContent(response.data as HeroContent);
            } else {
                setDefaultHeroContent();
            }
        } catch (err) {
            console.error('Failed to load hero content:', err);
            setDefaultHeroContent();
        } finally {
            setIsLoading(false);
        }
    };

    const setDefaultHeroContent = () => {
        const defaultContent: HeroContent = {
            id: 0,
            title: "Dinamaka Offer",
            subtitle: "Boro Dinamaka Offer",
            description: "Exclusive deals with premium quality products and easy returns. Click to explore amazing offers!",
            backgroundImage: "/images/hero/default-banner.jpg",
            overlayColor: "#4F46E5",
            overlayOpacity: 0.8,
            active: true,
            displayOrder: 10,
            button1Text: "Shop Now",
            button1Url: "/products",
            button1Color: "#FBBF24",
            button2Text: "View Offers",
            button2Url: "/deals",
            button2Color: "#FFFFFF",
            type: "MAIN_BANNER",
            targetAudience: "ALL",
            impressions: 0,
            clicks: 0,
            conversionRate: 0,
            startDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setHeroContent(defaultContent);
    };

    const handleButtonClick = async (buttonUrl: string, heroId: number) => {
        await HeroService.recordClick(heroId);
        router.push(buttonUrl);
    };

    const handleQuickAction = (action: string) => {
        if (heroContent) {
            HeroService.recordClick(heroContent.id);
        }

        const routes: { [key: string]: string } = {
            'trending': '/products?filter=trending',
            'sale': '/products?filter=sale',
            'new': '/products?filter=new',
            'premium': '/collections/premium'
        };

        router.push(routes[action] || '/products');
    };

    if (isLoading) {
        return <HeroSkeleton />;
    }

    if (!heroContent) {
        return null;
    }

    return (
        <section
            className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 text-white overflow-hidden min-h-[420px] flex items-center"
            style={{
                backgroundImage: `linear-gradient(rgba(15, 23, 42, ${heroContent.overlayOpacity || 0.85}), rgba(88, 28, 135, ${heroContent.overlayOpacity || 0.7})), url('${heroContent.backgroundImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-8 right-8 w-20 h-20 bg-white/5 rounded-full blur-lg"></div>
                <div className="absolute bottom-8 left-8 w-16 h-16 bg-purple-500/10 rounded-full blur-lg"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-center">

                        {/* Left Content - Main Text & CTA */}
                        <div className="lg:col-span-6 space-y-5">
                            {/* Badge */}
                            <div className="inline-flex items-center px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/20">
                                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                                Exclusive Offer
                            </div>

                            {/* Main Content */}
                            <div className="space-y-3">
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                                    {heroContent.title}
                                </h1>

                                {heroContent.subtitle && (
                                    <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-yellow-300 leading-relaxed">
                                        {heroContent.subtitle}
                                    </h2>
                                )}

                                <p className="text-base text-white/80 leading-relaxed">
                                    {heroContent.description}
                                </p>
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-2 gap-2 max-w-sm">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center space-x-2 p-2 rounded-lg border transition-all duration-300 ${
                                            activeFeature === index
                                                ? 'bg-white/10 border-yellow-400 shadow-sm'
                                                : 'bg-white/5 border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center text-sm shadow-sm`}>
                                            {feature.icon}
                                        </div>
                                        <span className="font-medium text-xs text-white">
                                            {feature.text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    onClick={() => handleButtonClick(heroContent.button1Url!, heroContent.id)}
                                    className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    {heroContent.button1Text}
                                </button>

                                <button
                                    onClick={() => handleButtonClick(heroContent.button2Url!, heroContent.id)}
                                    className="px-5 py-2.5 border border-white/30 hover:border-white/50 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm hover:bg-white/5"
                                >
                                    {heroContent.button2Text}
                                </button>
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex items-center gap-4 text-xs text-white/70">
                                <div className="flex items-center space-x-1">
                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="font-medium">Live Support</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <span className="text-yellow-400">⭐ 4.9/5</span>
                                    <span className="font-medium">Rating</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Quick Actions & User Welcome */}
                        <div className="lg:col-span-4 space-y-4">

                            {/* Quick Actions */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 shadow-md">
                                <h3 className="text-base font-bold text-white mb-3 text-center">Quick Access</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { icon: '🔥', label: 'Trending', action: 'trending' },
                                        { icon: '💎', label: 'Premium', action: 'premium' },
                                        { icon: '🆕', label: 'New', action: 'new' },
                                        { icon: '💫', label: 'Sale', action: 'sale' }
                                    ].map((item) => (
                                        <button
                                            key={item.action}
                                            onClick={() => handleQuickAction(item.action)}
                                            className="flex flex-col items-center p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 group"
                                        >
                                            <span className="text-xl mb-1 group-hover:scale-110 transition-transform duration-300">
                                                {item.icon}
                                            </span>
                                            <span className="font-semibold text-white text-xs">
                                                {item.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Personalized Welcome */}
                            {isAuthenticated && user && (
                                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-lg p-3 border border-green-400/30 shadow-md">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                                            <span className="text-white text-sm font-bold">✓</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold text-sm">
                                                Welcome, {user.name?.split(' ')[0]}
                                            </p>
                                            <p className="text-white/70 text-xs">
                                                Member offers available
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                <div className="w-4 h-6 border border-white/30 rounded-full flex justify-center">
                    <div className="w-1 h-1.5 bg-white/60 rounded-full mt-1.5 animate-bounce"></div>
                </div>
            </div>
        </section>
    );
}

// Skeleton Loader
function HeroSkeleton() {
    return (
        <section className="bg-gradient-to-r from-slate-800 to-slate-900 animate-pulse min-h-[420px] flex items-center">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-center">
                        {/* Left Content Skeleton */}
                        <div className="lg:col-span-6 space-y-5">
                            <div className="h-6 w-32 bg-slate-700 rounded-full"></div>
                            <div className="space-y-3">
                                <div className="h-8 bg-slate-700 rounded w-3/4"></div>
                                <div className="h-6 bg-slate-700 rounded w-1/2"></div>
                                <div className="h-5 bg-slate-700 rounded w-2/3"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 max-w-sm">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-12 bg-slate-700 rounded-lg"></div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <div className="h-10 w-28 bg-slate-700 rounded-lg"></div>
                                <div className="h-10 w-28 bg-slate-700 rounded-lg"></div>
                            </div>
                        </div>

                        {/* Right Content Skeleton */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="h-32 bg-slate-700 rounded-lg"></div>
                            <div className="h-16 bg-slate-700 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}