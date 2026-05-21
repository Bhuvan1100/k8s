import { useState, useEffect } from 'react';
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { sendEmailVerification } from 'firebase/auth';
import useUserStore from '../../Stores/UserStore';
import { auth } from '../../Firebase/firebase';
import { useNavigate } from "react-router-dom";
import useThemeStore from '../../Stores/ThemeStore';
import axios from 'axios';

export default function VerifyEmailPage() {
  const { darkMode } = useThemeStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60); // Start with 60 seconds
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    // Redirect to home if user is already verified
    if (user && useUserStore.getState().isVerified) {
      navigate('/');
    }
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const resendVerificationEmail = async () => {
    if (timer > 0 || !user) return;
    
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      await sendEmailVerification(user);
      setSuccessMessage('Verification email sent! Please check your inbox.');
      setTimer(60); // Set 1 minute timer
    } catch (error) {
      console.error('Verification email error:', error);
      setErrors({ general: getErrorMessage(error.code) });
    } finally {
      setIsLoading(false);
    }
  };

  const checkVerification = async () => {
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const user = auth.currentUser;
      if (!user) {
        navigate('/signup');
        return;
      }

      // Reload user to get latest email verification status
      await user.reload();

      if (!user.emailVerified) {
        setErrors({ general: 'Email not verified yet. Please check your inbox and click the verification link.' });
        setIsLoading(false);
        return;
      }

      // ✅ Email is verified in Firebase, now call backend
      try {
        const response = await axios.post(
          '/api/auth/signup',
          { email: user.email },
          { withCredentials: true }
        );

        localStorage.setItem("id", response.data.id);
        console.log('User verified and registered in backend successfully!');
        setSuccessMessage('Email verified successfully! Redirecting...');
        useUserStore.setState({
          isLoggedIn: true,
          email: user.email,
          isVerified: true,
          authChecked: true,
        });
        setTimeout(() => {
          navigate('/');
        }, 1500);
        
      } catch (backendError) {
        console.error('Backend signup failed:', backendError);
        
        // ❌ Backend failed - delete Firebase user to force re-signup
        try {
          await user.delete();
          useUserStore.setState({
            isLoggedIn: false,
            email: "",
            isVerified: false,
            authChecked: true,
          });
          setErrors({
            general: 'Server error occurred. Your account has been removed. Please try signing up again in a few moments.'
          });
          
          // Redirect to signup after 4 seconds
          setTimeout(() => {
            navigate('/signup');
          }, 4000);
          
        } catch (deleteError) {
          console.error('Error deleting user:', deleteError);
          // Fallback: sign out if delete fails
          await auth.signOut();
          useUserStore.setState({
            isLoggedIn: false,
            email: "",
            isVerified: false,
            authChecked: true,
          });
          setErrors({
            general: 'Server error occurred. Please try signing up again after some time.'
          });
          setTimeout(() => {
            navigate('/signup');
          }, 4000);
        }
      }
      
    } catch (error) {
      console.error('Error checking verification:', error);
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/too-many-requests': return 'Too many requests. Please wait before trying again.';
      case 'auth/network-request-failed': return 'Network error. Please check your connection and try again.';
      case 'auth/invalid-user-token': return 'Session expired. Please log in again.';
      default: return 'An error occurred. Please try again.';
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full max-w-md">

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className={`text-xl font-medium tracking-wider pb-2 relative inline-block ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            VERIFY EMAIL
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>
          </h1>
        </div>

        {/* Form Card */}
        <div className={`rounded-lg p-8 transition-all duration-300 ${darkMode ? 'bg-gray-800/50' : 'bg-white'}`}>

          {/* Email Icon */}
          <div className="flex justify-center mb-6 animate-fade-in">
            <div className={`p-4 rounded-full ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
              <EnvelopeIcon className={`w-12 h-12 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className={`mb-6 p-4 rounded-lg animate-fade-in ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'}`}>
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errors.general && (
            <div className={`mb-6 p-4 rounded-lg animate-fade-in ${darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700'}`}>
              {errors.general}
            </div>
          )}

          <div className="space-y-6">

            {/* Instructions */}
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                A verification email has been sent to
              </p>
              <p className={`font-medium mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {user?.email || 'your email'}
              </p>
              <p className={`text-sm mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Please check your inbox and click the verification link to continue.
              </p>
            </div>

            {/* Check Verification Button */}
            <button
              onClick={checkVerification}
              disabled={isLoading}
              className="w-full py-4 rounded font-medium bg-black text-white hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <CheckCircleIcon className="w-5 h-5" />
              {isLoading ? 'CHECKING...' : 'I HAVE VERIFIED'}
            </button>

            {/* Divider */}
            <div className="relative my-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-4 ${darkMode ? 'bg-gray-800/50 text-gray-400' : 'bg-white text-gray-500'}`}>
                  Didn't receive it?
                </span>
              </div>
            </div>

            {/* Resend Button */}
            <button
              onClick={resendVerificationEmail}
              disabled={isLoading || timer > 0}
              className={`w-full py-4 rounded font-medium transition-all duration-300 border animate-slide-up ${
                darkMode 
                  ? 'bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              } ${
                (isLoading || timer > 0) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-[1.02] active:scale-[0.98]'
              }`}
              style={{ animationDelay: '0.4s' }}
            >
              {timer > 0 ? `Resend in ${formatTime(timer)}` : isLoading ? 'SENDING...' : 'RESEND VERIFICATION EMAIL'}
            </button>

            {/* Help Text */}
            <p className={`text-xs text-center mt-4 animate-slide-up ${darkMode ? 'text-gray-500' : 'text-gray-500'}`} style={{ animationDelay: '0.5s' }}>
              Check your spam folder if you don't see the email in your inbox.
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
