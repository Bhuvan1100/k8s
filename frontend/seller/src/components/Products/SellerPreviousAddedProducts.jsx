import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import useSellerInfoStore from '../../stores/SellerInfoStore';
import { useNavigate } from 'react-router-dom';

export default function MyProducts() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const isComplete = useSellerInfoStore((state) => state.isComplete);
  const fetchSellerInfo = useSellerInfoStore((state) => state.fetchSellerInfo);

  useEffect(() => {
    // Fetch seller info first to ensure we have the latest data
    fetchSellerInfo();
  }, [fetchSellerInfo]);

  useEffect(() => {
    if (!isComplete) {
      setMessage("Please fill your seller details before viewing products");
      const timer = setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isComplete, navigate]);
  
  // Mock data - replace with actual data from your backend/Firebase
  const [products, setProducts] = useState([
    {
      id: '1',
      productName: 'Cotton T-Shirt',
      description: 'Premium quality cotton t-shirt with comfortable fit',
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400'
      ],
      sizes: {
        s: { quantity: '10', price: '299' },
        m: { quantity: '20', price: '349' },
        l: { quantity: '15', price: '399' }
      },
      createdAt: '2024-01-20'
    },
    {
      id: '2',
      productName: 'Denim Jeans',
      description: 'Classic blue denim jeans with perfect fit',
      images: [
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'
      ],
      sizes: {
        s: { quantity: '5', price: '899' },
        m: { quantity: '12', price: '899' },
        l: { quantity: '8', price: '999' }
      },
      createdAt: '2024-01-19'
    },
    {
      id: '3',
      productName: 'Casual Sneakers',
      description: 'Comfortable sneakers for everyday wear',
      images: [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
        'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400',
        'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=400'
      ],
      sizes: {
        s: { quantity: '0', price: '1499' },
        m: { quantity: '7', price: '1499' },
        l: { quantity: '3', price: '1599' }
      },
      createdAt: '2024-01-18'
    }
  ]);

  const openImageGallery = (product) => {
    setSelectedProduct(product);
  };

  const closeImageGallery = () => {
    setSelectedProduct(null);
  };

  const getTotalStock = (sizes) => {
    return parseInt(sizes.s.quantity || 0) + 
           parseInt(sizes.m.quantity || 0) + 
           parseInt(sizes.l.quantity || 0);
  };

  // If not complete, show only the message
  if (!isComplete && message) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-6 py-4 rounded-lg text-center">
            <p className="font-medium">{message}</p>
            <p className="text-sm mt-2">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
          <p className="mt-2 text-sm text-purple-600">Manage your product listings</p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 border border-purple-100 text-center">
            <p className="text-gray-500 text-lg">No products added yet</p>
            <button className="mt-4 bg-gray-900 text-white py-2 px-6 rounded-lg hover:bg-gray-800 transition-colors">
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-purple-100 hover:shadow-xl transition-shadow"
              >
                {/* Product Images Grid */}
                <div 
                  className="relative bg-gray-100 cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => openImageGallery(product)}
                >
                  {product.images.length === 1 ? (
                    <div className="h-48">
                      <img
                        src={product.images[0]}
                        alt={product.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : product.images.length === 2 ? (
                    <div className="grid grid-cols-2 gap-1 h-48">
                      {product.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`${product.productName} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ))}
                    </div>
                  ) : product.images.length === 3 ? (
                    <div className="h-48">
                      <div className="grid grid-cols-2 gap-1 h-full">
                        <img
                          src={product.images[0]}
                          alt={`${product.productName} 1`}
                          className="w-full h-full object-cover"
                        />
                        <div className="grid grid-rows-2 gap-1">
                          <img
                            src={product.images[1]}
                            alt={`${product.productName} 2`}
                            className="w-full h-full object-cover"
                          />
                          <img
                            src={product.images[2]}
                            alt={`${product.productName} 3`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48">
                      <div className="grid grid-cols-2 gap-1 h-full">
                        <img
                          src={product.images[0]}
                          alt={`${product.productName} 1`}
                          className="w-full h-full object-cover"
                        />
                        <div className="grid grid-rows-2 gap-1">
                          <img
                            src={product.images[1]}
                            alt={`${product.productName} 2`}
                            className="w-full h-full object-cover"
                          />
                          <div className="relative">
                            <img
                              src={product.images[2]}
                              alt={`${product.productName} 3`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                              <span className="text-white font-semibold text-lg">
                                +{product.images.length - 3}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {getTotalStock(product.sizes) === 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 truncate">
                    {product.productName}
                  </h3>

                  {/* Size and Stock Info */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Total Stock:</span>
                      <span className="font-semibold text-gray-900">
                        {getTotalStock(product.sizes)} units
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-purple-50 rounded p-2 text-center">
                        <div className="text-xs text-purple-600 font-medium">S</div>
                        <div className="text-xs text-gray-700">{product.sizes.s.quantity || 0}</div>
                        <div className="text-xs text-gray-500">₹{product.sizes.s.price}</div>
                      </div>
                      <div className="bg-purple-50 rounded p-2 text-center">
                        <div className="text-xs text-purple-600 font-medium">M</div>
                        <div className="text-xs text-gray-700">{product.sizes.m.quantity || 0}</div>
                        <div className="text-xs text-gray-500">₹{product.sizes.m.price}</div>
                      </div>
                      <div className="bg-purple-50 rounded p-2 text-center">
                        <div className="text-xs text-purple-600 font-medium">L</div>
                        <div className="text-xs text-gray-700">{product.sizes.l.quantity || 0}</div>
                        <div className="text-xs text-gray-500">₹{product.sizes.l.price}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-5 py-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Added on {new Date(product.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Gallery Modal */}
        {selectedProduct && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={closeImageGallery}
          >
            <div className="max-w-5xl w-full">
              {/* Close Button */}
              <button
                onClick={closeImageGallery}
                className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-900" />
              </button>

              {/* Product Name */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedProduct.productName}</h2>
                <p className="text-gray-300 mt-1">{selectedProduct.images.length} {selectedProduct.images.length === 1 ? 'Image' : 'Images'}</p>
              </div>

              {/* Images Grid */}
              <div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedProduct.images.map((image, index) => (
                  <div key={index} className="bg-white rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`${selectedProduct.productName} ${index + 1}`}
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-2 text-center bg-gray-50">
                      <span className="text-xs text-gray-500">Image {index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}