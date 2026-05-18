import { create } from "zustand";

const useAuthStore = create((set) => ({
  isLoggedIn: false,
  isVerified: false,

  login: () =>
    set({
      isLoggedIn: true,
    }),

  verify: () =>
    set({
      isVerified: true,
    }),

  setAuth: (isLoggedIn, isVerified) =>
    set({
      isLoggedIn,
      isVerified,
    }),

  logout: () =>
    set({
      isLoggedIn: false,
      isVerified: false,
    }),
}));

export default useAuthStore;
