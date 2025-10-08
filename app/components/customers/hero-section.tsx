// app/components/customers/hero-section.tsx
export default function HeroSection() {
    return (
        <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-6">
                        <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                            🎉 10.10 BRAND RUSH - Limited Time Offer
                        </div>
                        <h1 className="text-5xl font-bold leading-tight">
                            Big Shot Savings
                            <span className="block text-yellow-300">Too Hot to Miss!</span>
                        </h1>
                        <p className="text-xl text-indigo-100">
                            Discover amazing deals on top brands. Up to 75% OFF on selected items.
                            Shop now and save big!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-colors text-lg">
                                🛍️ Shop Now
                            </button>
                            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors text-lg">
                                🔥 View Deals
                            </button>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-indigo-200">
                            <span>✅ Free Shipping</span>
                            <span>✅ Secure Payment</span>
                            <span>✅ 30-Day Returns</span>
                        </div>
                    </div>

                    {/* Right Content - Hero Image */}
                    <div className="relative">
                        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                            <div className="text-center">
                                <div className="text-6xl mb-4">🛒</div>
                                <h3 className="text-2xl font-bold mb-2">Download Our App</h3>
                                <p className="text-indigo-200 mb-4">Get exclusive app-only deals</p>
                                <div className="flex justify-center space-x-4">
                                    <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                        <span>📱</span>
                                        <span>App Store</span>
                                    </button>
                                    <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                        <span>🤖</span>
                                        <span>Google Play</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
                        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-pink-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}