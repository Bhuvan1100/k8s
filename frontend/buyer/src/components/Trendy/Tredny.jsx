import React, { useState } from 'react';
import { Link } from "react-router-dom";
import ProductCard from '../Cards/Card';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../Spinner/Spinner';
import { fetchProductsByTags } from '../../Stores/Data';

export default function TrendyProductsSection() {
    const [activeFilter, setActiveFilter] = useState('ALL');

    // Fetch products with TanStack Query v5 (object syntax)
    const { data: productsByTags, isLoading, isError } = useQuery({
        queryKey: ['trendyProducts'],
        queryFn: fetchProductsByTags,
    });

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <div className="text-center text-red-500">Error loading products</div>;

    // Filter buttons
    const filters = [
        { label: 'ALL', key: 'ALL' },
        { label: 'NEW ARRIVALS', key: 'NEW_ARRIVALS' },
        { label: 'BEST SELLER', key: 'BEST_SELLER' },
        { label: 'TOP RATED', key: 'TOP_RATED' }
    ];

    // Get products for active filter
    const currentProducts = productsByTags[activeFilter] || [];

    return (
        <div className="max-w-6xl mx-auto px-4 pt-4 pb-16">
            {/* Header */}
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
                OUR TRENDY PRODUCTS
            </h2>

            {/* Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
                {filters.map((filter) => (
                    <button
                        key={filter.key}
                        onClick={() => setActiveFilter(filter.key)}
                        className={`relative text-sm md:text-base font-medium transition-colors group ${activeFilter === filter.key
                            ? 'text-black'
                            : 'text-gray-500 hover:text-black'
                            }`}
                    >
                        {filter.label}
                        <span
                            className={`absolute top-6 left-0 h-0.5 bg-black transition-all duration-500 ${activeFilter === filter.key
                                ? 'w-3/4'
                                : 'w-0 group-hover:w-3/4'
                                }`}
                        />
                    </button>
                ))}
            </div>

            {/* Products Grid - Maximum 8 products */}
            {currentProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {currentProducts.map((product) => (
                        <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            className="block"
                        >
                            <ProductCard
                                image={product.image}
                                category={product.category}
                                name={product.name}
                                price={product.price}
                                rating={product.rating}
                                ratingCount={product.ratingCount}
                            />
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 py-12">
                    No products available
                </div>
            )}

            {/* Discover More */}
            <div className="relative mx-auto my-10 w-fit text-sm font-semibold cursor-pointer group">
                DISCOVER MORE
                <span
                    className="absolute left-0 -bottom-1 h-0.5 w-1/2 bg-black transition-all duration-300 group-hover:w-3/4"
                />
            </div>
        </div>
    );
}