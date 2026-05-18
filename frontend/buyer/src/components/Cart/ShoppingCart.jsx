import { Link, useNavigate } from 'react-router-dom';
import React from 'react';
import { TrashIcon, ShoppingCartIcon, HomeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import useUserStore from '../../Stores/UserStore';
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { checkoutPreview } from '../../Stores/Data';

const CartCard = ({ item, onQuantityChange, onRemove }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${item.productId}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="flex gap-5 p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all cursor-pointer hover:shadow-lg"
    >
      {/* Product Image */}
      <div className="relative shrink-0">
        <img
          src={item.image}
          alt={item.title}
          className="w-32 h-32 object-cover rounded-lg"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{item.title}</h3>

          {item.size && (
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-600">Size:</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-900 text-sm font-semibold rounded-lg">
                {item.size}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            {item.salePrice && item.salePrice < item.price ? (
              <>
                <p className="text-2xl font-bold text-gray-900">${item.salePrice.toFixed(2)}</p>
                <p className="text-base text-gray-500 line-through">${item.price.toFixed(2)}</p>
                <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">
                  SALE
                </span>
              </>
            ) : (
              <p className="text-2xl font-bold text-gray-900">${item.price.toFixed(2)}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">Quantity:</span>
            <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuantityChange(item, -1);
                }}
                className="px-4 py-2 hover:bg-gray-100 transition-colors font-bold text-gray-700 text-lg"
              >
                −
              </button>

              <span className="px-6 py-2 border-x-2 border-gray-300 min-w-15 text-center font-bold text-gray-900 text-base">
                {item.quantity}
              </span>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (item.quantity >= 10) {
                    toast.info("Maximum 10 items per product", {
                      style: { fontSize: "15px" },
                    });
                    return;
                  }

                  if (item.quantity >= item.availableQuantity) {
                    toast.warning(`Only ${item.availableQuantity} available in stock`, {
                      style: { fontSize: "15px" },
                    });
                    return;
                  }

                  onQuantityChange(item, 1);
                }}
                className="px-4 py-2 hover:bg-gray-100 transition-colors font-bold text-gray-700 text-lg"
              >
                +
              </button>
            </div>

            {item.availableQuantity < 10 && (
              <span className="text-sm font-medium text-orange-600">
                Only {item.availableQuantity} left
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(item);
            }}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-semibold transition-all px-3 py-2 rounded-lg"
          >
            <TrashIcon className="w-5 h-5" />
            Remove from Cart
          </button>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between shrink-0">
        <div className="text-right">
          <p className="text-sm text-gray-500 mb-1">Subtotal</p>
          <p className="text-2xl font-bold text-gray-900">
            ${((item.salePrice || item.price) * item.quantity).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function ShoppingCart() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isLoggedIn = useUserStore(state => state.isLoggedIn);
  const isVerified = useUserStore(state => state.isVerified);
  const email = useUserStore(state => state.email);
  const authChecked = useUserStore(state => state.authChecked);

  useEffect(() => {
    if (!authChecked) return;
    if (!isLoggedIn) {
      navigate("/login");
    } else if (!isVerified) {
      navigate("/verify-email");
    }
  }, [isLoggedIn, isVerified, authChecked, navigate]);

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart', email],
    queryFn: async () => {
      const userId = localStorage.getItem('id');

      const cartResponse = await axios.post(
        '/api/buyer/cart/getcart',
        { userId, email },
        { withCredentials: true }
      );

      const basicCartItems = cartResponse.data.items || [];

      if (basicCartItems.length === 0) {
        return { items: [], totalPrice: 0 };
      }

      const uiResponse = await axios.post(
        '/api/product/cart/ui',
        {
          items: basicCartItems.map(item => ({
            productId: item.productId,
            productVariantId: item.productVariantId,
            quantity: item.quantity
          }))
        },
        { withCredentials: true }
      );

      const enrichedItems = uiResponse.data.map(uiItem => {
        const cartItem = basicCartItems.find(
          ci => ci.productId === uiItem.productId && ci.productVariantId === uiItem.productVariantId
        );

        return {
          ...uiItem,
          cartItemId: cartItem?.id,
          size: cartItem?.size,
          quantity: cartItem?.quantity || uiItem.quantity,
        };
      });

      return {
        items: enrichedItems,
        totalPrice: cartResponse.data.totalPrice || 0
      };
    },
    enabled: isLoggedIn && isVerified && !!email,
    staleTime: 0,
  });

  const items = cartData?.items || [];
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.salePrice || item.price) * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  const invalidateCart = () => {
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  };

  const handleQuantityChange = async (item, delta) => {
    const userId = localStorage.getItem('id');
    const newQuantity = item.quantity + delta;

    if (newQuantity < 1) {
      handleRemove(item);
      return;
    }

    try {
      await axios.patch(
        '/api/buyer/cart/update',
        {
          userId,
          email,
          productVariantId: item.productVariantId,
          delta
        },
        { withCredentials: true }
      );

      invalidateCart();
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast.error("Failed to update quantity");
    }
  };

  const handleRemove = async (item) => {
    const userId = localStorage.getItem('id');

    try {
      await axios.delete(
        '/api/buyer/cart/delete',
        {
          data: {
            userId,
            email,
            productVariantId: item.productVariantId
          },
          withCredentials: true
        }
      );

      invalidateCart();
      toast.success("Item removed from cart");
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error("Failed to remove item");
    }
  };

  const handleProceedToCheckout = async () => {
    try {
      const preview = await checkoutPreview(email);
      sessionStorage.setItem('sessionId', preview.sessionId);
      console.log(sessionStorage.getItem('sessionId'));
      navigate('/checkout/address');
    } catch (error) {
      console.error('[CHECKOUT_PREVIEW] Failed:', error);
      toast.error("Failed to proceed to checkout. Please try again.");
    }
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-black mx-auto"></div>
            <p className="text-gray-600 mt-6 text-lg font-medium">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingCartIcon className="w-10 h-10" />
            Shopping Cart
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <ShoppingCartIcon className="w-20 h-20 mx-auto text-gray-300 mb-6" />
                <p className="text-gray-600 text-xl font-semibold mb-3">Your cart is empty</p>
                <p className="text-gray-500 mb-8">Add some products to get started!</p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-semibold py-3 px-8 rounded-xl transition-colors shadow-lg hover:shadow-xl"
                >
                  <HomeIcon className="w-5 h-5" />
                  Start Shopping
                </Link>
              </div>
            ) : (
              items.map(item => (
                <CartCard
                  key={`${item.productId}_${item.productVariantId}`}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    {shipping === 0 ? (
                      <span className="font-semibold text-green-600">FREE</span>
                    ) : (
                      <span className="font-semibold">${shipping.toFixed(2)}</span>
                    )}
                  </div>

                  <div className="border-t-2 border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mb-3"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  Proceed to Checkout
                </button>

                <button
                  onClick={handleContinueShopping}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}