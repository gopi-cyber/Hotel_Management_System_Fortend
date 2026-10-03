'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store';
import HotelBrand from '@/components/ui/HotelBrand';
import UserAvatar from '@/components/ui/UserAvatar';
import { logout, restoreSession, User as SessionUser } from '@/lib/features/userSlice';

import AdminProfileModal from '@/components/Admin/AdminProfileModal';
import StaffProfileModal from '@/components/Staff/StaffProfileModal';
import GuestProfileModal from '@/components/Guest/GuestProfileModal';
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
  const currency = useSelector((state: RootState) => state.settings?.currency || 'INR');
  const nightAudit = useSelector((state: RootState) => state.settings?.nightAudit || false);
  const companyProfile = useSelector((state: RootState) => state.settings?.companyProfile);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const userAvatar =
    user?.role === 'admin'
      ? (companyProfile?.adminAvatarUrl || user?.avatarUrl || '')
      : (user?.avatarUrl || '');

  const hasAvatar = Boolean(userAvatar && userAvatar.trim().length > 0);

  const userDisplayName =
    user?.role === 'admin'
      ? (companyProfile?.adminName || user?.name || user?.username)
      : (user?.name || user?.username);

  const userInitial = (userDisplayName || user?.username || 'U')[0]?.toUpperCase() || 'U';

  const profileModalTitle =
    user?.role === 'admin'
      ? 'Admin & Corporate Profile'
      : (user?.role === 'receptionist' || user?.role === 'staff')
      ? 'Staff Hospitality Profile'
      : 'Guest Stay & Loyalty Profile';

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
      { id: 'staff', label: 'Staff', href: '/admin', icon: Users },
      { id: 'reservations', label: 'Reservations', href: '/admin', icon: CalendarCheck },
      { id: 'users', label: 'Access & Roles', href: '/admin', icon: ShieldCheck },
      { id: 'reports', label: 'Reports', href: '/admin', icon: BarChart3 },
    ],
    receptionist: [
      { id: 'checkin', label: 'Arrivals & Check-in', href: '/receptionist', icon: UserCheck },
      { id: 'rooms', label: 'Room', href: '/receptionist', icon: BedDouble },
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
    admin: { name: 'Admin', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
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
          <HotelBrand href="/" inverted={true} textClassName="font-display text-xl font-bold tracking-tight text-white" />

          {/* Nav Items */}
          <nav className="space-y-1.5 mt-8" aria-label="Portal Navigation">
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
        <div className="border-t border-slate-800/80 pt-4 mt-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-3 truncate text-left transition-opacity cursor-pointer hover:opacity-85"
              title={`Click to view/edit ${profileModalTitle}`}
            >
              <UserAvatar name={userDisplayName} avatarUrl={hasAvatar ? userAvatar : ''} size="sm" />
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate hover:text-amber-400 transition-colors">
                  {userDisplayName}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.role === 'receptionist' || user?.role === 'staff'
                    ? 'Front Desk & Guest Services'
                    : 'Profile'}
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ────────────────── MOBILE / TABLET TOP APP BAR ────────────────── */}
      <header className="lg:hidden bg-[#0b0f17] text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40 print:hidden">
        <HotelBrand href="/" inverted={true} textClassName="font-display text-lg font-bold tracking-tight text-white" showTagline={false} />

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-[#0b0f17] text-white p-6 rounded-t-3xl border-t border-slate-800 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <HotelBrand href="/" inverted={true} textClassName="font-display text-base font-bold text-white" showTagline={false} />
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
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 text-left cursor-pointer hover:opacity-85"
                title={`Click to view/edit ${profileModalTitle}`}
              >
                <UserAvatar name={userDisplayName} avatarUrl={hasAvatar ? userAvatar : ''} size="md" />
                <div>
                  <p className="text-sm font-bold text-white">
                    {userDisplayName}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.role === 'receptionist' || user?.role === 'staff'
                      ? 'Front Desk & Guest Services'
                      : `${user?.role} • Profile`}
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
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
            {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
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
      {/* ────────────────── ROLE-SPECIFIC PROFILE MODALS ────────────────── */}
      {user.role === 'admin' && (
        <AdminProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      )}
      {(user.role === 'receptionist' || user.role === 'staff') && (
        <StaffProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      )}
      {user.role === 'guest' && (
        <GuestProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      )}
    </div>
  );
}

export default PortalShell;
