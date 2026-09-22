import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream p-4">
      <SearchX className="h-16 w-16 text-gray-400 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        We couldn't find the page or resource you were looking for. It might have been moved or doesn't exist.
      </p>
      <Link 
        href="/"
        className="bg-brand-500 text-white px-8 py-3 rounded-full font-medium shadow hover:bg-brand-600 transition"
      >
        Return Home
      </Link>
    </div>
  );
}
