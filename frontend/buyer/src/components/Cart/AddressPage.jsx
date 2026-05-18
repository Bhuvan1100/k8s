import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { TruckIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { fillCheckoutDetails } from '../../Stores/Data';
import useUserStore from '../../Stores/UserStore';

export default function AddressPage() {
  const navigate  = useNavigate();
  const isLoggedIn = useUserStore(state => state.isLoggedIn);
  const isVerified = useUserStore(state => state.isVerified);
  const email      = useUserStore(state => state.email);

  useEffect(() => {
    if (!isLoggedIn) navigate("/login", { replace: true });
    else if (!isVerified) navigate("/verify-email", { replace: true });
  }, [isLoggedIn, isVerified, navigate]);

  useEffect(() => {
    console.log(localStorage.getItem('checkoutAddress'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Only pre-fill from localStorage — if nothing saved, form stays empty
  const [address, setAddress] = useState(() => {
    try {
      const saved = localStorage.getItem('checkoutAddress');
      return saved ? JSON.parse(saved) : { street: '', city: '', state: '', zipCode: '', country: '' };
    } catch {
      return { street: '', city: '', state: '', zipCode: '', country: '' };
    }
  });

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    localStorage.setItem('checkoutAddress', JSON.stringify(address));
    console.log('address:', address);
    try {
      const res = await fillCheckoutDetails(address, email);
      sessionStorage.setItem('sessionId', res.sessionId);
      console.log(sessionStorage.getItem('sessionId'));
      navigate('/checkout/confirmcart');
    } catch (error) {
      console.error('[FILL_CHECKOUT_DETAILS] Failed:', error);
      toast.error("Failed to save address. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TruckIcon className="w-8 h-8" />
            Delivery Address
          </h1>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <form onSubmit={handleSaveAddress} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main St"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="New York"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="NY"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    required
                    value={address.zipCode}
                    onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  required
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="USA"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
                >
                  Back to Cart
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-black text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Continue to Checkout
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}