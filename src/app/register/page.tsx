'use client';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '@/lib/features/userSlice';
import { AppDispatch, RootState } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Hotel, User, Lock, Mail, Phone, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, X, KeyRound } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import HotelBrand from '@/components/ui/HotelBrand';
import PhoneInput from '@/components/ui/PhoneInput';

// Removed Apple login

const GitHubIcon = () => (
  <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  // Mobile OTP Verification State
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { error } = useSelector((state: RootState) => state.user || { error: null });

  const handleSendOtp = async () => {
    setOtpError('');
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setOtpError('Please enter a valid mobile number first.');
      return;
    }
    setIsSendingOtp(true);
    try {
      const fullPhone = `${countryCode}${cleanPhone}`;
      const res = await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', phone: fullPhone, rawPhone: cleanPhone, countryCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || 'Failed to send OTP.');
      } else {
        setGeneratedOtp(data.otp || '');
        setIsOtpSent(true);
        setOtpCode('');
      }
    } catch (_err) {
      setOtpError('Network error connecting to OTP verification gateway.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError('');
    const cleanPhone = phone.replace(/\D/g, '');
    const code = otpCode.replace(/\D/g, '').trim();
    if (!code || code.length !== 6) {
      setOtpError('Please enter the 6-digit OTP code.');
      return;
    }
    try {
      const fullPhone = `${countryCode}${cleanPhone}`;
      const res = await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', phone: fullPhone, rawPhone: cleanPhone, code }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setIsPhoneVerified(true);
        setOtpError('');
      } else {
        setOtpError(data.error || 'Invalid OTP code. Please try again.');
      }
    } catch (_err) {
      setOtpError('Network error verifying OTP code.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneVerified) {
      setOtpError('Please verify your mobile number with OTP before completing registration.');
      return;
    }
    setIsSubmitting(true);

    const fullPhone = `${countryCode} ${phone}`;
    const result = await dispatch(
      registerUser({
        username,
        name: name || username,
        email,
        phone: fullPhone,
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
            <HotelBrand href="/" iconSize={20} inverted={true} textClassName="font-display text-2xl font-bold tracking-tight text-white" />
          </div>

          <div className="relative z-10 space-y-2">
            <p className="font-display text-xl italic font-normal text-amber-200 leading-snug">
              &ldquo;Join our guests to unlock member discounts and 24/7 room service.&rdquo;
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
            </div>

            {/* Clean Direct Heading */}
            <div className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
                Sign Up
              </h1>
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

              {/* Mobile Number & OTP Verification */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Mobile Number
                    </label>
                    {isPhoneVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-700 font-semibold">
                        Verification Required
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <PhoneInput
                        countryCode={countryCode}
                        onCountryCodeChange={(code) => {
                          setCountryCode(code);
                          setIsPhoneVerified(false);
                          setIsOtpSent(false);
                          setGeneratedOtp('');
                        }}
                        phone={phone}
                        onPhoneChange={(val) => {
                          setPhone(val);
                          if (isPhoneVerified) setIsPhoneVerified(false);
                          setIsOtpSent(false);
                          setGeneratedOtp('');
                          setOtpError('');
                        }}
                        disabled={isPhoneVerified}
                        placeholder="e.g. 9876543210"
                      />
                    </div>
                    {!isPhoneVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                        className="px-3.5 py-2.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 shrink-0 cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        {isSendingOtp ? 'Sending...' : isOtpSent ? 'Resend OTP' : 'Send OTP'}
                      </button>
                    )}
                  </div>
                </div>

                {/* OTP Input section when OTP is sent & not yet verified */}
                {isOtpSent && !isPhoneVerified && (
                  <div className="pt-2 border-t border-slate-200/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-slate-600 font-medium">
                        Verification code for {countryCode} {phone}
                      </span>
                      {generatedOtp && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-amber-900 font-mono bg-amber-100/90 border border-amber-300 px-2.5 py-1 rounded-md shadow-xs animate-pulse">
                          <span>SMS Code:</span>
                          <strong className="text-sm font-black tracking-widest text-slate-900">{generatedOtp}</strong>
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1 rounded-xl border border-slate-300 bg-white focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-500/20">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <KeyRound size={16} />
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="6-digit OTP"
                          className="w-full pl-9 pr-3.5 py-2 text-slate-900 bg-transparent rounded-xl outline-none font-mono font-bold text-sm tracking-widest"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 cursor-pointer transition-colors"
                      >
                        Verify OTP
                      </button>
                    </div>
                  </div>
                )}

                {otpError && (
                  <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle size={12} className="shrink-0" /> {otpError}
                  </p>
                )}
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

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
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
                disabled={isSubmitting || !isPhoneVerified}
                className="w-full btn-gold py-3 text-sm font-bold justify-center mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign Up <ArrowRight size={16} />
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
    </div>
  );
}
