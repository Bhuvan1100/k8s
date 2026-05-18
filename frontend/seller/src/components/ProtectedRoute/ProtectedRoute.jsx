import { Navigate, Outlet, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../Firebase/firebase";
import { useEffect, useState, useRef } from "react";
import Header from "../Header/Header";
import LoadingSpinner from "../Spinner/LoadingSpinner";
import useAuthStore from "../../stores/SellerAuthStore";
import useSellerInfoStore from "../../stores/SellerInfoStore";
import axios from "axios";

const ProtectedRoute = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionValid, setSessionValid] = useState(false);
    const [firebaseReady, setFirebaseReady] = useState(false);
    const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
    
    const retryRef = useRef(false);
    const location = useLocation();

    const { setAuth } = useAuthStore();
    const { fetchSellerInfo, setSellerInfo, isComplete } = useSellerInfoStore();

    /* ---------------- Firebase Auth Listener ---------------- */

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setFirebaseReady(true);
        });

        return () => unsubscribe();
    }, []);

    /* ---------------- Main Auth Gate ---------------- */

    useEffect(() => {
        if (!firebaseReady) return;

        const checkAuth = async () => {
            try {
                if (user) {
                    await user.reload();

                    if (!user.emailVerified) {
                        setNeedsEmailVerification(true);
                        setSessionValid(false);
                        setAuth(false, false);
                        setLoading(false);
                        return;
                    }
                }

                const response = await axios.post(
                    "/api/verifyUser",
                    {},
                    { withCredentials: true }
                );

                if (response.data.authenticated) {

                    const backendUser = response.data.user;

                    localStorage.setItem("id", backendUser.userId);

                    setAuth(true, true);
                    setSessionValid(true);
                    setNeedsEmailVerification(false);
                    retryRef.current = false;

                    if (backendUser.roles?.includes("SELLER")) {
                        setSellerInfo({
                            businessName: "Verified Seller",
                            sellerType: "BUSINESS",
                            email: backendUser.email,
                            phone: "0000000000",
                            panNumber: "ABCDE1234F",
                            gstNumber: "22AAAAA0000A1Z5",
                            address: "Verified Seller Address",
                        });
                    }
                } else {

                    if (user && !retryRef.current) {
                        retryRef.current = true;
                        await new Promise(res => setTimeout(res, 500));
                        return checkAuth();
                    }

                    if (user) {
                        await auth.signOut();
                    }

                    setAuth(false, false);
                    setSessionValid(false);
                }
            } catch (error) {
                console.error("Auth check failed:", error);

                if (user) {
                    await auth.signOut();
                }

                setAuth(false, false);
                setSessionValid(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [firebaseReady, user, setAuth, fetchSellerInfo, setSellerInfo]);

    /* ---------------- Routing Rules ---------------- */

    if (loading) return <LoadingSpinner />;

    if (needsEmailVerification) {
        return <Navigate to="/verify-email" replace />;
    }

    if (!sessionValid) {
        return <Navigate to="/signin" replace />;
    }

    // ✅ If profile complete → block "/"
    if (isComplete && location.pathname === "/") {
        return <Navigate to="/add-items" replace />;
    }

    // ✅ If profile NOT complete → block add-items & added-products
    if (
        !isComplete &&
        (location.pathname === "/add-items" ||
         location.pathname === "/added-products")
    ) {
        return <Navigate to="/" replace />;
    }

    return (
        <>
            <Header />
            <Outlet />
        </>
    );
};

export default ProtectedRoute;
