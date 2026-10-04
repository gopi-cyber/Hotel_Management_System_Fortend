'use client';

import React, { useState, useRef, useEffect } from 'react';
import { COUNTRY_CODES, CountryCode } from '@/lib/countryCodes';
import { ChevronDown, Phone, Check } from 'lucide-react';

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
  placeholder = '90258 21441',
  className = '',
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry =
    COUNTRY_CODES.find((c) => c.dialCode === countryCode) || COUNTRY_CODES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const max = selectedCountry.maxLength || 10;
    onPhoneChange(raw.slice(0, max));
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative flex items-center w-full rounded-xl border border-slate-300 bg-white focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all ${
        disabled ? 'opacity-60 bg-slate-50 pointer-events-none' : ''
      } ${className}`}
    >
      {/* Compact Country Selector Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2.5 border-r border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 rounded-l-xl cursor-pointer select-none shrink-0 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-base leading-none">{selectedCountry.flag}</span>
        <span className="text-xs font-bold text-slate-900">{selectedCountry.dialCode}</span>
        <ChevronDown size={13} className={`text-slate-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Dropdown List */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-64 max-h-56 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1.5">
          <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            Select Country
          </div>
          {COUNTRY_CODES.map((c) => {
            const isSelected = c.dialCode === selectedCountry.dialCode;
            return (
              <button
                key={c.code + c.dialCode}
                type="button"
                onClick={() => {
                  onCountryCodeChange(c.dialCode);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-amber-50 ${
                  isSelected ? 'bg-amber-50/80 font-bold text-amber-950' : 'text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{c.flag}</span>
                  <span className="font-medium truncate max-w-[130px]">{c.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-semibold text-slate-500 font-mono text-[11px]">{c.dialCode}</span>
                  {isSelected && <Check size={13} className="text-amber-600" />}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Numeric Mobile Input */}
      <div className="relative flex-1 flex items-center min-w-0">
        <div className="pl-3 text-slate-400 pointer-events-none shrink-0">
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
          className="w-full pl-2.5 pr-3 py-2.5 text-slate-900 bg-transparent rounded-r-xl outline-none font-medium text-sm tracking-wide"
        />
      </div>
    </div>
  );
}
