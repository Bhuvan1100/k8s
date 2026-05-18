import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPinIcon, ShoppingBagIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import useUserStore from '../../Stores/UserStore';

export default function ConfirmCart() {
  const navigate = useNavigate();
  const isLoggedIn = useUserStore(state => state.isLoggedIn);
  const isVerified = useUserStore(state => state.isVerified);
  const email = useUserStore(state => state.email);

  useEffect(() => {
    if (!isLoggedIn) navigate('/login', { replace: true });
    else if (!isVerified) navigate('/verify-email', { replace: true });
  }, [isLoggedIn, isVerified, navigate]);

  // Get address from localStorage
  const savedAddress = (() => {
    try {
      return JSON.parse(localStorage.getItem('checkoutAddress')) || null;
    } catch {
      return null;
    }
  })();

  // Fetch cart items (same pattern as ShoppingCart.jsx)
  const { data: cartData, isLoading } = useQuery({
    queryKey: ['confirmCart', email],
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
  const subtotal = items.reduce((sum, item) => sum + (item.salePrice || item.price) * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleProceedToPayment = async () => {
    const sessionId = sessionStorage.getItem('sessionId');
    const userId = localStorage.getItem('id');

    if (!sessionId || !userId) {
      toast.error('Session expired. Please start checkout again.');
      navigate('/cart');
      return;
    }

    try {
      const res = await axios.post(
        '/api/checkout/session/commit',
        { sessionId, userId },
        { withCredentials: true }
      );

      // Store orderId and expiresAt for payment page
      sessionStorage.setItem('orderId', res.data.orderId);
      sessionStorage.setItem('paymentExpiresAt', res.data.expiresAt);

      navigate('/checkout/payment');
    } catch (error) {
      console.error('[COMMIT_CHECKOUT_SESSION] Failed:', error);
      const msg = error?.response?.data?.message || 'Failed to proceed to payment.';
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 border-t-black mx-auto" />
          <p className="mt-4 text-gray-500 font-medium">Loading your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingBagIcon className="w-8 h-8" />
            Confirm Your Order
          </h1>
          <p className="text-gray-500 mt-1">Review your items and delivery details before payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Address + Items */}
          <div className="lg:col-span-2 space-y-6">

            {/* Delivery Address */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-gray-600" />
                  Delivery Address
                </h2>
                <button
                  onClick={() => navigate('/checkout/address')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Change
                </button>
              </div>

              {savedAddress ? (
                <div className="bg-gray-50 rounded-lg p-4 text-gray-700 leading-relaxed">
                  <p className="font-semibold text-gray-900">{savedAddress.street}</p>
                  <p>{savedAddress.city}, {savedAddress.state} {savedAddress.zipCode}</p>
                  <p>{savedAddress.country}</p>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <p>No address found.</p>
                  <button
                    onClick={() => navigate('/checkout/address')}
                    className="mt-2 text-sm text-blue-600 font-medium hover:underline"
                  >
                    Add address
                  </button>
                </div>
              )}
            </div>

            {/* Cart Items */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">
                  Order Items ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                </h2>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ShoppingBagIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {items.map(item => (
                    <div
                      key={`${item.productId}_${item.productVariantId}`}
                      className="flex gap-4 p-5 hover:bg-gray-50 transition-colors"
                    >
                      {/* Image */}
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200 shrink-0"
                      />

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm mb-1">{item.title}</h3>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                          {item.size && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded-md font-medium text-gray-700">
                              Size: {item.size}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-gray-100 rounded-md font-medium text-gray-700">
                            Qty: {item.quantity}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          {item.salePrice && item.salePrice < item.price ? (
                            <>
                              <span className="text-sm font-bold text-gray-900">${item.salePrice.toFixed(2)}</span>
                              <span className="text-xs text-gray-400 line-through">${item.price.toFixed(2)}</span>
                              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">SALE</span>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-gray-900">${item.price.toFixed(2)}</span>
                          )}
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-gray-400 mb-0.5">Subtotal</p>
                        <p className="font-bold text-gray-900">
                          ${((item.salePrice || item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="font-semibold text-green-600">FREE</span>
                  ) : (
                    <span className="font-semibold text-gray-900">${shipping.toFixed(2)}</span>
                  )}
                </div>

                {shipping > 0 && (
                  <p className="text-xs text-gray-400">Free shipping on orders over $100</p>
                )}

                <div className="border-t-2 border-gray-100 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={items.length === 0 || !savedAddress}
                className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mb-3"
              >
                <CheckCircleIcon className="w-5 h-5" />
                Proceed to Payment
              </button>

              <button
                onClick={() => navigate('/checkout/address')}
                className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium py-2 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Address
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}