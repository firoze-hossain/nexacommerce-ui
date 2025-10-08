// app/components/customers/featured-products.tsx
import { Product } from '@/app/lib/types/product';

interface FeaturedProductsProps {
    products: Product[];
    onAddToCart: (product: Product) => void;
}

export default function FeaturedProducts({ products, onAddToCart }: FeaturedProductsProps) {
    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
                        <p className="text-gray-600">Handpicked items just for you</p>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-500 font-semibold">
                        View All →
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.slice(0, 8).map((product) => (
                        <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                            {/* Product Image */}
                            <div className="relative overflow-hidden bg-gray-100">
                                <img
                                    src={product.images?.[0]?.imageUrl || '/api/placeholder/300/300'}
                                    alt={product.name}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {product.featured && (
                                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                        Featured
                                    </div>
                                )}
                                {product.compareAtPrice && product.compareAtPrice > product.price && (
                                    <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                        {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                    {product.name}
                                </h3>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                    {product.shortDescription}
                                </p>

                                {/* Price */}
                                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-lg font-bold text-gray-900">
                    ${product.price}
                  </span>
                                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                                        <span className="text-sm text-gray-500 line-through">
                      ${product.compareAtPrice}
                    </span>
                                    )}
                                </div>

                                {/* Stock Status */}
                                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                                    {product.lowStock && (
                                        <span className="text-sm text-orange-600">Low Stock</span>
                                    )}
                                </div>

                                {/* Add to Cart Button */}
                                <button
                                    onClick={() => onAddToCart(product)}
                                    disabled={!product.inStock}
                                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                                        product.inStock
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}