import React, { useState, useEffect } from 'react';
import { EnvelopeIcon, MapPinIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import useUserStore from '../Stores/UserStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { fillCheckoutDetails } from '../Stores/Data';

export default function UserProfile() {
  const navigate   = useNavigate();
  const isLoggedIn = useUserStore(state => state.isLoggedIn);
  const isVerified = useUserStore(state => state.isVerified);
  const email      = useUserStore(state => state.email);

  useEffect(() => {
    if (!isLoggedIn) navigate('/login');
    else if (!isVerified) navigate('/verify-email');
  }, [isLoggedIn, isVerified, navigate]);

  // Pre-fill from localStorage — same pattern as AddressPage
  const [address, setAddress] = useState(() => {
    try {
      const saved = localStorage.getItem('checkoutAddress');
      return saved ? JSON.parse(saved) : { street: '', city: '', state: '', zipCode: '', country: '' };
    } catch {
      return { street: '', city: '', state: '', zipCode: '', country: '' };
    }
  });

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState(address);

  const hasAddress = address.street && address.city && address.state && address.zipCode && address.country;

  const handleAddressChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async () => {
    const { street, city, state, zipCode, country } = addressForm;
    if (!street || !city || !state || !zipCode || !country) {
      toast.error('Please fill all fields');
      return;
    }

    localStorage.setItem('checkoutAddress', JSON.stringify(addressForm));

    try {
      await fillCheckoutDetails(addressForm, email);
      setAddress(addressForm);
      setIsEditingAddress(false);
      toast.success('Address saved successfully!');
    } catch (error) {
      console.error('[SAVE_ADDRESS] Failed:', error);
      toast.error('Failed to save address. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setAddressForm(address);
    setIsEditingAddress(false);
  };

  const handleStartEdit = () => {
    setAddressForm(address);
    setIsEditingAddress(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your profile information</p>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Contact Details</h2>

          {/* Email */}
          <div className="flex items-start space-x-4 mb-6">
            <div className="shrink-0">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <EnvelopeIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500">Email Address</p>
              <p className="text-base text-gray-900 mt-1">{email}</p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start space-x-4">
            <div className="shrink-0">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <MapPinIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500">Address</p>

              {/* No address yet */}
              {!hasAddress && !isEditingAddress && (
                <button
                  onClick={() => setIsEditingAddress(true)}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Address
                </button>
              )}

              {/* Edit form */}
              {isEditingAddress && (
                <div className="mt-2 space-y-3">
                  <input
                    type="text"
                    name="street"
                    value={addressForm.street}
                    onChange={handleAddressChange}
                    placeholder="Street Address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="city"
                    value={addressForm.city}
                    onChange={handleAddressChange}
                    placeholder="City"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="state"
                      value={addressForm.state}
                      onChange={handleAddressChange}
                      placeholder="State"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="zipCode"
                      value={addressForm.zipCode}
                      onChange={handleAddressChange}
                      placeholder="ZIP Code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <input
                    type="text"
                    name="country"
                    value={addressForm.country}
                    onChange={handleAddressChange}
                    placeholder="Country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex space-x-2 pt-2">
                    <button onClick={handleSaveAddress} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">Save</button>
                    <button onClick={handleCancelEdit} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium">Cancel</button>
                  </div>
                </div>
              )}

              {/* Display saved address */}
              {hasAddress && !isEditingAddress && (
                <div className="mt-1">
                  <p className="text-base text-gray-900">{address.street}</p>
                  <p className="text-base text-gray-900">{address.city}, {address.state}</p>
                  <p className="text-base text-gray-900">ZIP: {address.zipCode}</p>
                  <p className="text-base text-gray-900">{address.country}</p>
                  <button
                    onClick={handleStartEdit}
                    className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Address
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}