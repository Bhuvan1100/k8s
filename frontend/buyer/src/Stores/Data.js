import axios from 'axios';

export const fetchProductsByTags = async () => {
  const res = await axios.get('https://dummyjson.com/products?limit=32');
  const products = res.data.products;

  const transform = p => ({
    id: p.id,
    image: p.thumbnail,
    category: p.category,
    name: p.title,
    price: p.price,
    rating: p.rating,
    ratingCount: `${Math.floor(Math.random() * 10 + 1)}k+`,
    tags: ['ALL', 'NEW ARRIVALS', 'BEST SELLER', 'TOP RATED'],
  });

  
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  const totalProducts = shuffled.length;

  
  if (totalProducts >= 32) {
    return {
      ALL: shuffled.slice(0, 8).map(transform),
      NEW_ARRIVALS: shuffled.slice(8, 16).map(transform),
      BEST_SELLER: shuffled.slice(16, 24).map(transform),
      TOP_RATED: shuffled.slice(24, 32).map(transform),
    };
  }

  const productsPerCategory = Math.floor(totalProducts / 4);
  const remainder = totalProducts % 4;

  let index = 0;
  const categories = ['ALL', 'NEW_ARRIVALS', 'BEST_SELLER', 'TOP_RATED'];
  const result = {};

  categories.forEach((category, i) => {
    
    const count = productsPerCategory + (i < remainder ? 1 : 0);
    result[category] = shuffled.slice(index, index + count).map(transform);
    index += count;
  });

  return result;
};

export const fetchProductById = async (id) => {
  try {
   
    const productRes = await axios.get(
      `http://localhost:4000/product/productdetail/${id}`,
      {
        withCredentials:true
      }
    );
    
    const p = productRes.data.product;

    
    const originalPrice = p.price; 
    
    return {
      product: {
        id: p.id,
        name: p.title,
        price: p.price,
        originalPrice: originalPrice,
        rating: p.avgRating || 0,
        totalReviews: p.ratingCount || 0,
        description: p.description,
        images: p.images?.map(img => img.url) || [],
        inStock: p.totalQuantity > 0,
        
        category: p.category,
        subCategory: p.subCategory,
        
        
        variants: p.variants || [],
      },

      
      additionalInfo: {
        category: p.category,
        subCategory: p.subCategory,
        warranty: "1 Year Manufacturer Warranty",
        returnPolicy: "7 Days Replacement",
        delivery: "Free Delivery in 3-5 days",
        totalQuantity: p.totalQuantity,
      },

      
      reviews: (p.comments || []).map((comment, i) => ({
        id: i + 1,
        user: comment.userEmail || `User ${i + 1}`,
        userId: comment.userId,
        rating: p.avgRating || 4, 
        comment: comment.comment,
        createdAt: comment.createdAt,
      })),
      
      category: p.category,
    };
  } catch (error) {
    console.error('[FETCH_PRODUCT_BY_ID] Error:', error);
    throw error;
  }
};


export const fetchSimilarProducts = async ({ category, excludeId }) => {
  if (!category) return [];

  const res = await axios.get(`https://dummyjson.com/products/category/${category}/`);

  // Filter out the main product and take max 8
  const filtered = res.data.products
    .filter(p => p.id !== excludeId)
    .slice(0, 8)
    .map(p => ({
      id: p.id,
      image: p.thumbnail,
      category: p.category,
      name: p.title,
      price: p.price,
      rating: p.rating,
      reviewCount: `${Math.floor(Math.random() * 10 + 1)}k+`,
    }));
    
  return filtered;
};

export const fetchProductsByCategory = async (category, subCategory, page = 1) => {
  if (!category || !subCategory) return { products: [], pagination: {} };
  
  try {
    
    const formattedCategory =
      category.toLowerCase() === "mens"
        ? "men"
        : category.toLowerCase() === "womens"
          ? "women"
          : category.toLowerCase() === "kids"
            ? "kids"
            : category.toLowerCase();
   
    const formattedSubCategory = `${subCategory.toLowerCase()}`; 

    const res = await axios.get(  
      `http://localhost:4000/products/${formattedCategory}/${subCategory}?page=${page}`,
      {
        withCredentials: true
      }
    );


    console.log(page, res.data);

    return {
      products: res.data.products.map(p => ({
        id: p.id,
        image: p.image,
        category: subCategory,
        name: p.title,
        price: p.price,
        rating: Math.round(p.avgRating || 0),
        ratingCount: p.ratingCount ? `${p.ratingCount}+` : '0',
        description: p.description,
        totalQuantity: p.totalQuantity,
        isInStock: p.isInStock
      })),
      pagination: res.data.pagination
    };
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return { products: [], pagination: {} };
  }
};


export const checkoutPreview = async (email) => {
  const userId = localStorage.getItem('id');

  if (!userId) {
    throw new Error('No userId found');
  }

  const response = await axios.post(
    '/api/checkout/preview',
    { userId, email },
    { withCredentials: true }
  );

  return response.data; // contains sessionId + product preview data
};

export const fillCheckoutDetails = async (address, email) => {
  const userId = localStorage.getItem('id');
  const sessionId = sessionStorage.getItem('sessionId');

  if (!userId || !sessionId) throw new Error('Missing userId or sessionId');

  const response = await axios.post(
    '/api/checkout/session/details',
    {
      sessionId,
      userId,
      buyerDetails: {
        email,
        address: {
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country,
        }
      }
    },
    { withCredentials: true }
  );
  console.log(response)
  return response.data;
};