import React, { useEffect, useState } from 'react';
import { ShoppingCartIcon, StarIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/solid';
import { toast } from 'sonner';
import ProductInfo from './ProductInfo';
import SimilarProducts from './SimilarProducts';
import { useNavigate } from 'react-router-dom'
import { useParams } from "react-router-dom";
import { Link } from 'react-router-dom';
import LoadingSpinner from '../Spinner/Spinner';
import { fetchProductById } from '../../Stores/Data';
import { useQuery } from '@tanstack/react-query';
import useCartStore from '../../Stores/ProductStore';
import useUserStore from '../../Stores/UserStore';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function ProductPage() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const navigate = useNavigate();
  const isLoggedIn = useUserStore(state => state.isLoggedIn);
  const isVerified = useUserStore(state => state.isVerified);
  const email = useUserStore(state => state.email);
  const queryClient = useQueryClient();

  const {
    items,
    addItem,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart,
    totalItems,
    totalPrice,
  } = useCartStore();

  useEffect(() => {
    setQuantity(1);
    setSelectedImage(0);
    setSelectedVariant(null);
  }, [id]);

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
    enabled: !!id,
  });

  // Set default variant when data loads
  useEffect(() => {
    if (data?.product?.variants && data.product.variants.length > 0 && !selectedVariant) {
      // Select first active variant by default
      const firstActive = data.product.variants.find(v => v.isActive);
      if (firstActive) {
        setSelectedVariant(firstActive);
      }
    }
  }, [data, selectedVariant]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-lg font-semibold text-gray-900">
          ❌ Failed to load product
        </p>
        <p className="text-sm text-gray-500">
          The product may not exist or something went wrong.
        </p>

        <div className="flex gap-3 mt-2">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 text-sm font-semibold bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { product, additionalInfo, reviews, category } = data;

  const handleQuantityChange = (type) => {
    const availableStock = selectedVariant
      ? selectedVariant.availableQuantity
      : data?.additionalInfo?.totalQuantity ?? 10;

    const maxAllowed = Math.min(availableStock, 10);

    if (quantity >= maxAllowed && type === 'increase') {
      toast.info(`Cannot add more than ${maxAllowed} of this item`, {
        style: { fontSize: "15px" },
      });
      return;
    }
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const addToCart = async () => {
    // ✅ VALIDATION CODE
    if (!isLoggedIn) {
      toast.info("Please login to purchase products", {
        style: { fontSize: "15px" },
        action: {
          label: "Login",
          onClick: () => navigate("/login"),
        },
      });
      return;
    }

    if (!isVerified) {
      toast.info("Please verify-email to purchase products", {
        style: { fontSize: "15px" },
        action: {
          label: "verify-email",
          onClick: () => navigate("/verify-email"),
        },
      });
      return;
    }

    // Check if variants exist and one is selected
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      toast.info("Please select a size", {
        style: {
          fontSize: "15px",
        },
      });
      return;
    }

    // Get userId from localStorage
    const userId = localStorage.getItem('id');
    if (!userId) {
      toast.error("User ID not found. Please login again.", {
        style: { fontSize: "15px" },
      });
      return;
    }

    try {
      // Make API call to backend
      const response = await axios.post(
        '/api/buyer/cart/additem',
        {
          userId: userId,
          email: email,
          productId: product.id,
          productVariantId: selectedVariant ? selectedVariant.id : null,
          size: selectedVariant ? selectedVariant.size : null,
          quantity: quantity,
          priceSnapshot: selectedVariant ? selectedVariant.price : product.price,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.message === "PRODUCT_VARIANT_ALREADY_IN_CART") {
        toast.info("Product already in cart", {
          style: {
            fontSize: "15px",
          },
        });
        return;
      }

      queryClient.invalidateQueries(['cart']);


      toast(
        <div className="flex items-center justify-between gap-4 mt-3 w-full px-5 py-3 bg-white border border-gray-200 rounded-md shadow-md">
          <div>
            <p className="font-semibold text-base text-gray-900">
              ✅ Added to cart
            </p>
            <p className="text-sm text-gray-500">
              Item ready for checkout
            </p>
          </div>

          <button
            onClick={() => navigate("/cart")}
            className="px-4 py-2 ml-2 text-sm font-semibold text-white bg-black rounded-lg cursor-pointer hover:bg-gray-900 transition"
          >
            Go to cart
          </button>
        </div>,
        {
          duration: 2000,
          unstyled: true,
        }
      );

    } catch (error) {
      console.error('Add to cart error:', error);

      if (error.response?.data?.message === "PRODUCT_VARIANT_ALREADY_IN_CART") {
        toast.info("Product already in cart", {
          style: {
            fontSize: "15px",
          },
        });
      } else {
        toast.error("Failed to add item to cart. Please try again.", {
          style: {
            fontSize: "15px",
          },
        });
      }
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <StarIcon
        key={index}
        className={`w-5 h-5 ${index < Math.floor(rating)
          ? 'text-yellow-400'
          : index < rating
            ? 'text-yellow-400 opacity-50'
            : 'text-gray-300'
          }`}
      />
    ));
  };

  // Check if product has variants
  const hasVariants = product.variants && product.variants.length > 0;
  const activeVariants = hasVariants ? product.variants.filter(v => v.isActive) : [];

  // Build only 3 key features: Category, SubCategory, and Variants count
  const keyFeatures = [
    `Category: ${product.category || category}`,
    product.subCategory ? `Sub-Category: ${product.subCategory}` : null,
    activeVariants.length > 0 ? `${activeVariants.length} size variant${activeVariants.length > 1 ? 's' : ''} available` : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen py-4">
      <div className="max-w-6xl mx-auto px-4">
        {/* Product Section */}
        <div className="rounded-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Side - Images */}
            <div className="lg:col-span-3 flex gap-4">
              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex flex-col gap-3 w-24">
                  {product.images.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                        ? 'border-blue-500'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image */}
              <div className="flex-1 rounded-lg overflow-hidden bg-gray-100" style={{ height: '500px' }}>
                <img
                  src={product.images && product.images[selectedImage] ? product.images[selectedImage] : product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Side - Product Details */}
            <div className="lg:col-span-2 space-y-4">
              {/* Product Name */}
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">{renderStars(product.rating || 0)}</div>
                <span className="text-sm font-semibold text-gray-900">
                  {product.rating || 0}
                </span>
                <span className="text-sm text-green-600 font-medium">
                  {product.rating >= 4 ? 'Excellent' : product.rating >= 3 ? 'Good' : 'Average'}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  ${selectedVariant ? selectedVariant.price : product.price}
                </span>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {(selectedVariant ? selectedVariant.availableQuantity > 0 : product.inStock) ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 font-medium text-sm">In Stock</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-700 font-medium text-sm">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>

              {/* Key Features - Only 3: Category, SubCategory, Variants */}
              {keyFeatures.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Key Features:</h3>
                  <ul className="space-y-1.5">
                    {keyFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700 text-sm">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Size Variants - Show S, M, L (short codes) */}
              {activeVariants.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Size
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {activeVariants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        disabled={variant.availableQuantity === 0}
                        className={`px-4 py-2 border-2 rounded-lg font-medium text-sm transition-all ${selectedVariant?.id === variant.id
                          ? 'border-black bg-black text-white'
                          : variant.availableQuantity === 0
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        {variant.size}
                      </button>
                    ))}
                  </div>
                  {selectedVariant && (
                    <p className="text-xs text-gray-500 mt-2">
                      {selectedVariant.availableQuantity} units available
                    </p>
                  )}
                </div>
              )}

              {/* Quantity Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange('decrease')}
                      className="p-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <MinusIcon className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="px-4 py-2 text-base font-semibold border-x border-gray-300">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange('increase')}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <PlusIcon className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <button
                    onClick={addToCart}
                    disabled={selectedVariant ? selectedVariant.availableQuantity === 0 : !product.inStock}
                    className={`w-full font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors ${(selectedVariant ? selectedVariant.availableQuantity > 0 : product.inStock)
                      ? 'bg-black hover:bg-gray-800 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    <ShoppingCartIcon className="w-5 h-5" />
                    {(selectedVariant ? selectedVariant.availableQuantity > 0 : product.inStock) ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='m-10'>
        <ProductInfo
          description={product.description}
          additionalInfo={additionalInfo}
          reviews={reviews}
          productId={product.id}
          currentRating={product.rating || 0}
        />
      </div>
      <SimilarProducts
        category={category}
        excludeId={product.id}
      />
    </div>
  );
}