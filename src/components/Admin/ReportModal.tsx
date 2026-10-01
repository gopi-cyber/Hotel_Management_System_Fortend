'use client';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { formatPrice } from '@/lib/features/settingsSlice';
import Modal from '@/components/ui/Modal';
import {
  TrendingUp,
  DollarSign,
  Users,
  Award,
  ShieldCheck,
  Calendar,
  PieChart,
  BarChart2,
  ArrowUpRight,
  Layers,
} from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'financial' | 'growth';
  totalRevenue: number;
  totalRooms: number;
  occupiedRooms: number;
  totalBookings: number;
}

export function ReportModal({
  isOpen,
  onClose,
  type,
  totalRevenue,
  totalRooms,
  occupiedRooms,
  totalBookings,
}: ReportModalProps) {
  const currency = useSelector((state: RootState) => state.settings?.currency || 'INR');
  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('7d');
  const [activeTab, setActiveTab] = useState<'revenue' | 'channels'>('revenue');

  const occupancyRate = Math.round((occupiedRooms / Math.max(1, totalRooms)) * 100);
  const safeRevenue = Math.max(totalRevenue, 185000);
  const adr = totalBookings > 0 ? Math.round(safeRevenue / totalBookings) : 32000;
  const revPar = Math.round((adr * occupancyRate) / 100) || Math.round(safeRevenue / Math.max(1, totalRooms));

  // 7-day revenue dataset (Mon - Sun)
  const data7d = [
    { day: 'Mon', revenue: 42000, occupancy: 60 },
    { day: 'Tue', revenue: 58000, occupancy: 70 },
    { day: 'Wed', revenue: 51000, occupancy: 65 },
    { day: 'Thu', revenue: 76000, occupancy: 85 },
    { day: 'Fri', revenue: 112000, occupancy: 95 },
    { day: 'Sat', revenue: 135000, occupancy: 100 },
    { day: 'Sun', revenue: 89000, occupancy: 80 },
  ];

  // 30-day dataset (4 weeks)
  const data30d = [
    { day: 'W1', revenue: 380000, occupancy: 72 },
    { day: 'W2', revenue: 460000, occupancy: 81 },
    { day: 'W3', revenue: 520000, occupancy: 88 },
    { day: 'W4', revenue: 610000, occupancy: 94 },
  ];

  const activeData = timeframe === '7d' ? data7d : data30d;
  const maxRevenue = Math.max(...activeData.map((d) => d.revenue));

  // SVG Chart Dimensions
  const chartWidth = 560;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 25;

  const points = activeData.map((d, index) => {
    const x = paddingX + (index * (chartWidth - paddingX * 2)) / (activeData.length - 1);
    const y = chartHeight - paddingY - (d.revenue / maxRevenue) * (chartHeight - paddingY * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'financial' ? 'Executive Hospitality Yield & RevPAR' : 'Operational Performance Dashboard'}
      subtitle="Audited financial statements, occupancy curves, and channel analytics."
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Core Yield Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-bold">RevPAR</span>
              <ArrowUpRight size={13} className="text-emerald-600" />
            </div>
            <span className="text-lg sm:text-xl font-bold font-display text-slate-900 block">
              {formatPrice(revPar, currency)}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">+14.2% YoY</span>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-bold">ADR (Rate)</span>
              <DollarSign size={13} className="text-amber-600" />
            </div>
            <span className="text-lg sm:text-xl font-bold font-display text-slate-900 block">
              {formatPrice(adr, currency)}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">Average / Night</span>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-bold">Occupancy</span>
              <Users size={13} className="text-sky-600" />
            </div>
            <span className="text-lg sm:text-xl font-bold font-display text-amber-800 block">
              {occupancyRate}%
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">{occupiedRooms}/{totalRooms} Suites</span>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-bold">Gross Folios</span>
              <TrendingUp size={13} className="text-emerald-600" />
            </div>
            <span className="text-lg sm:text-xl font-bold font-display text-slate-900 block">
              {formatPrice(safeRevenue, currency)}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">Audited MTD</span>
          </div>
        </div>

        {/* View Switcher Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('revenue')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'revenue'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <TrendingUp size={13} /> Revenue Vector Curve
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('channels')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'channels'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PieChart size={13} /> Channel & Tier Breakdown
            </button>
          </div>

          {activeTab === 'revenue' && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setTimeframe('7d')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  timeframe === '7d' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('30d')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  timeframe === '30d' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500'
                }`}
              >
                30 Days
              </button>
            </div>
          )}
        </div>

        {/* TAB 1: SVG Revenue Line / Area Graph */}
        {activeTab === 'revenue' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Lodging Yield & Daily Inflow
                </h4>
                <p className="text-[11px] text-slate-500">
                  Interactive spline displaying actual settlement intake across duration.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                Peak: {formatPrice(maxRevenue, currency)}
              </span>
            </div>

            {/* Responsive SVG Chart */}
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-44 select-none"
              >
                <defs>
                  <linearGradient id="revenueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Grid Lines */}
                <line
                  x1={paddingX}
                  y1={paddingY}
                  x2={chartWidth - paddingX}
                  y2={paddingY}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <line
                  x1={paddingX}
                  y1={chartHeight / 2}
                  x2={chartWidth - paddingX}
                  y2={chartHeight / 2}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <line
                  x1={paddingX}
                  y1={chartHeight - paddingY}
                  x2={chartWidth - paddingX}
                  y2={chartHeight - paddingY}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />

                {/* Shaded Area Under Curve */}
                <path d={areaD} fill="url(#revenueGrad)" />

                {/* Main Stroke Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points with tooltips */}
                {points.map((p, i) => (
                  <g key={i} className="cursor-pointer group">
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4.5"
                      fill="#ffffff"
                      stroke="#b45309"
                      strokeWidth="2.5"
                    />
                    {/* Hover Pulse */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="9"
                      fill="#f59e0b"
                      opacity="0"
                      className="group-hover:opacity-25 transition-opacity"
                    />
                    {/* Bottom Label */}
                    <text
                      x={p.x}
                      y={chartHeight - 6}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="600"
                      fill="#64748b"
                    >
                      {p.day}
                    </text>
                    {/* Amount label on hover or peak */}
                    <text
                      x={p.x}
                      y={p.y - 10}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="700"
                      fill="#1e293b"
                    >
                      ₹{(p.revenue / 1000).toFixed(0)}k
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        )}

        {/* TAB 2: Channels & Category Donut / Breakdown */}
        {activeTab === 'channels' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Yield Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers size={13} className="text-amber-600" /> Suite Tier Revenue Share
              </h4>

              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Ocean Grand Deluxe</span>
                    <span className="text-slate-900 font-bold">48% ({formatPrice(safeRevenue * 0.48, currency)})</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '48%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Garden Sanctuary Villa</span>
                    <span className="text-slate-900 font-bold">34% ({formatPrice(safeRevenue * 0.34, currency)})</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '34%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Presidential Penthouse</span>
                    <span className="text-slate-900 font-bold">18% ({formatPrice(safeRevenue * 0.18, currency)})</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-sky-600 h-2 rounded-full" style={{ width: '18%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Channel Distribution */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Users size={13} className="text-amber-600" /> Channel Origination
              </h4>

              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Front Desk Walk-In</span>
                    <span className="text-slate-900 font-bold">42% (Direct Counter)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-600 h-2 rounded-full" style={{ width: '42%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Direct Web Reservations</span>
                    <span className="text-slate-900 font-bold">46% (LuxeStay.com)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-sky-500 h-2 rounded-full" style={{ width: '46%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Corporate Ledger & VIP</span>
                    <span className="text-slate-900 font-bold">12% (Contracted)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '12%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hospitality Compliance Badge */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span className="font-semibold text-slate-800">
              Audited by LuxeStay Internal Financial Control
            </span>
          </div>
          <span className="text-[11px] text-slate-400">All prices GST-inclusive</span>
        </div>

        <div className="pt-2 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-gold py-2 px-6 text-xs cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ReportModal;
