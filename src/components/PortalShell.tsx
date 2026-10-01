'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store';
import { logout, restoreSession, User as SessionUser } from '@/lib/features/userSlice';
import {
  setCurrency,
  toggleNightAudit,
  CurrencyCode,
  CURRENCY_MAP,
} from '@/lib/features/settingsSlice';
import {
  Hotel,
  LayoutDashboard,
  CalendarCheck,
  Users,
  BarChart3,
  CreditCard,
  LogOut,
  Menu,
  X,
  Compass,
  BedDouble,
  UserCheck,
  Bell,
  Settings,
  ShieldCheck,
  Moon,
  Sun,
  Globe,
} from 'lucide-react';

export interface PortalNavItem {
  id: string;
  label: string;
  href?: string;
  icon: React.ElementType;
  badge?: string | number;
  onClick?: () => void;
  isActive?: boolean;
}

interface PortalShellProps {
  requiredRole: 'admin' | 'receptionist' | 'guest';
  title: string;
  subtitle?: string;
  navItems?: PortalNavItem[];
  activeNavId?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PortalShell({
  requiredRole,
  title,
  subtitle,
  navItems = [],
  activeNavId,
  actions,
  children,
}: PortalShellProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.user.user);
  const currency = useSelector((state: RootState) => state.settings.currency);
  const nightAudit = useSelector((state: RootState) => state.settings.nightAudit);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user) {
      const saved = typeof window !== 'undefined' ? sessionStorage.getItem('vortex_user') : null;
      if (saved) {
        try {
          dispatch(restoreSession(JSON.parse(saved) as SessionUser));
          return;
        } catch {
          sessionStorage.removeItem('vortex_user');
        }
      }
      router.replace('/login');
      return;
    }

    const currentRole = user.role?.toLowerCase();
    if (requiredRole === 'admin' && currentRole !== 'admin') {
      router.replace(currentRole === 'guest' ? '/dashboard' : '/receptionist');
    } else if (requiredRole === 'receptionist' && currentRole !== 'receptionist' && currentRole !== 'staff') {
      router.replace(currentRole === 'admin' ? '/admin' : '/dashboard');
    } else if (requiredRole === 'guest' && currentRole !== 'guest') {
      router.replace(currentRole === 'admin' ? '/admin' : '/receptionist');
    }
  }, [user, requiredRole, router, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/login');
  };

  // Default nav items by role if not explicitly passed
  const defaultNavs: Record<string, PortalNavItem[]> = {
    admin: [
      { id: 'inventory', label: 'Suites & Rooms', href: '/admin', icon: BedDouble },
      { id: 'staff', label: 'Staff Roster', href: '/admin', icon: Users },
      { id: 'reservations', label: 'Reservations', href: '/admin', icon: CalendarCheck },
      { id: 'users', label: 'Access & Roles', href: '/admin', icon: ShieldCheck },
      { id: 'reports', label: 'Executive Analytics', href: '/admin', icon: BarChart3 },
    ],
    receptionist: [
      { id: 'checkin', label: 'Arrivals & Check-in', href: '/receptionist', icon: UserCheck },
      { id: 'rooms', label: 'Live Room Rack', href: '/receptionist', icon: BedDouble },
      { id: 'billing', label: 'Guest Folios', href: '/receptionist', icon: CreditCard },
    ],
    guest: [
      { id: 'stays', label: 'My Bookings', href: '/dashboard', icon: CalendarCheck },
      { id: 'discover', label: 'Explore Suites', href: '/dashboard', icon: Compass },
      { id: 'concierge', label: 'Room Service & Valet', href: '/profile', icon: Bell },
    ],
  };

  const currentNavs = navItems.length > 0 ? navItems : (defaultNavs[requiredRole] || []);

  if (!mounted || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-600/20 border-t-amber-600 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Securing your session...</p>
        </div>
      </div>
    );
  }

  const roleLabels = {
    admin: { name: 'Executive Administration', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    receptionist: { name: 'Front Desk Terminal', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    guest: { name: 'Guest Residence', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  };

  return (
    <div
      className={`min-h-screen flex flex-col lg:flex-row antialiased transition-colors duration-200 ${
        nightAudit ? 'bg-slate-950 text-slate-100 dark' : 'bg-[#faf8f5] text-slate-900'
      }`}
    >
      {/* ────────────────── DESKTOP SIDEBAR ────────────────── */}
      <aside className="hidden lg:flex w-72 flex-col justify-between bg-[#0b0f17] text-white border-r border-slate-800/80 p-6 shrink-0 h-screen sticky top-0 print:hidden">
        <div>
          {/* Brand Crest */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Hotel className="text-slate-950" size={22} />
            </div>
            <div>
              <span className="font-display text-2xl font-bold tracking-tight text-white block leading-none">
                LuxeStay
              </span>
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold mt-1 block">
                Hotels & Residences
              </span>
            </div>
          </Link>

          {/* Role Pill */}
          <div className="mt-6 mb-8">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${roleLabels[requiredRole].color}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {roleLabels[requiredRole].name}
            </span>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5" aria-label="Portal Navigation">
            {currentNavs.map((item) => {
              const Icon = item.icon;
              const isSelected = activeNavId ? activeNavId === item.id : item.isActive;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => item.onClick && item.onClick()}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={19} className={isSelected ? 'text-slate-950' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-slate-950 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card, Settings & Logout */}
        <div className="border-t border-slate-800/80 pt-4 mt-6 space-y-3">
          {/* Night Audit & Currency Quick Toggles */}
          <div className="space-y-2 pb-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Audit Shift</span>
              <button
                type="button"
                onClick={() => dispatch(toggleNightAudit())}
                className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  nightAudit
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {nightAudit ? <Sun size={12} className="text-amber-400" /> : <Moon size={12} className="text-slate-400" />}
                <span>{nightAudit ? 'Day Shift' : 'Night Audit'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Currency</span>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-800 rounded-lg border border-slate-700 text-xs">
                <Globe size={11} className="text-amber-400 shrink-0" />
                <select
                  value={currency}
                  onChange={(e) => dispatch(setCurrency(e.target.value as CurrencyCode))}
                  className="bg-transparent font-bold text-xs text-white cursor-pointer focus:outline-none"
                  aria-label="Currency"
                >
                  {Object.values(CURRENCY_MAP).map((c) => (
                    <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-3 truncate">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-amber-400 text-sm border border-slate-700">
                {(user.name || user.username || 'U')[0].toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-white truncate">{user.name || user.username}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* ────────────────── MOBILE / TABLET TOP APP BAR ────────────────── */}
      <header className="lg:hidden bg-[#0b0f17] text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40 print:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <Hotel className="text-slate-950" size={18} />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-white">LuxeStay</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Quick Currency Selector */}
          <div className="flex items-center gap-1 px-2 py-1 bg-slate-800/90 rounded-lg border border-slate-700 text-xs text-slate-200">
            <Globe size={11} className="text-amber-400 shrink-0" />
            <select
              value={currency}
              onChange={(e) => dispatch(setCurrency(e.target.value as CurrencyCode))}
              className="bg-transparent font-bold text-[11px] text-white cursor-pointer focus:outline-none"
              aria-label="Currency"
            >
              {Object.values(CURRENCY_MAP).map((c) => (
                <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                  {c.code}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Night Audit Toggle */}
          <button
            type="button"
            onClick={() => dispatch(toggleNightAudit())}
            title={nightAudit ? 'Day Shift Mode' : 'Night Audit Mode'}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              nightAudit
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            aria-label="Toggle Night Audit"
          >
            {nightAudit ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-[#0b0f17] text-white p-6 rounded-t-3xl border-t border-slate-800 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                {roleLabels[requiredRole].name}
              </span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-1">
              {currentNavs.map((item) => {
                const Icon = item.icon;
                const isSelected = activeNavId ? activeNavId === item.id : item.isActive;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (item.onClick) item.onClick();
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl text-sm font-semibold transition-all ${
                      isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">{user.name || user.username}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold inline-flex items-center gap-2"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── MAIN CONTENT AREA ────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-10">
        {/* Top Header */}
        <div
          className={`border-b px-4 sm:px-8 py-5 sm:py-6 print:hidden transition-colors ${
            nightAudit ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1
                className={`text-2xl sm:text-3xl font-bold font-display tracking-tight leading-tight ${
                  nightAudit ? 'text-white' : 'text-slate-900'
                }`}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className={`mt-1 text-xs sm:text-sm font-medium ${
                    nightAudit ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {subtitle}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Currency Selector Pill */}
              <div
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold ${
                  nightAudit
                    ? 'bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <Globe size={13} className="text-amber-500 shrink-0" />
                <select
                  value={currency}
                  onChange={(e) => dispatch(setCurrency(e.target.value as CurrencyCode))}
                  className={`bg-transparent font-bold text-xs cursor-pointer focus:outline-none ${
                    nightAudit ? 'text-white' : 'text-slate-800'
                  }`}
                  aria-label="Currency"
                >
                  {Object.values(CURRENCY_MAP).map((c) => (
                    <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Night Audit Toggle */}
              <button
                type="button"
                onClick={() => dispatch(toggleNightAudit())}
                title={nightAudit ? 'Switch to Day Shift Mode' : 'Switch to Night Audit Mode'}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  nightAudit
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {nightAudit ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-slate-500" />}
                <span>{nightAudit ? 'Day Shift' : 'Night Audit'}</span>
              </button>

              {actions}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-none">
          {children}
        </div>
      </main>

      {/* ────────────────── MOBILE BOTTOM APP BAR ────────────────── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-[#0b0f17]/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 z-30 flex items-center justify-around safe-bottom print:hidden">
        {currentNavs.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isSelected = activeNavId ? activeNavId === item.id : item.isActive;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => item.onClick && item.onClick()}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
                isSelected ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={17} />
              <span className="mt-0.5 truncate max-w-[56px]">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={handleLogout}
          title="Sign out"
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-semibold text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
        >
          <LogOut size={17} />
          <span className="mt-0.5 font-bold">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default PortalShell;
