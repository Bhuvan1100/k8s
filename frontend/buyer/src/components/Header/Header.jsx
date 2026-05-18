import React, { useState, useEffect, useRef } from "react";
import {
    MagnifyingGlassIcon,
    UserIcon,
    ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import SearchBar from "../SearchBar/SearchBar";
import { auth } from '../../Firebase/firebase';
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

/* ===== DO NOT CHANGE (AS REQUESTED) ===== */
const IconButtonLight = ({ children, onClick }) => (
    <button
        onClick={onClick}
        className="relative text-gray-900 group transition-colors"
    >
        {children}
        <span className="absolute left-0 -bottom-1 h-px w-[70%] bg-gray-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
    </button>
);

const NavLinkLight = ({ to, children }) => (
    <Link
        to={to}
        className="relative text-gray-900 font-bold group transition-colors"
    >
        {children}
        <span className="absolute left-0 -bottom-1 h-0.5 w-[70%] bg-gray-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
    </Link>
);
/* ======================================== */

const Header = () => {
    const [searchOpen, setSearchOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const user = auth.currentUser;

    const isAuthenticated = (user && user.emailVerified);

    // ✅ FETCH CART COUNT WITH TANSTACK QUERY
    const { data: cartData } = useQuery({
        queryKey: ['cart'],
        queryFn: async () => {
            const userId = localStorage.getItem('id');
            const email = user?.email;

            if (!userId || !email) {
                return { items: [] };
            }

            try {
                const response = await axios.post(
                    '/api/buyer/cart/getcart',
                    { userId, email },
                    { withCredentials: true }
                );
                return response.data;
            } catch (error) {
                console.error('Failed to fetch cart:', error);
                return { items: [] };
            }
        },
        enabled: !!user && !!user.emailVerified, // Only fetch if logged in and verified
        staleTime: 30000, // Cache for 30 seconds
        refetchOnWindowFocus: false, // Don't refetch on every window focus
    });

    const totalItems = cartData?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    const handleUserIconClick = () => {
        setUserMenuOpen(!userMenuOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };

        if (userMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [userMenuOpen]);

    return (
        <div className="sticky top-0 z-50">
            <SearchBar
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
            />

            {/* ================= LIGHT HEADER ================= */}
            <header className="bg-white border-b border-gray-200">
                <div className="px-30 py-5 flex items-center justify-between">
                    <div className="flex items-center h-14 overflow-clip space-x-12">
                        <div className="h-14 overflow-clip">
                            <button onClick={() => navigate("/")}>
                                <img
                                    src="https://res.cloudinary.com/dg0lez6mp/image/upload/w_50,h_14,c_fit,f_auto,q_auto/v1766065838/Lightbg1_iknhu7.png"
                                    data-src="https://res.cloudinary.com/dg0lez6mp/image/upload/w_200,h_56,c_fit,f_auto,q_auto/v1766065838/Lightbg1_iknhu7.png"
                                    alt="Light Logo"
                                    className="h-14 max-w-40 object-contain cursor-pointer filter blur-[0.5px] opacity-80 transition duration-300 ease-out"
                                    onLoad={(e) => {
                                        const target = e.currentTarget;
                                        const src = target.getAttribute("data-src");
                                        if (!src) return;
                                        const fullImage = new Image();
                                        fullImage.src = src;
                                        fullImage.onload = () => {
                                            target.src = fullImage.src;
                                            target.classList.remove("blur-[0.5px]", "opacity-80");
                                        };
                                    }}
                                />
                            </button>
                        </div>

                        <nav className="hidden md:flex items-center space-x-8 text-sm">
                            <NavLinkLight to="/">HOME</NavLinkLight>
                            <NavLinkLight to="/blog">BLOG</NavLinkLight>
                            <NavLinkLight to="/about">ABOUT</NavLinkLight>
                            <NavLinkLight to="/contact">CONTACT</NavLinkLight>
                        </nav>
                    </div>

                    <div className="flex items-center space-x-6">
                        <IconButtonLight onClick={() => setSearchOpen(true)}>
                            <MagnifyingGlassIcon className="h-6 w-6 cursor-pointer" />
                        </IconButtonLight>

                        <div className="relative" ref={menuRef}>
                            <IconButtonLight onClick={handleUserIconClick}>
                                <UserIcon className="h-6 w-6 cursor-pointer" />
                            </IconButtonLight>

                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                                    {!isAuthenticated ? (
                                        <>
                                            <button
                                                onClick={() => { navigate("/login"); setUserMenuOpen(false); }}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                                            >
                                                Login
                                            </button>
                                            <button
                                                onClick={() => { navigate("/register"); setUserMenuOpen(false); }}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                                            >
                                                Register
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => { navigate("/previous-orders"); setUserMenuOpen(false); }}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                                            >
                                                Previous Orders
                                            </button>
                                            <button
                                                onClick={() => { navigate("/current-orders"); setUserMenuOpen(false); }}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                                            >
                                                Current Orders
                                            </button>
                                            <button
                                                onClick={() => { navigate("/profile"); setUserMenuOpen(false); }}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                                            >
                                                Your Details
                                            </button>
                                            <button
                                                onClick={() => {navigate("/logout")}}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                                            >
                                                Logout
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <IconButtonLight onClick={() => navigate("/cart")}>
                            <div className="relative cursor-pointer">
                                <ShoppingCartIcon className="h-6 w-6" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                        {totalItems}
                                    </span>
                                )}
                            </div>
                        </IconButtonLight>
                    </div>
                </div>
            </header>
        </div>
    );
};

export default Header;