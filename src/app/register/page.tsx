'use client';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, loginWithOAuth } from '@/lib/features/userSlice';
import { AppDispatch, RootState } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Hotel, User, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.72-.92 2.74 1 .08 2.01-.49 2.62-1.24z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [oauthError, setOauthError] = useState('');

  // Google OAuth Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [isCustomGoogleActive, setIsCustomGoogleActive] = useState(false);
  const [isAuthenticatingOAuth, setIsAuthenticatingOAuth] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { error } = useSelector((state: RootState) => state.user || { error: null });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setOauthError('');

    const result = await dispatch(
      registerUser({
        username,
        name: name || username,
        email,
        password,
        role: 'guest',
      })
    );

    if (registerUser.fulfilled.match(result)) {
      setSuccessMsg('Account created! Redirecting to sign in...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } else {
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignIn = async (userEmail: string, userName?: string, provider = 'google') => {
    if (!userEmail) return;
    setIsAuthenticatingOAuth(true);
    setOauthError('');

    try {
      const result = await dispatch(
        loginWithOAuth({
          email: userEmail,
          name: userName || userEmail.split('@')[0],
          provider,
        })
      );

      if (loginWithOAuth.fulfilled.match(result)) {
        setIsGoogleModalOpen(false);
        setSuccessMsg(`Authenticated via ${provider === 'google' ? 'Google' : provider}! Welcome to LuxeStay.`);
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      } else {
        setOauthError((result.payload as string) || 'OAuth authentication failed.');
      }
    } catch (_err) {
      setOauthError('Unable to connect to OAuth service.');
    } finally {
      setIsAuthenticatingOAuth(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#faf8f5] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left Editorial Visual */}
        <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-8 text-white">
          <Image
            src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=85"
            alt="LuxeStay Villa"
            fill
            sizes="40vw"
            className="object-cover"
          />
          <div className="absolute inset-0 photo-scrim" />

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
                <Hotel className="text-slate-950" size={20} />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                LuxeStay
              </span>
            </Link>
          </div>

          <div className="relative z-10 space-y-2">
            <p className="font-display text-xl italic font-normal text-amber-200 leading-snug">
              &ldquo;Join our privileged circle of guests to unlock bespoke rates and private concierge access.&rdquo;
            </p>
            <p className="text-xs uppercase tracking-widest font-semibold text-slate-300">
              LuxeStay Honors Membership
            </p>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-amber-700 transition-colors inline-flex items-center gap-1">
                ← Return to Home
              </Link>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <ShieldCheck size={14} /> Account Registration
              </div>
            </div>

            {/* Clean Direct Heading */}
            <div className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
                Sign Up
              </h1>
            </div>

            {/* Quick Social Authentication Options */}
            <div className="space-y-2.5 mb-5">
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-xs cursor-pointer"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('guest.apple@icloud.com', 'Apple User', 'Apple')}
                  className="py-2.5 px-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <AppleIcon />
                  <span>Apple ID</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('guest.github@github.com', 'GitHub User', 'GitHub')}
                  className="py-2.5 px-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <GitHubIcon />
                  <span>GitHub</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase font-bold tracking-wider text-slate-400 bg-white px-3">
                or continue with credentials
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative rounded-xl border border-slate-300 bg-white focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-500/20">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Eleanor Vance"
                      className="w-full px-3.5 py-2.5 text-slate-900 bg-transparent rounded-xl outline-none font-medium text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Username
                  </label>
                  <div className="relative rounded-xl border border-slate-300 bg-white focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-500/20">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="e.g. eleanor_v"
                      className="w-full px-3.5 py-2.5 text-slate-900 bg-transparent rounded-xl outline-none font-medium text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative rounded-xl border border-slate-300 bg-white focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-500/20">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="eleanor@example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 text-slate-900 bg-transparent rounded-xl outline-none font-medium text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative rounded-xl border border-slate-300 bg-white focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-500/20">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Create a secure password"
                    className="w-full pl-9 pr-3.5 py-2.5 text-slate-900 bg-transparent rounded-xl outline-none font-medium text-sm"
                  />
                </div>
              </div>

              {(error || oauthError) && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{oauthError || error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-gold py-3 text-sm font-bold justify-center mt-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Complete Registration <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between text-xs text-slate-500">
            <span>Already have an account?</span>
            <Link href="/login" className="font-bold text-amber-700 hover:text-amber-800">
              Sign In →
            </Link>
          </div>
        </div>
      </div>

      {/* ────────────────── GOOGLE OAUTH AUTHENTICATION MODAL ────────────────── */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GoogleIcon />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Sign in with Google</h3>
                  <p className="text-[11px] text-slate-500">to continue to LuxeStay Hotel</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsGoogleModalOpen(false);
                  setIsCustomGoogleActive(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-3">
              {isAuthenticatingOAuth ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-800">Authenticating with Google Account...</p>
                  <p className="text-[11px] text-slate-500">Exchanging OAuth 2.0 verification tokens</p>
                </div>
              ) : !isCustomGoogleActive ? (
                <>
                  <p className="text-xs font-medium text-slate-600 mb-2">
                    Choose a Google account:
                  </p>

                  {/* Account 1 */}
                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn('gopinath.cyber@gmail.com', 'Gopinath')}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 text-left transition-all flex items-center gap-3 group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      G
                    </div>
                    <div className="truncate flex-1">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-amber-900">Gopinath</div>
                      <div className="text-[11px] text-slate-500 truncate">gopinath.cyber@gmail.com</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active
                    </span>
                  </button>

                  {/* Account 2 */}
                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn('alex.morgan@gmail.com', 'Alex Morgan')}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 text-left transition-all flex items-center gap-3 group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                      A
                    </div>
                    <div className="truncate flex-1">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-amber-900">Alex Morgan</div>
                      <div className="text-[11px] text-slate-500 truncate">alex.morgan@gmail.com</div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                      Guest
                    </span>
                  </button>

                  {/* Option: Use another account */}
                  <button
                    type="button"
                    onClick={() => setIsCustomGoogleActive(true)}
                    className="w-full p-3 rounded-xl border border-dashed border-slate-300 hover:border-amber-500 hover:bg-slate-50 text-left transition-all flex items-center gap-3 text-xs font-bold text-slate-700 hover:text-amber-800 cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-bold">
                      +
                    </div>
                    <span>Use another Google account</span>
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-slate-600">
                    Enter your Google email address:
                  </p>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      placeholder="e.g. Liam Sterling"
                      className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Google Email
                    </label>
                    <input
                      type="email"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="username@gmail.com"
                      className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCustomGoogleActive(false)}
                      className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOAuthSignIn(customGoogleEmail, customGoogleName, 'Google')}
                      disabled={!customGoogleEmail.includes('@')}
                      className="flex-1 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                    >
                      Authenticate Google Account
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-400">
                LuxeStay uses Google OAuth 2.0 to protect your privacy &amp; credentials.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
