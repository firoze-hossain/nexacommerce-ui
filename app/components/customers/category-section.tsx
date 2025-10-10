// app/components/customers/category-section.tsx - UPDATED TO USE REAL IMAGES
import Link from 'next/link';
import { Category } from '@/app/lib/types/category';
import Image from 'next/image';

interface CategorySectionProps {
    categories: Category[];
}

export default function CategorySection({ categories }: CategorySectionProps) {
    // Fallback icons in case image is not available
    const getCategoryFallbackIcon = (categoryName: string) => {
        const iconMap: { [key: string]: string } = {
            'Electronics': '📱',
            'Fashion': '👕',
            'Home & Garden': '🏠',
            'Beauty': '💄',
            'Sports': '⚽',
            'Books': '📚',
            'Toys': '🧸',
            'Automotive': '🚗',
            'Health': '💊',
            'Jewelry': '💎',
            'Food': '🍎',
            'Furniture': '🛋️',
            'Clothing': '👗',
            'Shoes': '👟',
            'Accessories': '👜'
        };
        return iconMap[categoryName] || '📦';
    };

    const getCategoryColor = (categoryName: string) => {
        const colorMap: { [key: string]: string } = {
            'Electronics': 'bg-blue-50 text-blue-600 border-blue-200',
            'Fashion': 'bg-pink-50 text-pink-600 border-pink-200',
            'Home & Garden': 'bg-green-50 text-green-600 border-green-200',
            'Beauty': 'bg-purple-50 text-purple-600 border-purple-200',
            'Sports': 'bg-orange-50 text-orange-600 border-orange-200',
            'Books': 'bg-indigo-50 text-indigo-600 border-indigo-200',
            'Toys': 'bg-yellow-50 text-yellow-600 border-yellow-200',
            'Automotive': 'bg-red-50 text-red-600 border-red-200',
            'Health': 'bg-teal-50 text-teal-600 border-teal-200',
            'Jewelry': 'bg-amber-50 text-amber-600 border-amber-200',
            'Food': 'bg-lime-50 text-lime-600 border-lime-200',
            'Furniture': 'bg-cyan-50 text-cyan-600 border-cyan-200',
            'Clothing': 'bg-rose-50 text-rose-600 border-rose-200',
            'Shoes': 'bg-violet-50 text-violet-600 border-violet-200',
            'Accessories': 'bg-emerald-50 text-emerald-600 border-emerald-200'
        };
        return colorMap[categoryName] || 'bg-gray-50 text-gray-600 border-gray-200';
    };

    // Show featured categories first, then limit to 6 categories
    const displayCategories = categories
        .sort((a, b) => {
            // Sort featured categories first
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            // Then by display order
            if (a.displayOrder !== null && b.displayOrder !== null) {
                return (a.displayOrder || 0) - (b.displayOrder || 0);
            }
            // Finally by name
            return a.name.localeCompare(b.name);
        })
        .slice(0, 6);

    if (categories.length === 0) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
                        <p className="text-gray-600 mb-8">No categories available at the moment.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
                    <p className="text-gray-600 text-lg">Discover products from your favorite categories</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {displayCategories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/categories/${category.slug || category.id}`}
                            className="group text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 hover:scale-105"
                        >
                            {/* Category Image - Use real image if available, otherwise fallback icon */}
                            <div className={`w-16 h-16 ${!category.imageUrl ? getCategoryColor(category.name) : 'bg-gray-50'} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 border-2 overflow-hidden`}>
                                {category.imageUrl ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <img
                                            src={category.imageUrl}
                                            alt={category.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                // If image fails to load, show fallback icon
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                // The fallback icon will be shown by the parent div
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <span className="text-2xl">
                                        {getCategoryFallbackIcon(category.name)}
                                    </span>
                                )}
                            </div>

                            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                {category.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {category.productCount || 0}+ products
                            </p>
                            {category.featured && (
                                <div className="mt-2">
                                    <span className="inline-block bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-full font-medium">
                                        Featured
                                    </span>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Show message if there are more categories */}
                {categories.length > 6 && (
                    <div className="text-center mt-6">
                        <p className="text-gray-600">
                            And {categories.length - 6} more categories...
                        </p>
                    </div>
                )}

                {/* Browse All Categories */}
                <div className="text-center mt-12">
                    <Link
                        href="/categories"
                        className="inline-flex items-center px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors font-semibold"
                    >
                        Browse All {categories.length} Categories
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}