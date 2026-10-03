'use client';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '@/lib/features/userSlice';
import { AppDispatch, RootState } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Hotel, User, Lock, ArrowRight, ShieldCheck, AlertCircle, KeyRound, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import HotelBrand from '@/components/ui/HotelBrand';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { error } = useSelector((state: RootState) => state.user || { error: null });

  useEffect(() => {
    router.prefetch('/admin');
    router.prefetch('/receptionist');
    router.prefetch('/dashboard');
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;
    setIsSubmitting(true);

    const result = await dispatch(loginUser({ username: identifier.trim(), password }));
    if (loginUser.fulfilled.match(result)) {
      const loggedIn = result.payload;
      const role = loggedIn.role?.toLowerCase();
      
      // Automatic role-based routing
      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'receptionist' || role === 'staff') {
        router.push('/receptionist');
      } else {
        router.push('/dashboard');
      }
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#faf8f5] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        {/* Left Editorial Visual */}
        <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-8 text-white">
          <Image
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=85"
            alt="LuxeStay Resort"
            fill
            sizes="40vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 photo-scrim" />

          {/* Brand header */}
          <div className="relative z-10">
            <HotelBrand href="/" iconSize={20} inverted={true} textClassName="font-display text-2xl font-bold tracking-tight text-white" />
          </div>

          {/* Luxury quote */}
          <div className="relative z-10 space-y-2">
            <p className="font-display text-xl italic font-normal text-amber-200 leading-snug">
              &ldquo;An extraordinary benchmark in bespoke hospitality and seamless digital comfort.&rdquo;
            </p>
            <p className="text-xs uppercase tracking-widest font-semibold text-slate-300">
              Forbes Luxury Hotel Guide 2026
            </p>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Top Back & Header */}
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-amber-700 transition-colors inline-flex items-center gap-1">
                ← Return to Home
              </Link>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
                Sign In
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Username or Email Address
                </label>
                <div className="relative rounded-xl border border-slate-300 bg-white focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    autoComplete="username"
                    placeholder="e.g. admin or staff or guest"
                    className="w-full pl-10 pr-4 py-3 text-slate-900 bg-transparent rounded-xl outline-none font-medium text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative rounded-xl border border-slate-300 bg-white focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your account password"
                    className="w-full pl-10 pr-4 py-3 text-slate-900 bg-transparent rounded-xl outline-none font-medium text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5">
                  <AlertCircle size={17} className="shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-gold py-3.5 text-sm font-bold justify-center mt-2 cursor-pointer shadow-sm"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Note */}
          <div className="pt-5 border-t border-slate-100 mt-6 flex items-center justify-between text-xs text-slate-500">
            <span>New to LuxeStay?</span>
            <Link href="/register" className="font-bold text-amber-700 hover:text-amber-800">
              Create Account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
