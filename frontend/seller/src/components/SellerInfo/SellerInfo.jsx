import { UserIcon, PhoneIcon, EnvelopeIcon, BuildingStorefrontIcon, MapPinIcon, IdentificationIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { useEffect, useState, useRef } from 'react';
import useSellerInfoStore from '../../stores/SellerInfoStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'

export default function SellerInfo() {
  const {
    businessName,
    sellerType,
    email,
    phone,
    panNumber,
    gstNumber,
    address,
    isComplete,
    loading,
    setField,
    fetchSellerInfo,
  } = useSellerInfoStore();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const isInitialDataSet = useRef(false);


  useEffect(() => {
    // Store initial data ONLY ONCE when first loaded
    if (!isInitialDataSet.current && (businessName || sellerType || email || phone || panNumber || gstNumber || address)) {
      const initial = {
        businessName,
        sellerType,
        email,
        phone,
        panNumber,
        gstNumber,
        address,
      };
      setInitialData(initial);
      isInitialDataSet.current = true;
    }
  }, [businessName, sellerType, email, phone, panNumber, gstNumber, address]);

  useEffect(() => {
    // Check if current data differs from initial data
    if (isInitialDataSet.current) {
      const currentData = {
        businessName,
        sellerType,
        email,
        phone,
        panNumber,
        gstNumber,
        address,
      };
      const changed = Object.keys(currentData).some(
        key => currentData[key] !== initialData[key]
      );
      setHasChanges(changed);
    }
  }, [businessName, sellerType, email, phone, panNumber, gstNumber, address, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isComplete) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    const userId = localStorage.getItem("id");
    
    const sellerData = {
      userId,
      businessName,
      sellerType,
      email,
      phone,
      panNumber,
      gstNumber,
      address: address || {}
    };

    console.log(sellerData);

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await axios.post("/api/seller/sellerdetail", sellerData, {
        withCredentials: true,
      });
      
      console.log("Seller created:", res.data);
      
      setMessage({ type: 'success', text: 'Seller details saved successfully! Redirecting...' });
      
      // Navigate to add-items after 1.5 seconds
      setTimeout(() => {
        navigate('/add-items');
      }, 1500);
      
    } catch (err) {
      console.error("Error creating seller:", err.response?.data || err.message);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to save seller details. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Determine if all fields were initially filled
  const wasInitiallyComplete = Object.values(initialData).every(val => val && val.trim() !== '');

  // Determine button text
  const getButtonText = () => {
    if (submitting) {
      return 'Saving...';
    }
    if (!wasInitiallyComplete) {
      return 'Submit Information';
    }
    if (hasChanges) {
      return 'Update Information';
    }
    return 'Submit Information';
  };

  // Button should be enabled if form is complete AND (was not initially complete OR has changes) AND not submitting
  const isButtonEnabled = isComplete && (!wasInitiallyComplete || hasChanges) && !submitting;

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Seller Information
            </h2>
            <p className="text-gray-600">Please provide your business details</p>
          </div>

          {/* Success/Error Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 border border-green-300 text-green-800' 
                : 'bg-red-100 border border-red-300 text-red-800'
            }`}>
              <p className="font-medium">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BuildingStorefrontIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setField("businessName", e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Your Business Name"
                />
              </div>
            </div>

            {/* Seller Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seller Type
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BriefcaseIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={sellerType}
                  onChange={(e) => setField("sellerType", e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                >
                  <option value="">Select Type</option>
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="BUSINESS">Business</option>
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setField("email", e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* PAN Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PAN Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IdentificationIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={panNumber}
                  onChange={(e) => setField("panNumber", e.target.value.toUpperCase())}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 uppercase"
                  placeholder="ABCDE1234F"
                  maxLength="10"
                />
              </div>
            </div>

            {/* GST Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IdentificationIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setField("gstNumber", e.target.value.toUpperCase())}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 uppercase"
                  placeholder="22AAAAA0000A1Z5"
                  maxLength="15"
                />
              </div>
            </div>

            {/* Business Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Address
              </label>
              
              {/* Address Line 1 */}
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={address?.line1 || ''}
                  onChange={(e) => setField("address", { ...address, line1: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Address Line 1"
                />
              </div>

              {/* Address Line 2 */}
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={address?.line2 || ''}
                  onChange={(e) => setField("address", { ...address, line2: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Address Line 2"
                />
              </div>

              {/* City and State */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={address?.city || ''}
                  onChange={(e) => setField("address", { ...address, city: e.target.value })}
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="City"
                />
                <input
                  type="text"
                  value={address?.state || ''}
                  onChange={(e) => setField("address", { ...address, state: e.target.value })}
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="State"
                />
              </div>

              {/* Pincode and Country */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={address?.pincode || ''}
                  onChange={(e) => setField("address", { ...address, pincode: e.target.value })}
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="PIN Code"
                  maxLength="6"
                />
                <input
                  type="text"
                  value={address?.country || ''}
                  onChange={(e) => setField("address", { ...address, country: e.target.value })}
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Country"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isButtonEnabled}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                isButtonEnabled
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {getButtonText()}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}