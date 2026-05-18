import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../../Firebase/firebase';
import useUserStore from '../../Stores/UserStore';
import useThemeStore from '../../Stores/ThemeStore';

// Initialize Google Provider
const googleProvider = new GoogleAuthProvider();

export default function LoginPage() {
  const navigate = useNavigate();
  const { darkMode } = useThemeStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const { isLoggedIn } = useUserStore();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (successMessage) setSuccessMessage('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found': return 'No account found with this email address.';
      case 'auth/wrong-password': return 'Incorrect password. Please try again.';
      case 'auth/invalid-email': return 'Invalid email address format.';
      case 'auth/user-disabled': return 'This account has been disabled. Please contact support.';
      case 'auth/network-request-failed': return 'Network error. Please check your connection and try again.';
      case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
      case 'auth/popup-closed-by-user': return 'Sign-in popup was closed. Please try again.';
      case 'auth/cancelled-popup-request': return 'Sign-in was cancelled. Please try again.';
      case 'auth/popup-blocked': return 'Popup was blocked by browser. Please allow popups and try again.';
      case 'auth/invalid-credential': return 'Invalid email or password. Please try again.';
      default: return 'An error occurred during sign in. Please try again.';
    }
  };

  const backendLogin = async (firebaseUser) => {
    try {
      const response = await axios.post(
        "api/auth/login",
        { email: firebaseUser.email },
        { withCredentials: true }
      );

      if (!response.data || !response.data.id) {
        throw new Error("Invalid backend response");
      }

      localStorage.setItem("id", response.data.id);

      useUserStore.setState({
        isLoggedIn: true,
        email: firebaseUser.email,
        isVerified: true,
        authChecked: true,
      });

      setSuccessMessage(`Signed in successfully.`);

      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error) {
      await signOut(auth);

      useUserStore.setState({
        isLoggedIn: false,
        email: "",
        isVerified: false,
        authChecked: true,
      });

      const message =
        error.response?.data?.message ||
        error.message ||
        "Backend authentication failed.";

      setErrors({ general: message });
    }
  };

  const handleEmailSignin = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await backendLogin(userCredential.user);

      setFormData({ email: '', password: '' });

      console.log('User signed in:', userCredential.user);
    } catch (error) {
      console.error('Signin error:', error);
      setErrors({ general: getErrorMessage(error.code) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignin = async () => {
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await backendLogin(user);

      setFormData({ email: '', password: '' });

      console.log('User signed in with Google:', user);
    } catch (error) {
      console.error('Google signin error:', error);
      setErrors({ general: getErrorMessage(error.code) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) handleEmailSignin();
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <h1 className={`text-xl font-medium tracking-wider pb-2 relative inline-block ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            LOGIN
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>
          </h1>
        </div>

        <div className={`rounded-lg p-8 transition-all duration-300 ${darkMode ? 'bg-gray-800/50' : 'bg-white'}`}>

          {successMessage && (
            <div className={`mb-6 p-4 rounded-lg animate-fade-in ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'}`}>
              {successMessage}
            </div>
          )}

          {errors.general && (
            <div className={`mb-6 p-4 rounded-lg animate-fade-in ${darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700'}`}>
              {errors.general}
            </div>
          )}

          <div className="space-y-6">

            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className={`relative ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded border ${errors.email ? 'border-red-500' : darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  disabled={isLoading}
                  placeholder="Email address *"
                  className={`w-full px-4 py-4 bg-transparent outline-none ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className={`relative ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded border ${errors.password ? 'border-red-500' : darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  disabled={isLoading}
                  placeholder="Password *"
                  className={`w-full px-4 py-4 pr-12 bg-transparent outline-none ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <button
              onClick={handleEmailSignin}
              disabled={isLoading}
              className="w-full py-4 rounded font-medium bg-black text-white"
            >
              {isLoading ? 'SIGNING IN...' : 'LOGIN'}
            </button>

            <div className="relative my-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-4 ${darkMode ? 'bg-gray-800/50 text-gray-400' : 'bg-white text-gray-500'}`}>OR</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignin}
              disabled={isLoading}
              className={`w-full py-4 rounded font-medium transition-all duration-300 flex items-center justify-center gap-3 border animate-slide-up ${darkMode ? 'bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'} ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
              style={{ animationDelay: '0.6s' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>

            <p className={`text-sm mt-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Don't have an account?{' '}
              <Link
                to="/register"
                className={`font-medium underline ${darkMode ? 'text-white hover:text-gray-300' : 'text-gray-900 hover:text-gray-700'}`}
              >
                Register
              </Link>
            </p>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; animation-fill-mode: both; }
      `}</style>
    </div>
  );
}