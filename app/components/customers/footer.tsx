// app/components/customers/footer.tsx
export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">N</span>
                            </div>
                            <span className="text-xl font-bold">NexaCommerce</span>
                        </div>
                        <p className="text-gray-400 mb-4">
                            Your one-stop destination for all your shopping needs. Quality products, amazing prices.
                        </p>
                        <div className="flex space-x-4">
                            <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                                <span>📘</span>
                            </button>
                            <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                                <span>🐦</span>
                            </button>
                            <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                                <span>📷</span>
                            </button>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
                            <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
                            <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
                            <li><a href="/terms" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                            <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Customer Service</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="/shipping" className="hover:text-white transition-colors">Shipping Info</a></li>
                            <li><a href="/returns" className="hover:text-white transition-colors">Returns & Exchanges</a></li>
                            <li><a href="/size-guide" className="hover:text-white transition-colors">Size Guide</a></li>
                            <li><a href="/warranty" className="hover:text-white transition-colors">Warranty</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Stay Updated</h3>
                        <p className="text-gray-400 mb-4">
                            Subscribe to get special offers, free giveaways, and exclusive deals.
                        </p>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button className="bg-indigo-600 px-4 py-2 rounded-r-lg hover:bg-indigo-700 transition-colors">
                                Subscribe
                            </button>
                        </div>
                        <div className="mt-6">
                            <h4 className="font-semibold mb-2">Download Our App</h4>
                            <div className="flex space-x-2">
                                <button className="flex items-center space-x-2 bg-black px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                                    <span>📱</span>
                                    <span className="text-sm">App Store</span>
                                </button>
                                <button className="flex items-center space-x-2 bg-black px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                                    <span>🤖</span>
                                    <span className="text-sm">Google Play</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2024 NexaCommerce. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}