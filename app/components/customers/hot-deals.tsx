// app/components/customer/hot-deals.tsx
import { Product } from '@/app/lib/types/product';

interface HotDealsProps {
    products: Product[];
    onAddToCart: (product: Product) => void;
}

export default function HotDeals({ products, onAddToCart }: HotDealsProps) {
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
                    {products.map((product) => (
                        <div key={product.id} className="bg-white rounded-2xl shadow-lg border-2 border-red-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                            {/* Sale Badge */}
                            <div className="bg-red-600 text-white text-center py-2 font-bold">
                                UP TO 75% OFF
                            </div>

                            <div className="p-4">
                                <div className="text-center mb-4">
                                    <img
                                        src={product.images?.[0]?.imageUrl || '/api/placeholder/200/200'}
                                        alt={product.name}
                                        className="w-32 h-32 object-cover mx-auto rounded-lg"
                                    />
                                </div>

                                <h3 className="font-semibold text-gray-900 text-center mb-2 line-clamp-2">
                                    {product.name}
                                </h3>

                                <div className="text-center mb-4">
                                    <div className="flex items-center justify-center space-x-2">
                    <span className="text-2xl font-bold text-red-600">
                      ${product.price}
                    </span>
                                        {product.compareAtPrice && (
                                            <span className="text-lg text-gray-500 line-through">
                        ${product.compareAtPrice}
                      </span>
                                        )}
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Sold: 24</span>
                                        <span>Available: 12</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-red-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                                    </div>
                                </div>

                                {/* Timer */}
                                <div className="text-center mb-4">
                                    <div className="text-sm text-gray-600 mb-2">Offer ends in:</div>
                                    <div className="flex justify-center space-x-2 text-sm">
                                        <span className="bg-gray-900 text-white px-2 py-1 rounded">02</span>:
                                        <span className="bg-gray-900 text-white px-2 py-1 rounded">45</span>:
                                        <span className="bg-gray-900 text-white px-2 py-1 rounded">18</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onAddToCart(product)}
                                    className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-8">
                    <button className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                        View All Hot Deals
                    </button>
                </div>
            </div>
        </section>
    );
}