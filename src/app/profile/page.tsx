'use client';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserBookings } from '@/lib/features/bookingSlice';
import { fetchUserServices, createService, ServiceRequest } from '@/lib/features/serviceSlice';
import { RootState, AppDispatch } from '@/lib/store';
import {
  Coffee,
  Home,
  Zap,
  ShieldAlert,
  AlertCircle,
  Clock,
  User,
  Plus,
  Bookmark,
  BellRing,
  CheckCircle2,
  Calendar,
  BedDouble,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import PortalShell from '@/components/PortalShell';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';

export default function ProfileConciergePage() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.user);
  const bookings = useSelector((state: RootState) => state.bookings.items);
  const services = useSelector((state: RootState) => state.services.items);

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceName, setServiceName] = useState('In-Suite Fine Dining');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serviceOptions = [
    { name: 'In-Suite Fine Dining', icon: Coffee, desc: 'Chef-crafted breakfast, coastal tasting menus, private dining.' },
    { name: 'Housekeeping & Turn-Down', icon: Home, desc: 'Fresh Egyptian cotton linens, aromatherapy, turndown service.' },
    { name: 'Laundry & Valet Service', icon: Zap, desc: 'Express dry cleaning, delicate garment pressing, shoeshine.' },
    { name: 'Private Concierge & Chauffeur', icon: Sparkles, desc: 'Airport luxury transfer, private yacht charter, event booking.' },
  ];

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserBookings(user.id));
      dispatch(fetchUserServices(user.id));
    }
  }, [user, dispatch]);

  const activeBooking = bookings.find((b) => b.status === 'checked_in' || b.status === 'confirmed');

  const handleServiceRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName || !description) {
      setError('Please provide service notes or requests.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      await dispatch(
        createService({
          guestId: user!.id,
          roomId: activeBooking?.roomId ? String(activeBooking.roomId) : '101',
          serviceName,
          description,
          status: 'pending',
        })
      );
      setSuccess('Your request has been dispatched to the guest butler team.');
      setDescription('');
      setShowServiceModal(false);
      setTimeout(() => setSuccess(''), 4000);
    } catch {
      setError('Failed to dispatch request. Please contact front desk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navItems = [
    {
      id: 'stays',
      label: 'My Reservations',
      icon: Calendar,
      onClick: () => (window.location.href = '/dashboard'),
    },
    {
      id: 'concierge',
      label: 'Room Service & Orders',
      icon: BellRing,
      isActive: true,
    },
  ];

  return (
    <PortalShell
      requiredRole="guest"
      title="Guest Concierge & Residence Profile"
      subtitle="Request personalized in-suite amenities, butler service, and private dining."
      navItems={navItems}
      activeNavId="concierge"
      actions={
        <button
          type="button"
          onClick={() => setShowServiceModal(true)}
          className="btn-gold py-2.5 px-5 text-xs inline-flex items-center gap-2 cursor-pointer"
        >
          <Plus size={15} /> New Service Request
        </button>
      }
    >
      {/* Success Banner */}
      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Guest Credentials & Active Suite */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Guest Identity
            </span>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-bold font-display text-2xl flex items-center justify-center shadow-md shadow-amber-500/20">
                {(user?.name || user?.username || 'G')[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900 leading-tight">
                  {user?.name || user?.username}
                </h3>
                <p className="text-xs font-medium text-slate-500">{user?.email || 'Registered Guest'}</p>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  Presidential Honors Member
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Active Residence
            </span>
            {activeBooking ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-xl font-bold text-slate-900">
                    Room {String(activeBooking.roomNumber || activeBooking.roomId).replace(/^#/, '')}
                  </h4>
                  <StatusBadge status={activeBooking.status} />
                </div>
                <p className="text-xs text-slate-500">
                  Stay: {activeBooking.checkInDate} → {activeBooking.checkOutDate}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No active in-house stay checked in at this moment. You can still order services for your upcoming reservation.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Service Catalog & Requests History */}
        <div className="lg:col-span-8 space-y-8">
          {/* Quick Request Chips */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 mb-4">
              Available In-Suite Services
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {serviceOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <div
                    key={opt.name}
                    onClick={() => {
                      setServiceName(opt.name);
                      setShowServiceModal(true);
                    }}
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{opt.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Requests History */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900">
                Your Recent Requests
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {services.length} Total Dispatches
              </span>
            </div>

            {services.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-sm">
                {services.map((item: ServiceRequest) => (
                  <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-slate-900">{item.serviceName}</span>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="text-xs text-slate-600">{item.description}</p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[11px] text-slate-400 block">Room {String(item.roomId || 'General').replace(/^#/, '')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
                No active service requests. Click any category above to request an in-suite amenity.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ────────────────── SERVICE REQUEST MODAL ────────────────── */}
      <Modal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        title="Dispatch Butler / Concierge"
        subtitle="Our staff will attend to your suite within 15 minutes."
      >
        <form onSubmit={handleServiceRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Service Category
            </label>
            <select
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 text-slate-900 bg-slate-50"
            >
              {serviceOptions.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Specific Instructions or Time Preference
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="e.g. Please bring two fresh pool towels and ice bucket at 7:00 PM."
              className="w-full px-3 py-2 text-sm font-medium rounded-xl border border-slate-300 text-slate-900 bg-slate-50 outline-none focus:border-amber-600"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowServiceModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold py-2 px-5 text-xs inline-flex items-center gap-2"
            >
              {isSubmitting ? 'Dispatching...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </PortalShell>
  );
}
