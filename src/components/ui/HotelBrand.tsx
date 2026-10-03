'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Hotel } from 'lucide-react';

interface HotelBrandProps {
  href?: string;
  className?: string;
  iconSize?: number;
  textClassName?: string;
  taglineClassName?: string;
  showTagline?: boolean;
  inverted?: boolean;
}

export default function HotelBrand({
  href = '/',
  className = '',
  iconSize = 20,
  textClassName = 'font-display text-2xl font-bold tracking-tight',
  taglineClassName = 'text-[10px] uppercase tracking-widest font-bold mt-0.5 block',
  showTagline = true,
  inverted = false,
}: HotelBrandProps) {
  const company = useSelector((state: RootState) => state.settings?.companyProfile);

  const brandName = company?.brandName || company?.companyName || 'LuxeStay';
  const tagline = company?.tagline || 'Hotels & Residences';
  const logoUrl = company?.logoUrl;

  const content = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {logoUrl ? (
        <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-amber-500/30 shrink-0 bg-white shadow-xs">
          <Image
            src={logoUrl}
            alt={brandName}
            fill
            sizes="36px"
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 shadow-xs">
          <Hotel className="text-slate-950" size={iconSize} />
        </div>
      )}
      <div className="min-w-0">
        <span
          className={`${textClassName} ${
            inverted ? 'text-white' : 'text-slate-900'
          } block leading-tight truncate`}
        >
          {brandName}
        </span>
        {showTagline && (
          <span
            className={`${taglineClassName} ${
              inverted ? 'text-amber-200/90' : 'text-amber-700'
            } truncate`}
          >
            {tagline}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
