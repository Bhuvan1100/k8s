import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../Firebase/firebase';
import useUserStore from '../../Stores/UserStore';
import { toast } from 'sonner';

export default function LogoutPage() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      useUserStore.getState().clearUserData();
      localStorage.removeItem('id');
      toast.success('Logged out successfully.');
      navigate('/login');
    } catch (error) {
      console.error('[LOGOUT] Failed:', error);
      toast.error('Failed to log out. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-sm w-full text-center">

        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M18 15l3-3m0 0-3-3m3 3H9" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Log Out</h1>
        <p className="text-gray-500 text-sm mb-8">Are you sure you want to log out of your account?</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition-colors duration-200"
          >
            Yes, Log Out
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}