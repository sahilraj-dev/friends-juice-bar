'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream p-4">
      <AlertTriangle className="h-16 w-16 text-brand-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong!</h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        We hit an unexpected snag while processing your request. Our team has been notified.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="bg-brand-500 text-white px-6 py-2 rounded-full font-medium shadow hover:bg-brand-600 transition"
        >
          Try again
        </button>
        <Link 
          href="/"
          className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-full font-medium shadow-sm hover:bg-gray-50 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
