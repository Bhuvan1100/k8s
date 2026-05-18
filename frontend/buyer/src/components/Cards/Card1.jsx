import React, { useState, useRef, useEffect } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

/* Lazy Image (same logic, reused) */
const LazyImage = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(
    src.replace("/upload/", "/upload/f_auto,q_10,e_blur:200,w_50/")
  );
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = new Image();
          const fullSrc = src.replace(
            "/upload/",
            "/upload/f_auto,q_auto,w_800/"
          );
          img.src = fullSrc;
          img.onload = () => {
            setCurrentSrc(fullSrc);
            setIsLoaded(true);
          };
          observer.disconnect();
        }
      },
      { rootMargin: "50px" }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div ref={imgRef} className={className}>
      <img
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover transition duration-500 ${
          isLoaded ? "blur-0 opacity-100" : "blur-sm opacity-80"
        }`}
      />
    </div>
  );
};

/* Collection Card */
export default function CategoryCard({
  image = "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80",
  category = "Pants",
  name = "Slim Fit Pants",
  itemCount = "120+ styles"
}) {
  return (
    <div className="group w-full max-w-sm cursor-pointer">
      {/* Image */}
      <div className="relative overflow-hidden rounded-lg aspect-4/5 bg-gray-100">
        <LazyImage
          src={image}
          alt={name}
          className="absolute inset-0"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition" />

        {/* CTA */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white opacity-0 group-hover:opacity-100 transition">
          <span className="text-sm font-medium">Explore</span>
          <ArrowRightIcon className="w-4 h-4" />
        </div>
      </div>

      {/* Text */}
      <div className="mt-3">
        <p className="text-sm text-gray-500">{category}</p>
        <h3 className="text-lg font-medium text-gray-900">{name}</h3>
        <p className="text-sm text-gray-600">{itemCount}</p>
      </div>
    </div>
  );
}
