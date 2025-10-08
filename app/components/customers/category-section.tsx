// app/components/customers/category-section.tsx
import Link from 'next/link';
import { Category } from '@/app/lib/types/category';

interface CategorySectionProps {
    categories: Category[];
}

export default function CategorySection({ categories }: CategorySectionProps) {
    const popularCategories = [
        { name: 'Electronics', icon: '📱', color: 'bg-blue-50 text-blue-600' },
        { name: 'Fashion', icon: '👕', color: 'bg-pink-50 text-pink-600' },
        { name: 'Home & Garden', icon: '🏠', color: 'bg-green-50 text-green-600' },
        { name: 'Beauty', icon: '💄', color: 'bg-purple-50 text-purple-600' },
        { name: 'Sports', icon: '⚽', color: 'bg-orange-50 text-orange-600' },
        { name: 'Books', icon: '📚', color: 'bg-indigo-50 text-indigo-600' },
    ];

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
                    <p className="text-gray-600 text-lg">Discover products from your favorite categories</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {popularCategories.map((category, index) => (
                        <Link
                            key={index}
                            href={`/categories/${category.name.toLowerCase()}`}
                            className="group text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-indigo-300 transition-all duration-300"
                        >
                            <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <span className="text-2xl">{category.icon}</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {category.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">100+ products</p>
                        </Link>
                    ))}
                </div>

                {/* Browse All Categories */}
                <div className="text-center mt-12">
                    <Link
                        href="/categories"
                        className="inline-flex items-center px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors font-semibold"
                    >
                        Browse All Categories
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}