import { create } from "zustand";
import axios from 'axios';

const useUserStore = create((set, get) => ({
  // --------------------
  // CORE USER DATA
  // --------------------
  email: "",
  isLoggedIn: false,
  isVerified: false,

  previousOrders: [],
  currentOrders: [],

  isLoading: false,
  error: null,

  // --------------------
  // CART DATA
  // --------------------
  cartData: null,
  cartItems: [],
  authChecked: false,
  cartTotalPrice: 0,
  cartId: null,
  cartStatus: null,

  // --------------------
  // ORDERS DATA
  // --------------------
  orders: [],

  // --------------------
  // LOADING STATES
  // --------------------
  isLoadingUserData: false,
  userDataLoaded: false,

  // --------------------
  // AUTH / LOGIN STATE
  // --------------------
  setLoginStatus: (status, email = null, isVerified = get().isVerified) => {
    set((state) => ({
      isLoggedIn: status,
      email: status ? email || state.email : "",
      isVerified: status ? isVerified : false,
    }));
  },

  // --------------------
  // UPDATE CART DATA LOCALLY
  // --------------------
  updateCartData: (cartData) => {
    set({
      cartData,
      cartItems: cartData.items || [],
      cartTotalPrice: cartData.totalPrice || 0,
      cartId: cartData.cartId || null,
      cartStatus: cartData.status || null,
    });
  },

  // --------------------
  // UPDATE ORDERS LOCALLY
  // --------------------
  updateOrders: (orders) => {
    set({ orders });
  },

  // --------------------
  // REFETCH CART ONLY
  // --------------------
  refetchCart: async () => {
    const userId = localStorage.getItem('id');
    const { email } = get();

    if (!userId) {
      console.error('[USER_STORE] No userId found in localStorage');
      return;
    }

    console.log('[USER_STORE] Refetching cart data for userId:', userId);

    try {
      const response = await axios.post(
        '/api/buyer/cart/getcart',
        { userId, email },
        { withCredentials: true }
      );

      console.log('[USER_STORE] Cart refetched:', response.data);

      set({
        cartItems: response.data.items || [],
        cartTotalPrice: response.data.totalPrice || 0,
        cartId: response.data.cartId || null,
        cartStatus: response.data.status || null,
      });

      console.log('[USER_STORE] ✅ Cart data updated');
    } catch (error) {
      console.error('[USER_STORE] ❌ Failed to refetch cart:', error);
    }
  },

  // --------------------
  // ADD ITEM TO CART (LOCAL UPDATE)
  // --------------------
  addItemToCart: (newItem) => {
    const currentItems = get().cartItems || [];

    const existingItemIndex = currentItems.findIndex(
      item => item.productId === newItem.productId &&
              item.productVariantId === newItem.productVariantId
    );

    let updatedItems;
    let updatedTotalPrice = get().cartTotalPrice || 0;

    if (existingItemIndex !== -1) {
      updatedItems = currentItems.map((item, index) => {
        if (index === existingItemIndex) {
          const newQuantity = item.quantity + newItem.quantity;
          const newTotalPrice = newItem.priceSnapshot * newQuantity;
          updatedTotalPrice = updatedTotalPrice - item.totalPrice + newTotalPrice;
          return { ...item, quantity: newQuantity, totalPrice: newTotalPrice };
        }
        return item;
      });
    } else {
      updatedItems = [...currentItems, newItem];
      updatedTotalPrice += newItem.totalPrice;
    }

    set({ cartItems: updatedItems, cartTotalPrice: updatedTotalPrice });
    console.log('[USER_STORE] ✅ Cart item added locally:', newItem);
  },

  // --------------------
  // FETCH PREVIOUS ORDERS
  // Orders placed MORE than 5 days ago
  // --------------------
fetchPreviousOrders: async () => {
    try {
      set({ isLoading: true, error: null });

      const userId = localStorage.getItem('id');

      if (!userId) {
        console.error('[FETCH_PREVIOUS_ORDERS] No userId found in localStorage');
        return;
      }

      const response = await axios.post(
        '/api/buyer/orders',
        { userId },
        { withCredentials: true }
      );

      const data = response.data;

      const mapped = data.orders
        .filter((order) => order.status === "COMPLETED")
        .map((order) => {
          const billing = order.billingSnapshot ?? {};
          const address = order.addressSnapshot?.address ?? {};

          const totalQuantity = order.items?.reduce(
            (sum, item) => sum + item.quantity, 0
          ) ?? 0;

          const totalAmount = billing.total ?? 0;

          return {
            orderId:      order.orderId,
            status:       order.status,
            purchasedAt:  order.purchasedAt,
            updatedAt:    order.updatedAt,
            totalAmount:  Number(totalAmount),
            city:         address.city    ?? null,
            state:        address.state   ?? null,
            pincode:      address.zipCode ?? null,
            line1:        address.street  ?? null,
            totalQuantity,
            itemCount:    order.items?.length ?? 0,

            items: (order.items ?? []).map((item) => ({
              productId:        item.productId,
              productVariantId: item.productVariantId,
              size:             item.size,
              quantity:         item.quantity,
              title:            item.titleSnapshot ?? null,
              price:            Number(item.priceSnapshot ?? 0),
              lineTotal:        Number(item.priceSnapshot ?? 0) * item.quantity,
            })),
          };
        });

      set({ previousOrders: mapped });
      console.log('[FETCH_PREVIOUS_ORDERS] ✅ Orders loaded:', mapped.length);

    } catch (err) {
      set({ error: "Failed to fetch previous orders" });
      console.error('[FETCH_PREVIOUS_ORDERS] ❌', err.response?.data ?? err.message);
    } finally {
      set({ isLoading: false });
    }
  },

  // --------------------
  // FETCH CURRENT ORDERS
  // Orders placed WITHIN the last 5 days
  // --------------------
fetchCurrentOrders: async () => {
  try {
    set({ isLoading: true, error: null });

    const userId = localStorage.getItem('id');

    if (!userId) {
      console.error('[FETCH_CURRENT_ORDERS] No userId found in localStorage');
      return;
    }

    const response = await axios.post(
      '/api/buyer/orders',
      { userId },
      { withCredentials: true }
    );

    const data = response.data;
    console.log(data);
    const mapped = data.orders
      .filter((order) => order.status !== "COMPLETED")
      .map((order) => {
        const billing = order.billingSnapshot ?? {};
        const address = order.addressSnapshot?.address ?? {};

        const totalQuantity = order.items?.reduce(
          (sum, item) => sum + item.quantity, 0
        ) ?? 0;

        const totalAmount = billing.total ?? 0;

        return {
          orderId:      order.orderId,
          status:       order.status,
          purchasedAt:  order.purchasedAt,
          updatedAt:    order.updatedAt,
          totalAmount:  Number(totalAmount),
          city:         address.city    ?? null,
          state:        address.state   ?? null,
          pincode:      address.zipCode ?? null,
          line1:        address.street  ?? null,
          totalQuantity,
          itemCount:    order.items?.length ?? 0,

          items: (order.items ?? []).map((item) => ({
            productId:        item.productId,
            productVariantId: item.productVariantId,
            size:             item.size,
            quantity:         item.quantity,
            title:            item.titleSnapshot ?? null,
            price:            Number(item.priceSnapshot ?? 0),
            lineTotal:        Number(item.priceSnapshot ?? 0) * item.quantity,
          })),
        };
      });

    set({ currentOrders: mapped });
    console.log('[FETCH_CURRENT_ORDERS] ✅ Orders loaded:', mapped.length);

  } catch (err) {
    set({ error: "Failed to fetch current orders" });
    console.error('[FETCH_CURRENT_ORDERS] ❌', err.response?.data ?? err.message);
  } finally {
    set({ isLoading: false });
  }
},

  // --------------------
  // CLEAR STORE
  // --------------------
  clearUserData: () => {
    set({
      email: "",
      isLoggedIn: false,
      isVerified: false,
      previousOrders: [],
      currentOrders: [],
      cartData: null,
      cartItems: [],
      cartTotalPrice: 0,
      cartId: null,
      cartStatus: null,
      orders: [],
      isLoadingUserData: false,
      userDataLoaded: false,
      error: null,
    });
  },
}));

export default useUserStore;