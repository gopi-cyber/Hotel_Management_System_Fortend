import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const normalized = (status || '').toLowerCase().replace(/[\s-]/g, '_');

  const configs: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    available: { label: 'Available', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', dot: 'bg-emerald-500' },
    active: { label: 'Active', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', dot: 'bg-emerald-500' },
    confirmed: { label: 'Confirmed', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', dot: 'bg-emerald-500' },
    
    occupied: { label: 'Occupied', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', dot: 'bg-amber-500' },
    checked_in: { label: 'Checked In', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', dot: 'bg-amber-500' },
    pending: { label: 'Pending', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', dot: 'bg-amber-500' },
    in_progress: { label: 'In Progress', bg: 'bg-sky-50 border-sky-200', text: 'text-sky-800', dot: 'bg-sky-500' },
    completed: { label: 'Completed', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', dot: 'bg-emerald-500' },

    cleaning: { label: 'Cleaning', bg: 'bg-sky-50 border-sky-200', text: 'text-sky-800', dot: 'bg-sky-500' },
    maintenance: { label: 'Maintenance', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-800', dot: 'bg-rose-500' },
    checked_out: { label: 'Checked Out', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', dot: 'bg-slate-400' },
    cancelled: { label: 'Cancelled', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-800', dot: 'bg-rose-500' },
    on_leave: { label: 'On Leave', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', dot: 'bg-slate-400' },
  };

  const current = configs[normalized] || {
    label: status || 'Unknown',
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg} ${current.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
}

export default StatusBadge;
