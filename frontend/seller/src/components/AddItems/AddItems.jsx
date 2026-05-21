import { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon, TagIcon, CurrencyRupeeIcon, Bars3BottomLeftIcon, RectangleStackIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import useSellerInfoStore from '../../stores/SellerInfoStore';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

// Category options
const CATEGORIES = ['MEN', 'WOMEN', 'KIDS'];

// Subcategory options mapped to categories
const SUBCATEGORIES = {
  MEN: [
    'MEN_TSHIRT', 'MEN_SHIRT', 'MEN_JEANS', 'MEN_TROUSERS', 'MEN_SHORTS', 
    'MEN_KURTA', 'MEN_ETHNIC_SET', 'MEN_JACKET', 'MEN_HOODIE', 'MEN_SWEATSHIRT',
    'MEN_BLAZER', 'MEN_SUIT', 'MEN_TRACK_PANTS', 'MEN_ACTIVEWEAR', 'MEN_INNERWEAR',
    'MEN_SLEEPWEAR', 'MEN_SWIMWEAR', 'MEN_FOOTWEAR', 'MEN_SANDALS', 'MEN_ACCESSORIES'
  ],
  WOMEN: [
    'WOMEN_SAREE', 'WOMEN_KURTI', 'WOMEN_DRESS', 'WOMEN_TOP', 'WOMEN_TSHIRT',
    'WOMEN_JEANS', 'WOMEN_TROUSERS', 'WOMEN_SKIRT', 'WOMEN_LEGGINGS', 'WOMEN_ETHNIC_SET',
    'WOMEN_GOWN', 'WOMEN_BLAZER', 'WOMEN_JACKET', 'WOMEN_SWEATER', 'WOMEN_NIGHTWEAR',
    'WOMEN_ACTIVEWEAR', 'WOMEN_LINGERIE', 'WOMEN_SWIMWEAR', 'WOMEN_FOOTWEAR', 'WOMEN_ACCESSORIES'
  ],
  KIDS: [
    'KIDS_TSHIRT', 'KIDS_SHIRT', 'KIDS_JEANS', 'KIDS_SHORTS', 'KIDS_DRESS',
    'KIDS_ETHNIC_WEAR', 'KIDS_SLEEPWEAR', 'KIDS_FOOTWEAR', 'KIDS_TOYS', 'KIDS_ACCESSORIES'
  ]
};

// Helper function to format subcategory names for display
const formatSubcategoryName = (subcat) => {
  return subcat
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

export default function AddItem() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const messageRef = useRef(null);
  const navigate = useNavigate();
  const isComplete = useSellerInfoStore((state) => state.isComplete);

  // useEffect(() => {
  //   if (!isComplete) {
  //     setMessage("Please fill your seller details before adding products");
  //     const timer = setTimeout(() => {
  //       navigate("/", { replace: true });
  //     }, 2000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [isComplete, navigate]);

  // Scroll to message when it appears
  useEffect(() => {
    if (message && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [message]);

  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    category: '',
    subCategory: '',
    images: [],
    sizes: {
      SMALL: { quantity: '', price: '' },
      MEDIUM: { quantity: '', price: '' },
      LARGE: { quantity: '', price: '' }
    }
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 4 - images.length;
    
    if (files.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more image(s)`);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData
          }
        );

        const data = await response.json();
        console.log(data.secure_url);
        return data.secure_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      
      setFormData(prev => ({
        ...prev,
        images: newImages
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Reset subcategory when category changes
    if (name === 'category') {
      setFormData(prev => ({ ...prev, category: value, subCategory: '' }));
    }
  };

  const handleSizeChange = (size, field, value) => {
    setFormData({
      ...formData,
      sizes: {
        ...formData.sizes,
        [size]: {
          ...formData.sizes[size],
          [field]: value
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      description: '',
      category: '',
      subCategory: '',
      images: [],
      sizes: {
        SMALL: { quantity: '', price: '' },
        MEDIUM: { quantity: '', price: '' },
        LARGE: { quantity: '', price: '' }
      }
    });
    setImages([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setMessage("");
    setMessageType("");

    // Validation - Check if all fields are filled
    if (!formData.productName.trim()) {
      setMessage('Product name cannot be empty');
      setMessageType('error');
      return;
    }

    if (!formData.description.trim()) {
      setMessage('Description cannot be empty');
      setMessageType('error');
      return;
    }

    if (images.length === 0) {
      setMessage('Please upload at least one image');
      setMessageType('error');
      return;
    }

    if (!formData.category) {
      setMessage('Please select a category');
      setMessageType('error');
      return;
    }

    if (!formData.subCategory) {
      setMessage('Please select a subcategory');
      setMessageType('error');
      return;
    }

    // Build variants array and validate that both quantity and price are filled together
    const variants = [];
    const sizeErrors = [];
    
    Object.entries(formData.sizes).forEach(([size, data]) => {
      const hasQuantity = data.quantity && data.quantity.trim() !== '';
      const hasPrice = data.price && data.price.trim() !== '';
      
      // Check if only one field is filled (quantity or price, but not both)
      if (hasQuantity && !hasPrice) {
        sizeErrors.push(`${size}: Please enter price`);
      } else if (!hasQuantity && hasPrice) {
        sizeErrors.push(`${size}: Please enter quantity`);
      } else if (hasQuantity && hasPrice) {
        // Both are filled, add to variants
        variants.push({
          size: size,
          totalQuantity: parseInt(data.quantity),
          price: parseFloat(data.price),
          salePrice: null
        });
      }
    });

    // If there are validation errors for sizes
    if (sizeErrors.length > 0) {
      setMessage(`Please fill both quantity and price for: ${sizeErrors.join(', ')}`);
      setMessageType('error');
      return;
    }

    if (variants.length === 0) {
      setMessage('Please add at least one size variant with both quantity and price');
      setMessageType('error');
      return;
    }

    // Build images array
    const imageArray = images.map((url, index) => ({
      url: url,
      isPrimary: index === 0
    }));

    // Get userId from localStorage
    const userId = localStorage.getItem('id');
    
    if (!userId) {
      setMessage('User ID not found. Please login again.');
      setMessageType('error');
      return;
    }

    // Prepare payload
    const payload = {
      userId: userId,
      title: formData.productName,
      description: formData.description,
      category: formData.category,
      subCategory: formData.subCategory,
      variants: variants,
      images: imageArray
    };

    console.log('Submitting payload:', payload);

    setSubmitting(true);

    try {
      const response = await axios.post('/api/seller/product', payload, {
        withCredentials: true
      });

      console.log('Product added successfully:', response.data);
      setMessage('Product added successfully!');
      setMessageType('success');
      
      // Reset form on success
      resetForm();

      // Hide success message after 3 seconds
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
      
    } catch (error) {
      console.error('Error adding product:', error);
      setMessage(error.response?.data?.message || 'Failed to add product. Please try again.');
      setMessageType('error');
      // Keep form filled on error - don't reset
    } finally {
      setSubmitting(false);
    }
  };

  // If not complete, show only the message
  // if (!isComplete && message) {
  //   return (
  //     <div className="min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
  //       <div className="max-w-md w-full">
  //         <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-6 py-4 rounded-lg text-center">
  //           <p className="font-medium">{message}</p>
  //           <p className="text-sm mt-2">Redirecting...</p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-100">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">Add New Item</h2>
            <p className="mt-1 text-sm text-purple-600">Fill in the product details below</p>
          </div>

          {/* Message Display */}
          {message && (
            <div 
              ref={messageRef}
              className={`mb-6 px-4 py-3 rounded-lg ${
                messageType === 'success' 
                  ? 'bg-green-100 border border-green-300 text-green-800' 
                  : 'bg-red-100 border border-red-300 text-red-800'
              }`}
            >
              <p className="font-medium">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Product Images (Max 4) *
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {images.length < 4 && (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                    <PhotoIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500">
                      {uploading ? 'Uploading...' : 'Add Image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-500">{images.length}/4 images uploaded</p>
            </div>

            {/* Product Name */}
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TagIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter product name"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <Bars3BottomLeftIcon className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Describe your product..."
                  required
                />
              </div>
            </div>

            {/* Category and Subcategory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <RectangleStackIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                    required
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subcategory */}
              <div>
                <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Squares2X2Icon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="subCategory"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                    required
                    disabled={!formData.category}
                  >
                    <option value="">Select Subcategory</option>
                    {formData.category && SUBCATEGORIES[formData.category].map(subcat => (
                      <option key={subcat} value={subcat}>
                        {formatSubcategoryName(subcat)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sizes Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Size, Quantity & Pricing (At least one size required) *
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Note: If you enter quantity, you must also enter price (and vice versa)
              </p>
              
              <div className="space-y-4">
                {/* Small */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-purple-100 text-purple-700 font-semibold px-3 py-1 rounded-md text-sm">
                      Small (S)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.sizes.SMALL.quantity}
                        onChange={(e) => handleSizeChange('SMALL', 'quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Price (₹)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CurrencyRupeeIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.sizes.SMALL.price}
                          onChange={(e) => handleSizeChange('SMALL', 'price', e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medium */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-purple-100 text-purple-700 font-semibold px-3 py-1 rounded-md text-sm">
                      Medium (M)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.sizes.MEDIUM.quantity}
                        onChange={(e) => handleSizeChange('MEDIUM', 'quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Price (₹)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CurrencyRupeeIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.sizes.MEDIUM.price}
                          onChange={(e) => handleSizeChange('MEDIUM', 'price', e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Large */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-purple-100 text-purple-700 font-semibold px-3 py-1 rounded-md text-sm">
                      Large (L)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.sizes.LARGE.quantity}
                        onChange={(e) => handleSizeChange('LARGE', 'quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Price (₹)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CurrencyRupeeIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.sizes.LARGE.price}
                          onChange={(e) => handleSizeChange('LARGE', 'price', e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting || uploading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                  submitting || uploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2'
                }`}
              >
                {submitting ? 'Adding Product...' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}