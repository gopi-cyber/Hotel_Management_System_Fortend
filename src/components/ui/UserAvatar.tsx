'use client';
import React from 'react';

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: { box: 'w-7 h-7 text-[10px]', text: 'text-[10px]' },
  sm: { box: 'w-8 h-8 text-xs', text: 'text-xs' },
  md: { box: 'w-10 h-10 text-sm', text: 'text-sm' },
  lg: { box: 'w-14 h-14 text-lg', text: 'text-lg' },
  xl: { box: 'w-20 h-20 text-2xl', text: 'text-2xl' },
};

export default function UserAvatar({
  name = 'Guest',
  avatarUrl = '',
  size = 'md',
  className = '',
}: UserAvatarProps) {
  const initial = (name?.trim()?.charAt(0) || 'G').toUpperCase();
  const sizeConfig = sizeMap[size] || sizeMap.md;

  if (avatarUrl) {
    return (
      <div
        className={`${sizeConfig.box} rounded-full overflow-hidden shrink-0 border border-slate-200 shadow-xs bg-slate-100 ${className}`}
      >
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeConfig.box} rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white font-bold flex items-center justify-center shrink-0 shadow-xs select-none ${className}`}
    >
      <span>{initial}</span>
    </div>
  );
}
