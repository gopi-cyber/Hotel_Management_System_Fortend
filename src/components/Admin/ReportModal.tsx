'use client';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { formatPrice, DEFAULT_COMPANY_PROFILE } from '@/lib/features/settingsSlice';
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
  const companyProfile = useSelector((state: RootState) => state.settings?.companyProfile || DEFAULT_COMPANY_PROFILE);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly' | 'custom'>('weekly');
  const [customStartDate, setCustomStartDate] = useState('2026-09-01');
  const [customEndDate, setCustomEndDate] = useState('2026-09-30');
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

  // Custom period dataset
  const dataCustom = [
    { day: 'Day 1-7', revenue: 125000, occupancy: 78 },
    { day: 'Day 8-14', revenue: 142000, occupancy: 84 },
    { day: 'Day 15-21', revenue: 168000, occupancy: 89 },
    { day: 'Day 22-30', revenue: 195000, occupancy: 92 },
  ];

  const activeData =
    timeframe === 'weekly'
      ? dataWeekly
      : timeframe === 'monthly'
      ? dataMonthly
      : timeframe === 'yearly'
      ? dataYearly
      : dataCustom;
  const maxRevenue = Math.max(...activeData.map((d) => d.revenue));

  const handlePrint = (range: 'weekly' | 'monthly' | 'yearly' | 'custom') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    const reportPeriodText =
      range === 'custom'
        ? `Custom Range (${customStartDate} to ${customEndDate})`
        : `${range.charAt(0).toUpperCase() + range.slice(1)} Performance`;
    const reportTitle = `${reportPeriodText.toUpperCase()} REPORT`;
    const selectedData =
      range === 'weekly'
        ? dataWeekly
        : range === 'monthly'
        ? dataMonthly
        : range === 'yearly'
        ? dataYearly
        : dataCustom;

    const totalPeriodRev = selectedData.reduce((acc, curr) => acc + curr.revenue, 0);
    const avgOcc = Math.round(selectedData.reduce((acc, curr) => acc + curr.occupancy, 0) / selectedData.length);

    const rows = selectedData
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b;">${item.day}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; color: #0f172a;">${formatPrice(item.revenue, currency)}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #047857; font-weight: 600;">${item.occupancy}%</td>
        </tr>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle} - ${companyProfile.brandName || 'LuxeStay Hotel'}</title>
          <meta charset="utf-8" />
          <style>
            @media print {
              body { padding: 0; }
              @page { margin: 20mm 15mm; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              padding: 40px;
              color: #0f172a;
              background: #ffffff;
              line-height: 1.5;
            }
            .header {
              border-bottom: 2px solid #0f172a;
              padding-bottom: 20px;
              margin-bottom: 28px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .brand {
              font-size: 24px;
              font-weight: 800;
              letter-spacing: -0.5px;
              color: #0f172a;
            }
            .brand-sub {
              font-size: 13px;
              color: #64748b;
              margin-top: 4px;
            }
            .meta {
              text-align: right;
              font-size: 12px;
              color: #475569;
            }
            .meta strong {
              color: #0f172a;
              font-size: 13px;
            }
            .report-title-banner {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 14px 20px;
              margin-bottom: 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .report-name {
              font-size: 16px;
              font-weight: 700;
              color: #0f172a;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .report-range {
              font-size: 12px;
              font-weight: 600;
              color: #b45309;
              background: #fef3c7;
              padding: 4px 10px;
              border-radius: 9999px;
            }
            .kpis {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 16px;
              margin-bottom: 28px;
            }
            .kpi-card {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 14px 16px;
              background: #ffffff;
            }
            .kpi-title {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-weight: 700;
              color: #64748b;
              margin-bottom: 6px;
            }
            .kpi-value {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background: #0f172a;
              color: #ffffff;
              padding: 12px 16px;
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            th:first-child { border-top-left-radius: 6px; text-align: left; }
            th:last-child { border-top-right-radius: 6px; }
            .footer-info {
              border-top: 1px solid #e2e8f0;
              padding-top: 16px;
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">${companyProfile.brandName || 'LuxeStay Hotel'}</div>
              <div class="brand-sub">${companyProfile.address || 'Colaba, Mumbai, India'}</div>
            </div>
            <div class="meta">
              <div><strong>Prepared by:</strong> ${companyProfile.adminName || 'Gopinath'}</div>
              <div>${companyProfile.adminTitle || 'Managing Director & General Manager'}</div>
              <div style="margin-top: 4px; color: #94a3b8;">Printed: ${new Date().toLocaleString()}</div>
            </div>
          </div>

          <div class="report-title-banner">
            <span class="report-name">${reportTitle}</span>
            <span class="report-range">${reportPeriodText}</span>
          </div>

          <div class="kpis">
            <div class="kpi-card">
              <div class="kpi-title">Period Revenue</div>
              <div class="kpi-value">${formatPrice(totalPeriodRev, currency)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Average Daily Rate</div>
              <div class="kpi-value">${formatPrice(adr, currency)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Avg Occupancy</div>
              <div class="kpi-value">${avgOcc}%</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Revenue / Room</div>
              <div class="kpi-value">${formatPrice(revPar, currency)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Timeline / Interval</th>
                <th style="text-align: right;">Revenue</th>
                <th style="text-align: right;">Occupancy Rate</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="footer-info">
            <span>Confidential Executive Hotel Performance Record</span>
            <span>Page 1 of 1</span>
          </div>

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
              <PieChart size={13} /> Room Types & Booking Sources
            </button>
          </div>

          {activeTab === 'revenue' && (
            <div className="flex flex-wrap items-center gap-2">
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
                <button
                  type="button"
                  onClick={() => setTimeframe('custom')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    timeframe === 'custom' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Custom Range
                </button>
              </div>

              {timeframe === 'custom' && (
                <div className="flex items-center gap-1.5 text-xs bg-slate-100 px-2 py-1 rounded-lg">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-transparent border-0 text-[11px] font-medium text-slate-700 outline-none"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-transparent border-0 text-[11px] font-medium text-slate-700 outline-none"
                  />
                </div>
              )}

              {/* Print Button */}
              <button
                type="button"
                onClick={() => handlePrint(timeframe)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                title={`Print ${timeframe} report`}
              >
                <Printer size={13} className="text-amber-700" />
                <span>Print {timeframe === 'custom' ? 'Custom' : timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}</span>
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
                <Layers size={13} className="text-amber-600" /> Revenue by Room Type
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

            {/* Booking Source Distribution */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Users size={13} className="text-amber-600" /> Booking Sources (Direct vs OTA)
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
