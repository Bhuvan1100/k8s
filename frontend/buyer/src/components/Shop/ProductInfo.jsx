import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import useUserStore from '../../Stores/UserStore';

export default function ProductInfo({ description, additionalInfo, reviews, productId, currentRating }) {
  const [activeTab, setActiveTab] = useState('description');
  const email = useUserStore(state => state.email);
  const isLoggedIn = useUserStore(state => state.isLoggedIn);
  
  // State for reviews
  const [reviewsState, setReviewsState] = useState([]);
  const [newReview, setNewReview] = useState({
    comment: ''
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // State for rating
  const [newRating, setNewRating] = useState(5);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    if (reviews && Array.isArray(reviews)) {
      setReviewsState(reviews);
    }
  }, [reviews]);

  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) {
      toast.error('Please write a review', {
        style: { fontSize: "15px" },
      });
      return;
    }

    if (!isLoggedIn) {
      toast.error('Please login to submit a review', {
        style: { fontSize: "15px" },
      });
      return;
    }

    const hasAlreadyReviewed = reviewsState.some(
      review => review.user?.toLowerCase() === email?.toLowerCase()
    );

    if (hasAlreadyReviewed) {
      toast.error('You have already reviewed this product', {
        style: { fontSize: "15px" },
      });

      // ✅ Only addition
      setNewReview({ comment: '' });

      return;
    }

    const userId = localStorage.getItem('Id');
    if (!userId) {
      toast.error('User ID not found. Please login again.', {
        style: { fontSize: "15px" },
      });
      return;
    }

    setIsSubmittingReview(true);

    try {
      await axios.post(
        `/api/product/comment/${productId}`,
        {
          userId: userId,
          userEmail: email,
          comment: newReview.comment.trim()
        },
        {
          withCredentials: true
        }
      );

      toast.success('Review submitted successfully!', {
        style: { fontSize: "15px" },
      });

      const review = {
        id: reviewsState.length + 1,
        user: email,
        comment: newReview.comment.trim(),
        createdAt: new Date().toISOString()
      };

      setReviewsState([review, ...reviewsState]);
      setNewReview({ comment: '' });

    } catch (error) {
      console.error('Failed to submit review:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit review';
      toast.error(errorMessage, {
        style: { fontSize: "15px" },
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!isLoggedIn) {
      toast.error('Please login to submit a rating', {
        style: { fontSize: "15px" },
      });
      return;
    }

    const userId = localStorage.getItem('Id');
    if (!userId) {
      toast.error('User ID not found. Please login again.', {
        style: { fontSize: "15px" },
      });
      return;
    }

    setIsSubmittingRating(true);

    try {
      const response = await axios.post(
        `/api/product/rate/${productId}`,
        {
          userId: userId,
          userEmail: email,
          rating: newRating
        },
        {
          withCredentials: true
        }
      );

      toast.success('Rating submitted successfully!', {
        style: { fontSize: "15px" },
      });

      if (response.data?.avgRating) {
        toast.success(`New average rating: ${response.data.avgRating.toFixed(1)}`, {
          style: { fontSize: "15px" },
        });
      }

    } catch (error) {
      console.error('Failed to submit rating:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit rating';
      
      if (error.response?.status === 409) {
        toast.error('You have already rated this product', {
          style: { fontSize: "15px" },
        });
      } else {
        toast.error(errorMessage, {
          style: { fontSize: "15px" },
        });
      }
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Recently';
    }
  };

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'additional', label: 'Additional Information' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'rating', label: 'Rating' }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-8">
      <div className="flex border-b border-gray-200 mb-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative px-8 py-5 text-lg font-medium transition-colors duration-200 focus:outline-none"
            style={{
              color: activeTab === tab.id ? '#000' : '#666'
            }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span
                className="absolute bottom-0 left-1/2 h-0.5 bg-black transition-all duration-300 ease-out"
                style={{
                  width: '75%',
                  transform: 'translateX(-50%)',
                  animation: 'expandLine 0.3s ease-out'
                }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="transition-opacity duration-200">
        {activeTab === 'description' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Product Description</h2>
            <p className="text-gray-700 leading-relaxed">{description || 'No description available.'}</p>
          </div>
        )}

        {activeTab === 'additional' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Additional Information</h2>
            <div className="grid grid-cols-2 gap-4">
              {additionalInfo && Object.keys(additionalInfo).length > 0 ? (
                Object.entries(additionalInfo).map(([key, value], index) => (
                  <div key={index} className="border-b border-gray-200 py-3">
                    <span className="font-medium text-gray-900 capitalize">{key}:</span>
                    <span className="ml-2 text-gray-700">{value}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-2">No additional information available.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Customer Reviews</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Write a Review</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Review
                </label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Share your experience with this product..."
                  disabled={isSubmittingReview}
                />
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={!newReview.comment.trim() || isSubmittingReview}
                className={`px-6 py-2 rounded-lg transition-colors duration-200 ${
                  newReview.comment.trim() && !isSubmittingReview
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">All Reviews</h3>
              {reviewsState && reviewsState.length > 0 ? (
                reviewsState.map((review, index) => (
                  <div key={review.id || index} className="border-b border-gray-200 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {review.user || review.name || 'Anonymous'}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No reviews yet. Be the first to review this product!
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'rating' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Product Rating</h2>

            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="flex flex-col items-center justify-center">
                <div className="text-6xl font-bold text-gray-900 mb-3">
                  {currentRating || 0}
                </div>
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-3xl">
                      {i < Math.floor(currentRating) ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 text-base">
                  Current Product Rating
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg space-y-4 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900">Rate this Product</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Rating
                </label>
                <select
                  value={newRating}
                  onChange={(e) => setNewRating(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  disabled={isSubmittingRating}
                >
                  <option value="5">5 Stars - Excellent</option>
                  <option value="4">4 Stars - Good</option>
                  <option value="3">3 Stars - Average</option>
                  <option value="2">2 Stars - Poor</option>
                  <option value="1">1 Star - Terrible</option>
                </select>
              </div>

              <div className="flex justify-center py-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-4xl">
                    {i < newRating ? '★' : '☆'}
                  </span>
                ))}
              </div>

              <button
                onClick={handleSubmitRating}
                disabled={isSubmittingRating}
                className={`w-full px-6 py-3 rounded-lg transition-colors duration-200 ${
                  isSubmittingRating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes expandLine {
          from { width: 0%; }
          to { width: 75%; }
        }
      `}</style>
    </div>
  );
}
