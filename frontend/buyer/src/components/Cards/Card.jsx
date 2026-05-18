import React, { useState, useRef, useEffect } from 'react';
import { HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

// Lazy load image component with intersection observer
const LazyImage = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(
    src.replace('/upload/', '/upload/f_auto,q_10,e_blur:200,w_50/')
  );
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const img = new Image();
          const fullSrc = src.replace('/upload/', '/upload/f_auto,q_auto,w_800/');
          img.src = fullSrc;
          img.onload = () => {
            setCurrentSrc(fullSrc);
            setIsLoaded(true);
          };
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return (
    <div ref={imgRef} className={className}>
      <img
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover transition duration-500 ease-out ${
          !isLoaded ? 'blur-[0.5px] opacity-80' : 'blur-0 opacity-100'
        }`}
      />
    </div>
  );
};

export default function ProductCard({ 
  image = "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80",
  category = "Dresses",
  name = "Cropped Faux Leather Jacket",
  price = 29,
  rating = 3,
  ratingCount = "8k+"
}) {
  return (
    <div className="w-full max-w-sm bg-white rounded-lg overflow-hidden">
      {/* Product Image */}
      <LazyImage
        src={image}
        alt={name}
        className="relative bg-gray-50 aspect-4/5 mb-1"
      />

      {/* Product Details */}
      <div>
        {/* Category */}
        <p className="text-sm text-gray-500 mb-1">{category}</p>

        {/* Product Name */}
        <h3 className="text-l text-gray-900 ">
          {name}
        </h3>

        {/* Price */}
        <p className="text-l text-gray-900 font-semibold">${price}</p>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <StarSolidIcon
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">{ratingCount} ratings</span>
        </div>
      </div>
    </div>
  );
}