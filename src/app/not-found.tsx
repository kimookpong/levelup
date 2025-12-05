import Link from 'next/link';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f1014] text-white p-4">
      <div className="text-center space-y-6 max-w-lg">
        <div className="flex justify-center">
          <FaExclamationTriangle className="text-6xl text-yellow-500 animate-bounce" />
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          404
        </h1>
        <h2 className="text-2xl font-bold">Page Not Found</h2>
        <p className="text-gray-400">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="pt-4">
          <Link 
            href="/"
            className="inline-block px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-full font-bold transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(255,0,85,0.4)]"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
