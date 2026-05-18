// LoadingSpinner.jsx
import useThemeStore from "../../Stores/ThemeStore";

export default function LoadingSpinner() {
  const darkMode = useThemeStore((state) => state.darkMode);
  
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className={`flex flex-col items-center justify-center p-4 rounded-md backdrop-blur-sm ${
        darkMode ? 'bg-gray-900/20' : 'bg-white/20'
      }`}>
        <div className="relative w-16 h-16">
          <div 
            className={`absolute inset-0 border-4 rounded-full ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          ></div>
          <div 
            className={`absolute inset-0 border-4 border-transparent rounded-full animate-spin ${
              darkMode ? 'border-t-blue-500' : 'border-t-blue-600'
            }`}
          ></div>
        </div>
        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Loading...</p>
      </div>
    </div>
  );
}
