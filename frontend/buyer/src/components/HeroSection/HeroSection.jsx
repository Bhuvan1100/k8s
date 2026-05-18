import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useThemeStore from '../../Stores/ThemeStore';
import ProductCard from '../Cards/Card';
import TrendyProductsSection from '../Trendy/Tredny';

// Lazy load image component with intersection observer
const LazyImage = ({ blur, full, alt, className, overlayStyles, children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(blur);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const img = new Image();
          img.src = full;
          img.onload = () => {
            setCurrentSrc(full);
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
  }, [full]);

  return (
    <div ref={imgRef} className={className}>
      <img
        src={currentSrc}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition duration-500 ease-out ${!isLoaded ? 'blur-[0.5px] opacity-80' : 'blur-0 opacity-100'
          }`}
      />
      <div className={overlayStyles} />
      {children}
    </div>
  );
};

export default function HeroSection() {
  const { darkMode } = useThemeStore();

  const collections = {
    women: {
      blur: 'https://res.cloudinary.com/dg0lez6mp/image/upload/f_auto,q_10,e_blur:200,w_50/Women1_rkevtr.png',
      full: 'https://res.cloudinary.com/dg0lez6mp/image/upload/f_auto,q_auto,w_1400/Women1_rkevtr.png',
      label: 'WOMEN COLLECTION',
      route: '/womensCollections',
      textColor: 'text-gray-200',
      overlay: 'absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent',
    },
    men: {
      blur: 'https://res.cloudinary.com/dg0lez6mp/image/upload/f_auto,q_10,e_blur:200,w_50/Mens_lzlfdk.png',
      full: 'https://res.cloudinary.com/dg0lez6mp/image/upload/f_auto,q_auto,w_800/Mens_lzlfdk.png',
      label: 'MEN COLLECTION',
      route: '/mensCollections',
      textColor: 'text-black',
      overlay: 'absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent',
    },
    kids: {
      blur: 'https://res.cloudinary.com/dg0lez6mp/image/upload/f_auto,q_10,e_blur:200,w_50/kid1_z3jbfj.png',
      full: 'https://res.cloudinary.com/dg0lez6mp/image/upload/f_auto,q_auto,w_800/kid1_z3jbfj.png',
      label: 'KIDS COLLECTION',
      route: '/kidscollections',
      textColor: 'text-black',
      overlay: 'absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent',
    },
  };

  const CollectionCard = ({ collection, height, bottomSpacing = 'bottom-10', leftSpacing = 'left-10' }) => (
    <Link
      to={collection.route}
      className="relative overflow-hidden rounded-none shadow-md hover:shadow-xl transition-shadow duration-300 group block"
    >
      <LazyImage
        blur={collection.blur}
        full={collection.full}
        alt={collection.label}
        className={`relative ${height}`}
        overlayStyles={collection.overlay}
      >
        <div className={`absolute ${bottomSpacing} ${leftSpacing}`}>
          <p className={`text-xs font-semibold mb-4 ${collection.textColor === 'text-gray-200' ? 'text-gray-200' : 'text-gray-700'} tracking-wide`}>
            HOT LIST
          </p>
          <h2 className={`text-2xl font-bold ${collection.textColor} tracking-tight`}>
            {collection.label}
          </h2>
          <div className={`flex items-center ${collection.textColor} font-semibold text-sm relative`}>
            SHOP NOW
            <span className={`absolute bottom-0 left-0 w-10 h-px ${collection.textColor === 'text-gray-200' ? 'bg-gray-200' : 'bg-black'} group-hover:w-18 transition-all duration-300`} />
          </div>
        </div>
      </LazyImage>
    </Link>
  );

return (
  <>
    <div className={`h-auto mb-10 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CollectionCard
            collection={collections.women}
            height="h-112.5"
          />
          <div className="flex flex-col gap-6">
            <CollectionCard
              collection={collections.men}
              height="h-53"
              bottomSpacing="bottom-8"
              leftSpacing="left-8"
            />
            <CollectionCard
              collection={collections.kids}
              height="h-53"
              bottomSpacing="bottom-8"
              leftSpacing="left-8"
            />
          </div>
        </div>
      </div>
    </div>
    <div className=''>
    <TrendyProductsSection/>
    </div>
  </>
);
}
