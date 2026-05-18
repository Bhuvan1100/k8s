import React, { useState, useRef, useEffect } from 'react';
import ProductCard from '../Cards/Card';
import CategoryCard from '../Cards/Card1';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import MoreOptions from './MoreOptions';
import { Link } from 'react-router-dom';
// PaginatedGrid Component
const PaginatedGrid = ({ allData = [], maxPageNumbers = 5, scrollRef, firstWord }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(allData.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = allData.slice(startIndex, endIndex);

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    if (!scrollRef?.current) return;

    const startY = window.scrollY;
    const targetY =
      scrollRef.current.getBoundingClientRect().top +
      window.scrollY -
      130; // matches scroll-mt-35 (~35 * 4px)

    const duration = 500; // ⬅️ increase = slower scroll
    let startTime = null;

    const easeInOut = (t) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const animateScroll = (time) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easedProgress = easeInOut(progress);
      const currentY =
        startY + (targetY - startY) * easedProgress;

      window.scrollTo(0, currentY);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }, [currentPage, scrollRef]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {currentItems.map((item, index) => (
          <Link
            key={index}
            to={`/category/${firstWord}-${item.category
              .toLowerCase()
              .trim()
              .replace(/\s+/g, "-")}`} // change route if needed
            className="block"
          >
            <CategoryCard
              image={item.image}
              category={item.category}
              name={item.name}
              itemCount={item.itemCount}
            />
          </Link>
        ))}
      </div>

      {allData.length > itemsPerPage && (
        <div className="flex items-center justify-center gap-6 mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 0}
            className="text-[18px] font-medium disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 hover:text-black transition-colors relative group"
          >
            Previous
            {currentPage > 0 && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-current w-1/2"></span>
            )}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-current w-0 group-hover:w-full transition-all duration-300"></span>
          </button>

          <span className="text-[18px] font-semibold">{currentPage + 1}</span>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages - 1}
            className="text-[18px] font-medium disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 hover:text-black transition-colors relative group"
          >
            Next
            {currentPage < totalPages - 1 && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-current w-1/2"></span>
            )}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-current w-0 group-hover:w-[85%] transition-all duration-300"></span>
          </button>
        </div>
      )}

    </div>
  );
};

// Mainmarket
const Mainmarket = ({ heading = "Kids Collection", productData }) => {
  const headingRef = useRef(null);
  const words = heading.split(' ');
  const firstWord = words[0]; // Mens
  const restWords = words.slice(1).join(' ');

  return (
    <div className="min-h-screen py-8">
      <h1
        ref={headingRef}
        className="text-4xl text-center mb-9 text-gray-900 scroll-mt-35"
      >
        {/* First word bold with underline */}
        <span className="font-bold relative inline-block">
          {firstWord}
          <span className="absolute left-0 -bottom-1 w-full h-1 bg-black"></span>
        </span>{' '}
        {/* Remaining words light */}
        <span className="font-light text-gray-500">{restWords}</span>
      </h1>

      <PaginatedGrid
        allData={productData}
        maxPageNumbers={5}
        scrollRef={headingRef}
        firstWord={firstWord}
      />
      <MoreOptions name={firstWord} />
    </div>
  );
};

export default Mainmarket;