import { create } from "zustand";
import axios from "axios";

const useCartStore = create((set, get) => ({
  items: [
    /*
      {
        id: "p1_v1", // composite id: productId_productVariantId
        productId: "p1",
        productVariantId: "v1",
        name: "T-Shirt",
        price: 499,
        salePrice: 399,
        image: "https://example.com/tshirt.png",
        quantity: 2,
        availableQuantity: 50
      }
    */
  ],

  isLoadingUI: false,
  uiDataLoaded: false,

  // --------------------
  // FETCH UI DATA FOR CART
  // --------------------
  /**
   * Fetches product details for cart items to display in UI
   * Call this when user opens the cart page
   * @param {Array} cartItems - Items from UserStore (cartItems from backend)
   */
  fetchCartUIData: async (cartItems) => {
    if (!cartItems || cartItems.length === 0) {
      console.log('[CART_STORE] No items to fetch UI data for');
      set({ items: [], isLoadingUI: false, uiDataLoaded: true });
      return;
    }

    console.log('[CART_STORE] Fetching UI data for', cartItems.length, 'items');
    set({ isLoadingUI: true });

    try {
      // Transform cartItems to the format backend expects
      const requestItems = cartItems.map(item => ({
        productId: item.productId,
        productVariantId: item.productVariantId,
        quantity: item.quantity
      }));

      const response = await axios.post(
        '/api/product/cart/ui',
        { items: requestItems },
        { withCredentials: true }
      );

      console.log('[CART_STORE] UI data received:', response.data);

      // Transform response to cart store format
      // Match UI data with cart items to get size
      const uiItems = response.data.map(item => {
        // Find corresponding cart item to get size
        const cartItem = cartItems.find(
          ci => ci.productId === item.productId && ci.productVariantId === item.productVariantId
        );

        return {
          id: `${item.productId}_${item.productVariantId}`, // Unique composite ID
          productId: item.productId,
          productVariantId: item.productVariantId,
          name: item.title,
          price: item.salePrice || item.price, // Use sale price if available
          originalPrice: item.price,
          salePrice: item.salePrice,
          image: item.image,
          quantity: item.quantity,
          availableQuantity: item.availableQuantity,
          size: cartItem?.size || null, // ✅ Get size from cart data
          cartItemId: cartItem?.id || null // Store cart item ID for backend updates
        };
      });

      set({
        items: uiItems,
        isLoadingUI: false,
        uiDataLoaded: true
      });

      console.log('[CART_STORE] ✅ UI data loaded successfully');

    } catch (error) {
      console.error('[CART_STORE] ❌ Failed to fetch UI data:', error);
      set({
        isLoadingUI: false,
        uiDataLoaded: false
      });
    }
  },

  // --------------------
  // ADD ITEM
  // --------------------
  addItem: (item) => {
    const items = get().items;
    const existingItem = items.find((i) => i.id === item.id);

    if (existingItem) {
      set({
        items: items.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        ),
      });
    } else {
      set({
        items: [...items, item],
      });
    }
  },

  // --------------------
  // INCREASE QUANTITY
  // --------------------
  increaseQty: (id) => {
    set({
      items: get().items.map((i) =>
        i.id === id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ),
    });
  },

  // --------------------
  // DECREASE QUANTITY
  // --------------------
  decreaseQty: (id) => {
    set({
      items: get().items
        .map((i) =>
          i.id === id
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter((i) => i.quantity > 0),
    });
  },

  // --------------------
  // REMOVE ITEM
  // --------------------
  removeItem: (id) => {
    set({
      items: get().items.filter((i) => i.id !== id),
    });
  },

  // --------------------
  // CLEAR CART
  // --------------------
  clearCart: () => set({ items: [] }),

  // --------------------
  // DERIVED VALUES
  // --------------------
  totalItems: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));

export default useCartStore;