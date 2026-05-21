import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { TruckIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import useUserStore from '../../Stores/UserStore';

export default function PaymentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isLoggedIn = useUserStore(state => state.isLoggedIn);
  const isVerified = useUserStore(state => state.isVerified);

  useEffect(() => {
    if (!isLoggedIn) navigate("/login", { replace: true });
    else if (!isVerified) navigate("/verify-email", { replace: true });
  }, [isLoggedIn, isVerified, navigate]);

  // Pull orderId and expiry from sessionStorage (set by ConfirmCart after commit)
  const orderId = sessionStorage.getItem('orderId');
  const paymentExpiresAt = sessionStorage.getItem('paymentExpiresAt');

  const address = (() => {
    try {
      return JSON.parse(localStorage.getItem('checkoutAddress')) || null;
    } catch { return null; }
  })();

  // Calculate initial time left from expiresAt, fallback to 15 min
  const getInitialTimeLeft = () => {
    if (paymentExpiresAt) {
      const diff = Math.floor((new Date(paymentExpiresAt) - Date.now()) / 1000);
      return diff > 0 ? diff : 0;
    }
    return 15 * 60;
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getInitialTimeLeft);
  const hasExpired = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Redirect if no orderId
  useEffect(() => {
    if (!orderId) {
      toast.error('No active order found. Please start checkout again.');
      navigate('/cart', { replace: true });
    }
  }, [orderId, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!hasExpired.current) {
            hasExpired.current = true;
            // Notify backend of failure due to expiry
            const oid = sessionStorage.getItem('orderId');
            if (oid) {
              axios.post('/api/order/payment', { orderId: oid, status: 'FAILED' }, { withCredentials: true })
                .catch(() => {});
            }
            toast.error('Time expired! Your order has been cancelled.');
            navigate('/cart');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const callPaymentAPI = async (status) => {
    await axios.post(
      '/api/order/payment',
      { orderId, status },
      { withCredentials: true }
    );
  };

  const handlePayment = async () => {
    if (!orderId) {
      toast.error('No active order found.');
      return;
    }

    setIsProcessing(true);

    try {
      await callPaymentAPI('SUCCESS');

      // Invalidate currentOrders cache so the new order shows up immediately
      queryClient.invalidateQueries({ queryKey: ['currentOrders'] });

      // Clean up session/local storage
      sessionStorage.removeItem('orderId');
      sessionStorage.removeItem('sessionId');
      sessionStorage.removeItem('paymentExpiresAt');

      toast.success('Purchase Successful!', {
        description: 'Your order has been placed successfully.',
        action: {
          label: (
            <div className="flex items-center gap-1">
              <TruckIcon className="w-4 h-4" />
              Track Order
            </div>
          ),
          onClick: () => navigate('/current-orders'),
        },
        duration: 5000,
      });

      navigate('/');
    } catch (error) {
      console.error('[PAYMENT] Failed:', error);
      const msg = error?.response?.data?.message || 'Payment failed. Please try again.';
      toast.error(msg);
      setIsProcessing(false);
    }
  };

  const handleFailPayment = async () => {
    if (!orderId) return;

    setIsProcessing(true);

    try {
      await callPaymentAPI('FAILED');
    } catch (error) {
      console.error('[PAYMENT_FAIL] Failed to notify backend:', error);
    } finally {
      sessionStorage.removeItem('orderId');
      sessionStorage.removeItem('sessionId');
      sessionStorage.removeItem('paymentExpiresAt');
      navigate('/cart');
    }
  };

  const timerColor = timeLeft < 60
    ? 'text-red-600 animate-pulse'
    : timeLeft < 3 * 60
    ? 'text-orange-600'
    : 'text-red-700';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CheckCircleIcon className="w-8 h-8" />
            Payment
          </h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">

          {/* Timer Warning */}
          <div className={`border rounded-lg p-4 mb-6 flex items-center gap-3 ${
            timeLeft < 60
              ? 'bg-red-100 border-red-300'
              : 'bg-red-50 border-red-200'
          }`}>
            <ClockIcon className="w-6 h-6 text-red-600 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-red-900">Complete your purchase soon!</p>
              <p className="text-sm text-red-700">
                Your reservation expires in{' '}
                <span className={`font-bold text-base ${timerColor}`}>
                  {formatTime(timeLeft)}
                </span>
              </p>
            </div>
          </div>

          {/* Order ID */}
          {orderId && (
            <div className="text-center mb-2">
              <p className="text-xs text-gray-400 font-mono">Order ID: {orderId}</p>
            </div>
          )}

          {/* Ready indicator */}
          <div className="text-center mb-8">
            <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Complete</h2>
            <p className="text-sm text-gray-500 mt-1">Your items are reserved and waiting</p>
          </div>

          {/* Address */}
          {address && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <TruckIcon className="w-5 h-5 text-gray-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 mb-1">Delivery Address</p>
                  <p className="text-sm text-gray-600">{address.street}</p>
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  <p className="text-sm text-gray-600">{address.country}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handlePayment}
              disabled={isProcessing || timeLeft === 0}
              className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  Confirm & Pay
                </>
              )}
            </button>

            <button
              onClick={handleFailPayment}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
            >
              <XCircleIcon className="w-4 h-4" />
              Cancel Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
