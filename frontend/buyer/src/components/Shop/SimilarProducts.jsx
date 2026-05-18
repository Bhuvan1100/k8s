import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { fetchSimilarProducts } from '../../Stores/Data';
import ProductCard from '../Cards/Card';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../Spinner/Spinner';

export default function SimilarProducts({ category, excludeId }) {
  const [currentPage, setCurrentPage] = useState(0);

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['similarProducts', category, excludeId],
    queryFn: () => fetchSimilarProducts({ category, excludeId }),
    enabled: !!category && !!excludeId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return null;
  }

  /* ---------- DEFAULT FALLBACK (UNCHANGED) ---------- */
  const defaultProducts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80",
      category: "Dresses",
      name: "Cropped Faux Leather Jacket",
      price: 29,
      rating: 3,
      reviewCount: "8k+"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80",
      category: "Accessories",
      name: "Classic Leather Handbag",
      price: 45,
      rating: 5,
      reviewCount: "12k+"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&q=80",
      category: "Footwear",
      name: "Elegant Ankle Boots",
      price: 89,
      rating: 4,
      reviewCount: "5k+"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80",
      category: "Tops",
      name: "Casual Cotton Blouse",
      price: 35,
      rating: 4,
      reviewCount: "3k+"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80",
      category: "Dresses",
      name: "Summer Floral Dress",
      price: 55,
      rating: 5,
      reviewCount: "15k+"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80",
      category: "Outerwear",
      name: "Denim Jacket Classic",
      price: 65,
      rating: 4,
      reviewCount: "7k+"
    },
    {
      id: 7,
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80",
      category: "Accessories",
      name: "Designer Sunglasses",
      price: 120,
      rating: 5,
      reviewCount: "9k+"
    },
    {
      id: 8,
      image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400&q=80",
      category: "Footwear",
      name: "White Sneakers",
      price: 75,
      rating: 4,
      reviewCount: "11k+"
    }
  ];

  /* ---------- LOGIC ONLY (NO UI CHANGE) ---------- */
  const displayProducts =
    products.length > 0 ? products.slice(0, 8) : defaultProducts;

  const itemsPerPage = 4;
  const shouldPaginate = displayProducts.length > itemsPerPage;
  const totalPages = shouldPaginate
    ? Math.ceil(displayProducts.length / itemsPerPage)
    : 1;

  const startIndex = shouldPaginate ? currentPage * itemsPerPage : 0;
  const visibleProducts = displayProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  /* ---------- UI (UNCHANGED) ---------- */
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold pr-2">Similar</h2>
          <h2 className="text-2xl font-bold text-black">Products</h2>
        </div>
        <div className="mt-2 h-1 w-16 bg-black rounded-full"></div>
      </div>

      {/* Products Grid */}
      <div className="overflow-hidden">
        <div className="grid grid-cols-4 gap-4">
          {visibleProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="block"
            >
              <ProductCard {...product} />
            </Link>
          ))}
        </div>
      </div>

      {/* Navigation (ONLY if needed) */}
      {shouldPaginate && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className={`p-1.5 rounded-full border transition-all duration-200 ${
              currentPage === 0
                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>

          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentPage === index
                    ? 'bg-black w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages - 1}
            className={`p-1.5 rounded-full border transition-all duration-200 ${
              currentPage === totalPages - 1
                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
