// ShopPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import ProductCard from '../Cards/Card';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../Spinner/Spinner';
import { useQuery } from "@tanstack/react-query";
import { useParams } from 'react-router-dom';
import MoreOptions from './MoreOptions';
import { fetchProductsByCategory } from '../../Stores/Data';

// PaginatedGrid Component
const PaginatedGrid = ({ allData = [], pagination = {}, onPageChange, scrollRef, isLoading }) => {
  const [sortOrder, setSortOrder] = useState('none');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { label: 'Price: Low to High', value: 'low-to-high' },
    { label: 'Price: High to Low', value: 'high-to-low' },
  ];

  const sortedData = [...allData].sort((a, b) => {
    if (sortOrder === 'low-to-high') return a.price - b.price;
    if (sortOrder === 'high-to-low') return b.price - a.price;
    return 0;
  });

  const handleNext = () => {
    if (pagination.page < pagination.totalPages) {
      onPageChange(pagination.page + 1);
    }
  };

  const handlePrevious = () => {
    if (pagination.page > 1) {
      onPageChange(pagination.page - 1);
    }
  };

  const handleSelect = (option) => {
    setSortOrder(option.value);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!scrollRef?.current) return;

    const startY = window.scrollY;
    const targetY =
      scrollRef.current.getBoundingClientRect().top +
      window.scrollY -
      130;

    const duration = 500;
    let startTime = null;

    const easeInOut = (t) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const animateScroll = (time) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easedProgress = easeInOut(progress);
      const currentY = startY + (targetY - startY) * easedProgress;

      window.scrollTo(0, currentY);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }, [pagination.page, scrollRef]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="flex justify-end mb-6">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between px-6 py-3 bg-white border border-gray-200 rounded-2xl shadow-lg hover:bg-gray-50 transition-colors duration-200 min-w-55 text-gray-800"
          >
            <span className="text-[15px]">Sort by Price</span>
            <ChevronDownIcon
              className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <div className={`absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-10 transition-all duration-300 origin-top ${isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
            {options.map((option, index) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-6 py-3 text-[15px] text-gray-800 hover:bg-gray-100 transition-colors duration-150 ${index !== options.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {sortedData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">No products found in this category.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-10">
            {sortedData.map((item) => (
              <Link key={item.id} to={`/product/${item.id}`} className="block">
                <ProductCard
                  image={item.image}
                  category={item.category}
                  name={item.name}
                  price={item.price}
                  rating={item.rating}
                  ratingCount={item.ratingCount}
                />
              </Link>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-6 mt-8">
              <button
                onClick={handlePrevious}
                disabled={pagination.page === 1}
                className="text-[18px] font-medium disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 hover:text-black transition-colors relative group"
              >
                Previous
                {pagination.page > 1 && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-current w-1/2"></span>
                )}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-current w-0 group-hover:w-full transition-all duration-300"></span>
              </button>

              <span className="text-[18px] font-semibold">
                {pagination.page} / {pagination.totalPages}
              </span>

              <button
                onClick={handleNext}
                disabled={pagination.page === pagination.totalPages}
                className="text-[18px] font-medium disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 hover:text-black transition-colors relative group"
              >
                Next
                {pagination.page < pagination.totalPages && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-current w-1/2"></span>
                )}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-current w-0 group-hover:w-[85%] transition-all duration-300"></span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ShopPage
const ShopPage = ({ heading = "Shop Collection" }) => {
  const headingRef = useRef(null);
  const navigate = useNavigate();
  const { slug } = useParams();
  const [currentPage, setCurrentPage] = useState(1);

  const parsedSlug = slug ? slug.split('-') : [];
  const category = parsedSlug[0] || '';
  const subCategory = parsedSlug.slice(1).join('') || '';

  const finalHeading = slug
    ? slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    : heading;

  const words = finalHeading.split(' ');
  const firstWord = words[0];
  const restWords = words.slice(1).join(' ');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["productsByCategory", category, subCategory, currentPage],
    queryFn: () => fetchProductsByCategory(category, subCategory, currentPage),
    enabled: !!category && !!subCategory,
  });

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [category, subCategory]);

  if (!category || !subCategory) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-lg font-semibold text-gray-900">❌ Invalid category URL</p>
        <p className="text-sm text-gray-500">Please select a valid category from the menu.</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2 text-sm font-semibold bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          Go Home
        </button>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-lg font-semibold text-gray-900">❌ Failed to load products</p>
        <p className="text-sm text-gray-500">Something went wrong while fetching the products.</p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 text-sm font-semibold bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Go Back
          </button>
          <button
            onClick={() => refetch()}
            className="px-5 py-2 text-sm font-semibold bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <h1
        ref={headingRef}
        className="text-4xl text-center mb-9 text-gray-900 scroll-mt-35"
      >
        <span className="font-bold relative inline-block">
          {firstWord}
          <span className="absolute left-0 -bottom-1 w-full h-1 bg-black"></span>
        </span>{' '}
        <span className="font-light text-gray-500">{restWords}</span>
      </h1>

      <PaginatedGrid
        allData={data?.products || []}
        pagination={data?.pagination || {}}
        onPageChange={handlePageChange}
        scrollRef={headingRef}
        isLoading={isLoading}
      />
      <MoreOptions />
    </div>
  );
};

export default ShopPage;