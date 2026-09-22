'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Fetch session to get role
      const res = await fetch('/api/auth/session');
      const session = await res.json();
      
      if ((session?.user as any)?.role === 'VENDOR') {
        router.push('/vendor');
      } else if ((session?.user as any)?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const fillDemo = (type: 'customer' | 'vendor' | 'admin') => {
    const creds = {
      customer: { email: 'rahul@campus.edu', password: 'password123' },
      vendor: { email: 'vendor@friendsjuicebar.com', password: 'password123' },
      admin: { email: 'admin@friendsjuicebar.com', password: 'password123' },
    };
    setEmail(creds[type].email);
    setPassword(creds[type].password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-600 pt-12 pb-16 px-6 rounded-b-[2rem]">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl">🥤</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Friends Juice Bar</h1>
          <p className="text-white/80 text-sm">Your campus favourite, now online!</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 -mt-8 px-6">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-xl font-bold text-charcoal mb-1">Welcome back!</h2>
          <p className="text-gray-500 text-sm mb-6">Sign in to continue ordering</p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand-500 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        {process.env.NODE_ENV === 'development' && (
          <div className="max-w-md mx-auto mt-4 bg-white rounded-2xl shadow-card p-4">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Quick Demo Login</p>
            <div className="flex gap-2">
              <button
                onClick={() => fillDemo('customer')}
                className="flex-1 py-2.5 px-3 bg-green-50 text-green-700 rounded-xl text-xs font-medium hover:bg-green-100 transition"
              >
                👨‍🎓 Student
              </button>
              <button
                onClick={() => fillDemo('vendor')}
                className="flex-1 py-2.5 px-3 bg-orange-50 text-orange-700 rounded-xl text-xs font-medium hover:bg-orange-100 transition"
              >
                🏪 Vendor
              </button>
              <button
                onClick={() => fillDemo('admin')}
                className="flex-1 py-2.5 px-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-medium hover:bg-blue-100 transition"
              >
                👑 Admin
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-gray-400">
        Made with ❤️ for campus foodies
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><Loader2 className="animate-spin text-brand-500 w-12 h-12" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
