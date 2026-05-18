import Header from './components/Header/Header'
import SearchBar from './components/SearchBar/SearchBar'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoadingSpinner from './components/Spinner/Spinner';
import Footer from './components/Footer/Footer';
import { Toaster } from 'sonner';
import Homepage from './Pages.jsx/HomePage';
import KidsCollections from './components/Collections/KidsCollection';
import MensCollections from './components/Collections/MensCollection';
import WomensCollections from './components/Collections/WomensCollection';
import ProductPage from './components/Shop/ProductPage';
import ScrollToTop from './components/ScrolllToTop/ScrollToTop';
import ShopPage from './components/Shop/ShopPage';
import LoginPage from './components/Signin/Login';
import SignupPage from './components/SignUp/Signup';
import VerifyEmailPage from './components/SignUp/Emailverification';
import ShoppingCart from './components/Cart/ShoppingCart';
import { useEffect, useState, useRef } from 'react';
import useUserStore from './Stores/UserStore';
import CurrentOrdersPage from './components/Orders/CurrentOrders';
import UserProfile from './components/UserProfile';
import { auth } from './Firebase/firebase';
import PreviousOrdersPage from './components/Orders/PreviousOrders';
import { onAuthStateChanged } from 'firebase/auth';
import AddressPage from './components/Cart/AddressPage';
import PaymentPage from './components/Cart/PaymentPage';
import axios from 'axios'
import ConfirmCart from './components/Cart/ConfirmCart';
import LogoutPage from './components/Logout/Logout';

function App() {

  const [authLoading, setAuthLoading] = useState(true);
  const retryRef = useRef(false);

  useEffect(() => {

    console.log("🚀 App mounted — Setting up Firebase auth listener");

    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      console.log("🔄 onAuthStateChanged triggered");
      console.log("👤 Firebase user object:", user);

      const verifyBackend = async () => {

        console.log("📡 Calling backend: /api/verifyUser");

        try {

          const response = await axios.post(
            "/api/verifyUser",
            {},
            { withCredentials: true }
          );

          console.log("✅ Backend response:", response.data);

          if (response.data.authenticated) {

            console.log("🎉 Backend authentication SUCCESS");

            const backendUser = response.data.user;

            localStorage.setItem("id", backendUser.userId);
            console.log("🆔 Stored userId in localStorage:", backendUser.userId);

            useUserStore.setState({
              isLoggedIn: true,
              email: user.email,
              isVerified: true,
              authChecked: true,
            });
            const is = useUserStore.getState().isVerified;
            console.log(is);
            console.log("🟢 Login status set TRUE");

            console.log("📦 Fetching user data (cart & orders)...");

            retryRef.current = false;

          } else {

            console.log("⚠️ Backend says NOT authenticated");

            if (!user.emailVerified) {

              console.log("📩 Email not verified & backend failed. NOT logging out.");

              useUserStore.setState({
                isLoggedIn: true,
                email: user.email,
                isVerified: false,
                authChecked: true,
              });

              setAuthLoading(false);
              return;
            }
            
            if (user && !retryRef.current) {

              console.log("🔁 Retrying backend verification once...");
              retryRef.current = true;

              await new Promise(res => setTimeout(res, 500));
              return verifyBackend();
            }

            console.log("❌ Verified but backend still failing. Logging out...");
            await auth.signOut();
            useUserStore.getState().setLoginStatus(false, null, false);
          }

        } catch (error) {

          console.error("🔥 Backend verification ERROR:", error);

          if (!user.emailVerified) {

            console.log("📩 Email not verified. Keeping user logged in.");

            useUserStore.setState({
              isLoggedIn: true,
              email: user.email,
              isVerified: false,
              authChecked: true,
            });

            setAuthLoading(false);
            return;
          }

          // 🔁 Retry once
          if (user && !retryRef.current) {

            console.log("🔁 Backend error. Retrying once...");
            retryRef.current = true;

            await new Promise(res => setTimeout(res, 500));
            return verifyBackend();
          }

          console.log("❌ Verified user but backend permanently failing. Logging out.");
          await auth.signOut();
          useUserStore.getState().setLoginStatus(false, null, false);

        } finally {

          console.log("⏹ Auth loading complete");
          setAuthLoading(false);
        }
      };

      if (!user) {
        console.log("🚪 No Firebase user found. Setting login false.");
        useUserStore.setState({
          isLoggedIn: false,
          email: "",
          isVerified: false,
          authChecked: true,
        });

        setAuthLoading(false);

      } else {

        console.log("🔐 Firebase user detected");
        console.log("📧 Email:", user.email);
        console.log("✔️ Email verified:", user.emailVerified);

        await verifyBackend();
      }

    });

    return () => {
      console.log("🧹 Cleaning up Firebase auth listener");
      unsubscribe();
    };

  }, []);

  if (authLoading) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <BrowserRouter>
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/category/:slug" element={<ShopPage />} />
          <Route path="/womensCollections" element={<WomensCollections />} />
          <Route path="/kidscollections" element={<KidsCollections />} />
          <Route path="/mensCollections" element={<MensCollections />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/cart" element={<ShoppingCart />} />
          <Route path="/checkout/address" element={<AddressPage />} />
          <Route path="/checkout/confirmcart" element={<ConfirmCart />} />
          <Route path="/checkout/payment" element={<PaymentPage />} />
          <Route path="/" element={<Homepage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/previous-orders" element={<PreviousOrdersPage />} />
          <Route path="/current-orders" element={<CurrentOrdersPage />} />
          <Route path="/logout" element={<LogoutPage />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  )
}

export default App