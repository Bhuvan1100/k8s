import { useNavigate, useLocation } from 'react-router-dom';
import useSellerInfoStore from '../../stores/SellerInfoStore';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const { isComplete } = useSellerInfoStore(); // 👈 added

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-br from-gray-800 to-gray-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              CartCraft
            </span>
          </div>

          <nav className="flex gap-10">

            {/* 👇 Hide Seller Detail if profile is complete */}
            {!isComplete && (
              <button
                onClick={() => navigate('/')}
                className={`relative text-sm font-semibold transition-all duration-200 ${
                  isActive('/')
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Seller Detail
                {isActive('/') && (
                  <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gray-900 rounded-full"></span>
                )}
              </button>
            )}

            <button
              onClick={() => navigate('/add-items')}
              className={`relative text-sm font-semibold transition-all duration-200 ${
                isActive('/add-items')
                  ? 'text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Add Items
              {isActive('/add-items') && (
                <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gray-900 rounded-full"></span>
              )}
            </button>

            <button
              onClick={() => navigate('/added-products')}
              className={`relative text-sm font-semibold transition-all duration-200 ${
                isActive('/added-products')
                  ? 'text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Previous Products
              {isActive('/added-products') && (
                <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gray-900 rounded-full"></span>
              )}
            </button>

          </nav>
        </div>
      </div>
    </header>
  );
}
