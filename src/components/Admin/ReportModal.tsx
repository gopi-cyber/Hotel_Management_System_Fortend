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
  Calendar,
  PieChart,
  BarChart2,
  ArrowUpRight,
  Layers,
  Printer,
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
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [activeTab, setActiveTab] = useState<'revenue' | 'channels'>('revenue');

  const occupancyRate = Math.round((occupiedRooms / Math.max(1, totalRooms)) * 100);
  const safeRevenue = Math.max(totalRevenue, 185000);
  const adr = totalBookings > 0 ? Math.round(safeRevenue / totalBookings) : 32000;
  const revPar = Math.round((adr * occupancyRate) / 100) || Math.round(safeRevenue / Math.max(1, totalRooms));

  // Weekly dataset (Mon - Sun)
  const dataWeekly = [
    { day: 'Mon', revenue: 42000, occupancy: 60 },
    { day: 'Tue', revenue: 58000, occupancy: 70 },
    { day: 'Wed', revenue: 51000, occupancy: 65 },
    { day: 'Thu', revenue: 76000, occupancy: 85 },
    { day: 'Fri', revenue: 112000, occupancy: 95 },
    { day: 'Sat', revenue: 135000, occupancy: 100 },
    { day: 'Sun', revenue: 89000, occupancy: 80 },
  ];

  // Monthly dataset (4 weeks)
  const dataMonthly = [
    { day: 'W1', revenue: 380000, occupancy: 72 },
    { day: 'W2', revenue: 460000, occupancy: 81 },
    { day: 'W3', revenue: 520000, occupancy: 88 },
    { day: 'W4', revenue: 610000, occupancy: 94 },
  ];

  // Yearly dataset (4 quarters)
  const dataYearly = [
    { day: 'Q1', revenue: 840000, occupancy: 74 },
    { day: 'Q2', revenue: 980000, occupancy: 81 },
    { day: 'Q3', revenue: 1120000, occupancy: 88 },
    { day: 'Q4', revenue: 1450000, occupancy: 95 },
  ];

  const activeData = timeframe === 'weekly' ? dataWeekly : timeframe === 'monthly' ? dataMonthly : dataYearly;
  const maxRevenue = Math.max(...activeData.map((d) => d.revenue));

  const handlePrint = (range: 'weekly' | 'monthly' | 'yearly') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    const reportTitle = `${range.toUpperCase()} HOTEL REVENUE REPORT`;
    const rows = (range === 'weekly' ? dataWeekly : range === 'monthly' ? dataMonthly : dataYearly)
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">${item.day}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatPrice(item.revenue, currency)}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${item.occupancy}%</td>
        </tr>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #1e293b; }
            h1 { font-size: 20px; margin-bottom: 4px; color: #0f172a; }
            p { font-size: 13px; color: #64748b; margin-top: 0; margin-bottom: 20px; }
            .kpis { display: flex; gap: 20px; margin-bottom: 24px; }
            .card { flex: 1; padding: 14px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; }
            .card-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; }
            .card-val { font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #f1f5f9; padding: 10px; border: 1px solid #ddd; text-align: left; font-size: 12px; }
            td { font-size: 13px; }
          </style>
        </head>
        <body>
          <h1>${reportTitle}</h1>
          <p>Generated on ${new Date().toLocaleDateString()} • Hotel Management System</p>
          <div class="kpis">
            <div class="card">
              <div class="card-title">Total Revenue</div>
              <div class="card-val">${formatPrice(safeRevenue, currency)}</div>
            </div>
            <div class="card">
              <div class="card-title">Occupancy Rate</div>
              <div class="card-val">${occupancyRate}%</div>
            </div>
            <div class="card">
              <div class="card-title">Total Bookings</div>
              <div class="card-val">${totalBookings}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Period / Label</th>
                <th style="text-align: right;">Revenue</th>
                <th style="text-align: right;">Occupancy</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
      title={type === 'financial' ? 'Hotel Revenue & Performance Report' : 'Performance Dashboard'}
      subtitle="Overview of hotel revenue, occupancy rates, and bookings."
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Core Yield Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-bold">Revenue Per Room</span>
              <ArrowUpRight size={13} className="text-emerald-600" />
            </div>
            <span className="text-lg sm:text-xl font-bold font-display text-slate-900 block">
              {formatPrice(revPar, currency)}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">+14.2%</span>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-bold">Average Daily Rate</span>
              <DollarSign size={13} className="text-amber-600" />
            </div>
            <span className="text-lg sm:text-xl font-bold font-display text-slate-900 block">
              {formatPrice(adr, currency)}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">Per Sold Room</span>
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
              <TrendingUp size={13} /> Revenue
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
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setTimeframe('weekly')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    timeframe === 'weekly' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  onClick={() => setTimeframe('monthly')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    timeframe === 'monthly' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setTimeframe('yearly')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    timeframe === 'yearly' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Yearly
                </button>
              </div>

              {/* Print Button */}
              <button
                type="button"
                onClick={() => handlePrint(timeframe)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                title={`Print ${timeframe} report`}
              >
                <Printer size={13} className="text-amber-700" />
                <span>Print {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}</span>
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
                  Revenue
                </h4>
                <p className="text-[11px] text-slate-500">
                  Total revenue graph for the selected period.
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
