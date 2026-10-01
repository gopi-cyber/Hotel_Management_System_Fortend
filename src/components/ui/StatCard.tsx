import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  onClick,
}: StatCardProps) {
  const changeColors = {
    positive: 'text-emerald-700 bg-emerald-50',
    negative: 'text-rose-700 bg-rose-50',
    neutral: 'text-slate-600 bg-slate-100',
  }[changeType];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
          <Icon size={20} />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-2 flex-wrap">
        <span className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
          {value}
        </span>
        {change && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${changeColors}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

export default StatCard;
