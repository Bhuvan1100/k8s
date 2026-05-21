import { create } from "zustand";
import axios from 'axios'

const useSellerInfoStore = create((set, get) => ({
  // ===== Seller Info Fields =====
  businessName: "",
  sellerType: "",
  email: "",
  phone: "",
  panNumber: "",
  gstNumber: "",
  address: "",

  // ===== Status Flags =====
  loading: false,
  error: null,

  // ===== Derived Flag =====
  isComplete: false,

  // ===== Set single field =====
  setField: (field, value) => {
    set({ [field]: value });
    get().checkCompletion();
  },

  // ===== Set all fields at once =====
  setSellerInfo: (data) => {
    set({
      businessName: data.businessName || "",
      sellerType: data.sellerType || "",
      email: data.email || "",
      phone: data.phone || "",
      panNumber: data.panNumber || "",
      gstNumber: data.gstNumber || "",
      address: data.address || "",
      error: null,
    });
    get().checkCompletion();
  },

  // ===== Check if all fields are filled =====
  checkCompletion: () => {
    const {
      businessName,
      sellerType,
      email,
      phone,
      panNumber,
      gstNumber,
      address,
    } = get();

    const isComplete =
      !!businessName &&
      !!sellerType &&
      !!email &&
      !!phone &&
      !!panNumber &&
      !!gstNumber &&
      !!address;

    set({ isComplete });
  },

  fetchSellerInfo: async () => {
    set({ loading: true, error: null });

    try {
      const res = await axios.get("/api/seller/seller");
      if (!res.ok) {
        throw new Error("Failed to fetch seller info");
      }

      const data = await res.json();

      set({
        businessName: data.company?.name || "",
        sellerType: "BUSINESS", // dummy value (dummyjson doesn't provide this)
        email: data.email || "",
        phone: data.phone || "",
        panNumber: "ABCDE1234F", // dummy PAN (dummyjson doesn't provide PAN)
        gstNumber: "22AAAAA0000A1Z5", // dummy GST (dummyjson doesn't provide GST)
        address: `${data.address?.address || ""}, ${data.address?.city || ""}, ${data.address?.state || ""}, ${data.address?.postalCode || ""}`,
        loading: false,
      });

      get().checkCompletion();
    } catch (err) {
      set({
        loading: false,
        error: err.message || "Something went wrong",
      });
    }
  },

  // ===== Reset store (optional but useful) =====
  resetSellerInfo: () =>
    set({
      businessName: "",
      sellerType: "",
      email: "",
      phone: "",
      panNumber: "",
      gstNumber: "",
      address: "",
      isComplete: false,
      loading: false,
      error: null,
    }),
}));

export default useSellerInfoStore;
