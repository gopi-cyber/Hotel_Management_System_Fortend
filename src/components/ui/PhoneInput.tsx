'use client';

import React from 'react';
import { COUNTRY_CODES, CountryCode } from '@/lib/countryCodes';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  phone: string;
  onPhoneChange: (phone: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export default function PhoneInput({
  countryCode,
  onCountryCodeChange,
  phone,
  onPhoneChange,
  disabled = false,
  placeholder = 'Mobile number',
  className = '',
}: PhoneInputProps) {
  const currentCountry =
    COUNTRY_CODES.find((c) => c.dialCode === countryCode) || COUNTRY_CODES[0];

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const max = currentCountry.maxLength || 10;
    onPhoneChange(raw.slice(0, max));
  };

  return (
    <div
      className={`relative flex items-center rounded-xl border border-slate-300 bg-white focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all ${
        disabled ? 'opacity-60 bg-slate-50 pointer-events-none' : ''
      } ${className}`}
    >
      {/* Country Code Selector */}
      <div className="relative flex items-center pl-3 pr-2 py-2 border-r border-slate-200 shrink-0 bg-slate-50/50 rounded-l-xl">
        <span className="text-base mr-1.5 select-none">{currentCountry.flag}</span>
        <select
          value={countryCode}
          onChange={(e) => onCountryCodeChange(e.target.value)}
          disabled={disabled}
          className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1"
          aria-label="Country Dial Code"
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code + c.dialCode} value={c.dialCode}>
              {c.flag} {c.dialCode} ({c.name})
            </option>
          ))}
        </select>
      </div>

      {/* Phone Icon & Input */}
      <div className="relative flex-1 flex items-center">
        <div className="pl-3 text-slate-400 pointer-events-none">
          <Phone size={15} />
        </div>
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={phone}
          onChange={handlePhoneInput}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full pl-2.5 pr-3 py-2.5 text-slate-900 bg-transparent rounded-r-xl outline-none font-medium text-sm"
        />
      </div>
    </div>
  );
}
