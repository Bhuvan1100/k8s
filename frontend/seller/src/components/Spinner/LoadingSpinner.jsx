export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="flex flex-col items-center justify-center p-4 rounded-md backdrop-blur-sm bg-white/20">
        <div className="relative w-16 h-16">
          {/* Background circle */}
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>

          {/* Spinning top border */}
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        </div>

        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
