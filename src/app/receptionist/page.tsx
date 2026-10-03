'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRooms, Room, updateRoom, updateHousekeepingStatus, HousekeepingStatus } from '@/lib/features/roomSlice';
import { fetchBookings, updateBooking, addBooking, Booking } from '@/lib/features/bookingSlice';
import { fetchServices, updateService, updateLocalServiceStatus } from '@/lib/features/serviceSlice';
import { RootState, AppDispatch } from '@/lib/store';
import {
  CheckCircle,
  CreditCard,
  Search,
  Calendar,
  Users,
  BedDouble,
  Clock,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  DollarSign,
  Filter,
  BellRing,
  Wrench,
  Sparkles,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Shield,
  PlusCircle,
  AlertTriangle,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import InvoiceModal from '@/components/ui/InvoiceModal';
import { formatPrice } from '@/lib/features/settingsSlice';
import WalkInModal from '@/components/Receptionist/WalkInModal';
import IncidentalChargeModal from '@/components/Staff/IncidentalChargeModal';
import KYCVerificationModal from '@/components/Staff/KYCVerificationModal';

export default function ReceptionistPage() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.user);
  const bookings = useSelector((state: RootState) => state.bookings.items);
  const rooms = useSelector((state: RootState) => state.rooms.items);
  const services = useSelector((state: RootState) => state.services.items);
  const currency = useSelector((state: RootState) => state.settings?.currency || 'INR');

  const [activeTab, setActiveTab] = useState<'checkin' | 'rooms' | 'billing' | 'requests'>('checkin');
  const [searchQuery, setSearchQuery] = useState('');
  const [roomStatusFilter, setRoomStatusFilter] = useState('all');
  const [actionSuccess, setActionSuccess] = useState('');
  const [selectedBookingFolio, setSelectedBookingFolio] = useState<Booking | null>(null);
  const [selectedIncidentalBooking, setSelectedIncidentalBooking] = useState<Booking | null>(null);
  const [selectedKYCBooking, setSelectedKYCBooking] = useState<Booking | null>(null);
  const [housekeepingWarning, setHousekeepingWarning] = useState<{ booking: Booking; room: Room } | null>(null);
  const [walkInRoom, setWalkInRoom] = useState<Room | null>(null);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchRooms());
    dispatch(fetchBookings());
    dispatch(fetchServices());
  }, [dispatch]);

  const handleWalkInBooking = async (data: {
    guestName: string;
    guestPhone: string;
    guestEmail: string;
    idType: string;
    idNumber: string;
    roomId: string;
    roomNumber: string;
    roomType: string;
    nights: number;
    guestsCount: number;
    totalPrice: number;
    paymentMethod: string;
  }) => {
    const checkInDate = new Date().toISOString().split('T')[0];
    const checkOutDate = new Date(Date.now() + 86400000 * data.nights).toISOString().split('T')[0];

    // 1. Add booking in checked_in status
    await dispatch(
      addBooking({
        roomId: data.roomId,
        guestId: `walkin-${Date.now()}`,
        guestName: data.guestName,
        roomNumber: data.roomNumber,
        roomType: data.roomType,
        checkInDate,
        checkOutDate,
        totalPrice: data.totalPrice,
        status: 'checked_in',
        nights: data.nights,
      })
    );

    // 2. Mark the room occupied
    const targetRoom = rooms.find((r) => String(r.id) === String(data.roomId));
    if (targetRoom) {
      await dispatch(updateRoom({ ...targetRoom, status: 'occupied' }));
    }

    setActionSuccess(`Walk-In registered! ${data.guestName} checked into Suite #${data.roomNumber}.`);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleMarkCleaned = async (room: Room) => {
    await dispatch(updateRoom({ ...room, status: 'available' }));
    setActionSuccess(`Suite #${room.roomNumber || room.number || room.id} marked Cleaned & Ready.`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleToggleMaintenance = async (room: Room) => {
    const newStatus = room.status === 'maintenance' ? 'available' : 'maintenance';
    await dispatch(updateRoom({ ...room, status: newStatus }));
    setActionSuccess(
      newStatus === 'maintenance'
        ? `Suite #${room.roomNumber || room.number || room.id} locked for maintenance.`
        : `Suite #${room.roomNumber || room.number || room.id} maintenance cleared & returned to available inventory.`
    );
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleServiceStatus = async (id: string, status: string) => {
    dispatch(updateLocalServiceStatus({ id, status: status as 'pending' | 'in_progress' | 'completed' }));
    try {
      await dispatch(updateService({ id, status }));
    } catch {
      // Local Redux update applied
    }
    setActionSuccess(`Service request marked as ${status.replace('_', ' ')}.`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleConfirm = async (booking: Booking) => {
    await dispatch(updateBooking({ ...booking, status: 'confirmed' }));
    setActionSuccess(`Confirmed booking for ${booking.guestName}.`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleCheckIn = async (booking: Booking, force = false) => {
    const room = rooms.find(
      (r) => String(r.id) === String(booking.roomId) || String(r.roomNumber || r.number) === String(booking.roomNumber)
    );
    if (!force && room && (room.housekeepingStatus === 'dirty' || room.housekeepingStatus === 'cleaning_in_progress')) {
      setHousekeepingWarning({ booking, room });
      return;
    }
    await dispatch(updateBooking({ ...booking, status: 'checked_in' }));
    if (room && room.status !== 'occupied') {
      await dispatch(updateRoom({ ...room, status: 'occupied' }));
    }
    setHousekeepingWarning(null);
    setActionSuccess(`Guest ${booking.guestName} successfully checked in.`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleCheckOut = async (booking: Booking) => {
    await dispatch(updateBooking({ ...booking, status: 'checked_out' }));
    const room = rooms.find((r) => r.id === booking.roomId);
    if (room) {
      await dispatch(updateRoom({ ...room, status: 'available' }));
      dispatch(updateHousekeepingStatus({ roomId: room.id, housekeepingStatus: 'dirty' }));
    }
    setActionSuccess(`Guest ${booking.guestName} checked out. Room flagged as dirty for housekeeping.`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleSetHousekeeping = (roomId: string, status: HousekeepingStatus, housekeeper?: string) => {
    dispatch(updateHousekeepingStatus({ roomId, housekeepingStatus: status, assignedHousekeeper: housekeeper }));
    setActionSuccess(`Housekeeping status updated to ${status.replace(/_/g, ' ')}.`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  // KPIs
  const occupiedCount = useMemo(() => rooms.filter((r) => r.status === 'occupied').length, [rooms]);
  const availableCount = useMemo(() => rooms.filter((r) => r.status === 'available').length, [rooms]);
  const activeBookingsCount = useMemo(
    () => bookings.filter((b) => ['confirmed', 'checked_in'].includes(b.status)).length,
    [bookings]
  );
  const totalRevenue = useMemo(
    () =>
      bookings
        .filter((b) => ['confirmed', 'checked_in', 'checked_out'].includes(b.status))
        .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0),
    [bookings]
  );

  // Filtered arrivals
  const filteredBookings = useMemo(() => {
    return bookings.filter(
      (b) =>
        b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(b.id).includes(searchQuery) ||
        (b.roomNumber && b.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [bookings, searchQuery]);

  // Filtered room rack
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const matchSearch =
        (r.name || r.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.roomNumber && r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = roomStatusFilter === 'all' || r.status.toLowerCase() === roomStatusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [rooms, searchQuery, roomStatusFilter]);

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const search = searchQuery.toLowerCase();
      return (
        (s.serviceName || '').toLowerCase().includes(search) ||
        (s.description || '').toLowerCase().includes(search) ||
        (s.roomId || '').toLowerCase().includes(search) ||
        (s.guestId || '').toLowerCase().includes(search)
      );
    });
  }, [services, searchQuery]);

  const pendingRequestsCount = useMemo(() => {
    return services.filter((s) => s.status === 'pending' || s.status === 'in_progress').length;
  }, [services]);

  const navItems = [
    {
      id: 'checkin',
      label: 'Arrivals & Check-in',
      icon: UserCheck,
      badge: activeBookingsCount,
      isActive: activeTab === 'checkin',
      onClick: () => setActiveTab('checkin'),
    },
    {
      id: 'rooms',
      label: 'Live Room Rack',
      icon: BedDouble,
      badge: `${occupiedCount}/${rooms.length}`,
      isActive: activeTab === 'rooms',
      onClick: () => setActiveTab('rooms'),
    },
    {
      id: 'requests',
      label: 'Guest Requests',
      icon: BellRing,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
      isActive: activeTab === 'requests',
      onClick: () => setActiveTab('requests'),
    },
    {
      id: 'billing',
      label: 'Bills & Payments',
      icon: CreditCard,
      isActive: activeTab === 'billing',
      onClick: () => setActiveTab('billing'),
    },
  ];

  return (
    <PortalShell
      requiredRole="receptionist"
      title="Front Desk Terminal"
      subtitle="Guest arrivals, quick check-in / check-out, room status, and billing."
      navItems={navItems}
      activeNavId={activeTab}
    >
      {/* Action Notification */}
      {actionSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Summary Cards: auto-adapts to small laptops and large screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          label="Available Suites"
          value={availableCount}
          icon={BedDouble}
          change={`${Math.round((availableCount / Math.max(1, rooms.length)) * 100)}% Capacity`}
          changeType="positive"
        />
        <StatCard
          label="Occupied Suites"
          value={occupiedCount}
          icon={Users}
          change={`${Math.round((occupiedCount / Math.max(1, rooms.length)) * 100)}% Full`}
          changeType="neutral"
        />
        <StatCard
          label="Active Guest Records"
          value={activeBookingsCount}
          icon={Calendar}
          change="Today's Roster"
          changeType="positive"
        />
        <StatCard
          label="Total Paid Revenue"
          value={formatPrice(totalRevenue, currency)}
          icon={CreditCard}
          change="YTD Operations"
          changeType="positive"
        />
      </div>

      {/* ────────────────── VIEW 1: ARRIVALS & CHECK-IN QUEUE ────────────────── */}
      {activeTab === 'checkin' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                Guest Arrivals & Operations
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Perform quick check-in, key card assignment, or check-out billing.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search guest or suite..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white"
              />
            </div>
          </div>

          {/* Responsive Table / Card Layout */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-5 font-bold">Booking ID</th>
                    <th className="py-3.5 px-5 font-bold">Guest Name</th>
                    <th className="py-3.5 px-5 font-bold">Assigned Suite</th>
                    <th className="py-3.5 px-5 font-bold">Guest ID / KYC</th>
                    <th className="py-3.5 px-5 font-bold">Dates</th>
                    <th className="py-3.5 px-5 font-bold">Status</th>
                    <th className="py-3.5 px-5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredBookings.map((b) => {
                    const assignedRoom = rooms.find(
                      (r) => String(r.id) === String(b.roomId) || String(r.roomNumber || r.number) === String(b.roomNumber)
                    );
                    const hkStatus = assignedRoom?.housekeepingStatus || 'inspected';
                    return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-900">#{b.id}</td>
                      <td className="py-3.5 px-5 font-semibold text-slate-800">{b.guestName}</td>
                      <td className="py-3.5 px-5 text-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{b.roomNumber ? `Suite ${b.roomNumber}` : `Room #${b.roomId}`}</span>
                          <span
                            title={`Housekeeping: ${hkStatus.replace(/_/g, ' ')}`}
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              hkStatus === 'inspected' || hkStatus === 'clean'
                                ? 'bg-emerald-500'
                                : hkStatus === 'cleaning_in_progress'
                                ? 'bg-sky-500 animate-pulse'
                                : hkStatus === 'dirty'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        {b.kyc?.verified ? (
                          <button
                            type="button"
                            onClick={() => setSelectedKYCBooking(b)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Verified
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedKYCBooking(b)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-all cursor-pointer"
                          >
                            <Shield className="w-3.5 h-3.5 text-amber-600" />
                            Verify ID
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">
                        {b.checkInDate} → {b.checkOutDate}
                      </td>
                      <td className="py-3.5 px-5">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-2">
                        {b.status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => handleCheckIn(b)}
                            className="btn-gold py-1.5 px-3 text-xs"
                          >
                            Check In
                          </button>
                        )}
                        {b.status === 'checked_in' && (
                          <>
                            <button
                              type="button"
                              onClick={() => setSelectedIncidentalBooking(b)}
                              className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold py-1.5 px-2.5 rounded-lg text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="Post incidental charge to room bill"
                            >
                              <PlusCircle className="w-3.5 h-3.5 text-amber-700" />
                              + Charge
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCheckOut(b)}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-colors"
                            >
                              Check Out
                            </button>
                          </>
                        )}
                        {b.status === 'checked_out' && (
                          <span className="text-xs text-slate-400 font-semibold">Completed</span>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout (< 768px) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredBookings.map((b) => (
                <div key={b.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{b.guestName}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between items-center">
                      <span>Suite:</span>
                      <strong className="text-slate-900">{b.roomNumber || `#${b.roomId}`}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Guest KYC:</span>
                      <button
                        type="button"
                        onClick={() => setSelectedKYCBooking(b)}
                        className={`text-xs font-bold inline-flex items-center gap-1 px-2 py-0.5 rounded ${
                          b.kyc?.verified ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                        }`}
                      >
                        {b.kyc?.verified ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        {b.kyc?.verified ? 'Verified' : 'Verify ID'}
                      </button>
                    </div>
                    <div className="flex justify-between">
                      <span>Dates:</span>
                      <span>{b.checkInDate} → {b.checkOutDate}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 pt-1">
                      <span>Total Bill:</span>
                      <span>{formatPrice(Number(b.totalPrice) || 0, currency)}</span>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    {b.status === 'confirmed' && (
                      <button
                        type="button"
                        onClick={() => handleCheckIn(b)}
                        className="btn-gold py-1.5 px-4 text-xs w-full justify-center"
                      >
                        Complete Check In
                      </button>
                    )}
                    {b.status === 'checked_in' && (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          type="button"
                          onClick={() => setSelectedIncidentalBooking(b)}
                          className="flex-1 py-1.5 px-3 bg-amber-100 text-amber-900 font-bold rounded-lg text-xs flex items-center justify-center gap-1"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          + Charge
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCheckOut(b)}
                          className="flex-1 py-1.5 px-3 bg-slate-900 text-white font-bold rounded-lg text-xs"
                        >
                          Check Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── VIEW 2: LIVE ROOM RACK ────────────────── */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                Live Inventory Room Rack
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Color-coded room inventory, instant walk-in check-in, and housekeeping turnaround.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setWalkInRoom(null);
                  setIsWalkInOpen(true);
                }}
                className="btn-gold py-1.5 px-3.5 text-xs font-bold shadow-xs inline-flex items-center gap-1.5 cursor-pointer mr-2"
              >
                <Plus size={14} /> Walk-In Arrival
              </button>

              {['all', 'available', 'occupied', 'cleaning', 'maintenance'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setRoomStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                    roomStatusFilter === st
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Room Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredRooms.map((room) => {
              const isAvailable = room.status === 'available';
              const isOccupied = room.status === 'occupied';
              const isCleaning = room.housekeepingStatus === 'dirty' || room.housekeepingStatus === 'cleaning_in_progress';
              const isMaintenance = room.status === 'maintenance';

              const activeBooking = isOccupied
                ? bookings.find(
                    (b) =>
                      (String(b.roomId) === String(room.id) ||
                        String(b.roomNumber) === String(room.roomNumber || room.number)) &&
                      b.status === 'checked_in'
                  )
                : null;

              return (
                <div
                  key={room.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-all space-y-3.5 shadow-2xs ${
                    isAvailable
                      ? 'bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-400'
                      : isOccupied
                      ? 'bg-amber-50/40 border-amber-200/80 hover:border-amber-400'
                      : isCleaning
                      ? 'bg-sky-50/40 border-sky-200/80 hover:border-sky-400'
                      : 'bg-rose-50/40 border-rose-200/80 hover:border-rose-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-display font-bold text-lg text-slate-900">
                        #{room.roomNumber || room.number || `R-${room.id}`}
                      </span>
                      <StatusBadge status={room.status} />
                    </div>

                    <p className="text-xs font-bold text-slate-800 truncate">{room.name || room.type}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{room.type}</p>

                    {activeBooking && (
                      <div className="mt-2 p-2 bg-amber-100/60 rounded-xl border border-amber-200/80 text-[11px]">
                        <span className="text-[10px] uppercase font-bold text-amber-800 block">Occupant:</span>
                        <strong className="text-slate-900 truncate block">{activeBooking.guestName}</strong>
                        <span className="text-slate-500 text-[10px]">Bill #{activeBooking.id}</span>
                      </div>
                    )}

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-900">{formatPrice(room.price || 0, currency)}</span>
                      <span className="text-slate-500 capitalize">/ night</span>
                    </div>

                    {/* Housekeeping PMS State */}
                    <div className="mt-2 p-1.5 rounded-lg bg-white/80 border border-slate-200/80 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider">Housekeeping</span>
                      <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] capitalize ${
                        (room.housekeepingStatus || 'inspected') === 'inspected'
                          ? 'bg-emerald-100 text-emerald-800'
                          : (room.housekeepingStatus || 'inspected') === 'clean'
                          ? 'bg-emerald-50 text-emerald-700'
                          : room.housekeepingStatus === 'cleaning_in_progress'
                          ? 'bg-sky-100 text-sky-800'
                          : room.housekeepingStatus === 'dirty'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {(room.housekeepingStatus || 'inspected').replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Operational Action Controls */}
                  <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                    {/* Quick Housekeeping Action */}
                    {room.housekeepingStatus === 'dirty' && (
                      <button
                        type="button"
                        onClick={() => handleSetHousekeeping(room.id, 'cleaning_in_progress')}
                        className="w-full py-1 text-[10px] bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg flex items-center justify-center gap-1 font-bold border border-sky-200 transition-colors cursor-pointer"
                      >
                        <Clock size={11} /> Start Cleaning
                      </button>
                    )}
                    {room.housekeepingStatus === 'cleaning_in_progress' && (
                      <button
                        type="button"
                        onClick={() => handleSetHousekeeping(room.id, 'inspected')}
                        className="w-full py-1 text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg flex items-center justify-center gap-1 font-bold border border-emerald-200 transition-colors cursor-pointer"
                      >
                        <Sparkles size={11} /> Mark Clean & Ready
                      </button>
                    )}
                    {(room.housekeepingStatus === 'inspected' || room.housekeepingStatus === 'clean') && isAvailable && (
                      <button
                        type="button"
                        onClick={() => handleSetHousekeeping(room.id, 'dirty')}
                        className="w-full py-0.5 text-[9px] text-slate-400 hover:text-amber-700 rounded flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        Flag for Maid Refresh
                      </button>
                    )}
                    {isAvailable && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setWalkInRoom(room);
                            setIsWalkInOpen(true);
                          }}
                          className="btn-gold py-1.5 text-[11px] w-full justify-center font-bold shadow-xs cursor-pointer"
                        >
                          <UserCheck size={13} /> Walk-In Check In
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleMaintenance(room)}
                          className="w-full py-1 text-[10px] text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg flex items-center justify-center gap-1 font-semibold transition-colors cursor-pointer"
                        >
                          <Wrench size={11} /> Flag Maintenance
                        </button>
                      </>
                    )}

                    {isCleaning && (
                      <button
                        type="button"
                        onClick={() => handleMarkCleaned(room)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Sparkles size={13} /> Mark Cleaned & Ready
                      </button>
                    )}

                    {isMaintenance && (
                      <button
                        type="button"
                        onClick={() => handleToggleMaintenance(room)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <CheckCircle2 size={13} /> Clear Maintenance
                      </button>
                    )}

                    {isOccupied && activeBooking && (
                      <button
                        type="button"
                        onClick={() => handleCheckOut(activeBooking)}
                        className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        Express Check Out
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ────────────────── VIEW 3: GUEST FOLIOS & BILLING ────────────────── */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              Guest Billing & Invoices
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Audit room charges, hospitality GST, and process guest payments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-600 uppercase">Bill #{b.id}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900">{b.guestName}</h3>
                  <p className="text-xs text-slate-500">Suite: {b.roomNumber || `#${b.roomId}`}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Nights Count:</span>
                    <strong className="text-slate-900">{b.nights || 1} Nights</strong>
                  </div>
                  {b.incidentalCharges && b.incidentalCharges.length > 0 && (
                    <div className="flex justify-between text-amber-700 font-medium">
                      <span>Extra Charges ({b.incidentalCharges.length}):</span>
                      <span>+{formatPrice(b.incidentalCharges.reduce((sum, item) => sum + Number(item.amount || 0), 0), currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Total Bill:</span>
                    <strong className="text-slate-900 font-display text-sm">
                      {formatPrice(Number(b.totalPrice) || 0, currency)}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedIncidentalBooking(b)}
                    className="flex-1 py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <PlusCircle size={13} /> + Incidental
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBookingFolio(b)}
                    className="flex-1 btn-gold py-2 text-xs justify-center cursor-pointer"
                  >
                    View Bill / Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────── VIEW 4: GUEST SERVICE REQUESTS ────────────────── */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                Guest Requests & Concierge Dispatch
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Live dispatch requests submitted by staying guests for housekeeping, room service, and amenities.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search suite, request type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/30"
              />
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <BellRing size={36} className="mx-auto mb-3 opacity-40 text-amber-600" />
              <p className="text-sm font-semibold text-slate-700">No active service requests found</p>
              <p className="text-xs text-slate-400 mt-1">
                In-room requests submitted by guests will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-5 font-bold">Suite / Room</th>
                      <th className="py-3.5 px-5 font-bold">Service Type</th>
                      <th className="py-3.5 px-5 font-bold">Request Details</th>
                      <th className="py-3.5 px-5 font-bold">Status</th>
                      <th className="py-3.5 px-5 font-bold text-right">Staff Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredServices.map((srv) => {
                      const isPending = srv.status === 'pending';
                      const isInProgress = srv.status === 'in_progress';
                      const isCompleted = srv.status === 'completed';

                      return (
                        <tr key={srv.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-5">
                            <span className="font-bold text-slate-900 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200 text-xs">
                              Suite #{srv.roomId || '101'}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 font-bold text-slate-900">
                            {srv.serviceName}
                          </td>
                          <td className="py-3.5 px-5 text-slate-600 max-w-xs">
                            <p className="line-clamp-2">{srv.description}</p>
                          </td>
                          <td className="py-3.5 px-5">
                            <StatusBadge status={srv.status} />
                          </td>
                          <td className="py-3.5 px-5 text-right space-x-2">
                            {isPending && (
                              <button
                                type="button"
                                onClick={() => handleServiceStatus(srv.id, 'in_progress')}
                                className="px-3 py-1.5 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-lg inline-flex items-center gap-1 border border-sky-200 cursor-pointer transition-colors"
                              >
                                <Clock size={13} /> Accept & Dispatch
                              </button>
                            )}
                            {isInProgress && (
                              <button
                                type="button"
                                onClick={() => handleServiceStatus(srv.id, 'completed')}
                                className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg inline-flex items-center gap-1 border border-emerald-200 cursor-pointer transition-colors"
                              >
                                <CheckCircle2 size={13} /> Mark Completed
                              </button>
                            )}
                            {isCompleted && (
                              <span className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1">
                                <CheckCircle2 size={14} /> Fulfilled
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredServices.map((srv) => (
                  <div key={srv.id} className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                        Suite #{srv.roomId || '101'}
                      </span>
                      <StatusBadge status={srv.status} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{srv.serviceName}</h4>
                      <p className="text-xs text-slate-600 mt-1">{srv.description}</p>
                    </div>
                    <div className="pt-2 flex justify-end">
                      {srv.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleServiceStatus(srv.id, 'in_progress')}
                          className="px-3 py-1.5 text-xs font-bold text-sky-800 bg-sky-50 rounded-lg border border-sky-200"
                        >
                          Accept & Dispatch
                        </button>
                      )}
                      {srv.status === 'in_progress' && (
                        <button
                          type="button"
                          onClick={() => handleServiceStatus(srv.id, 'completed')}
                          className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200"
                        >
                          Mark Completed
                        </button>
                      )}
                      {srv.status === 'completed' && (
                        <span className="text-xs font-bold text-emerald-700">Fulfilled ✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────── FOLIO DETAIL MODAL ────────────────── */}
      <InvoiceModal
        isOpen={!!selectedBookingFolio}
        onClose={() => setSelectedBookingFolio(null)}
        booking={selectedBookingFolio}
      />

      {/* ────────────────── WALK-IN REGISTRATION MODAL ────────────────── */}
      <WalkInModal
        isOpen={isWalkInOpen}
        onClose={() => {
          setIsWalkInOpen(false);
          setWalkInRoom(null);
        }}
        room={walkInRoom}
        availableRooms={rooms.filter((r) => r.status === 'available')}
        onConfirm={handleWalkInBooking}
      />

      {/* ────────────────── INCIDENTAL FOLIO POSTING MODAL ────────────────── */}
      <IncidentalChargeModal
        isOpen={!!selectedIncidentalBooking}
        onClose={() => setSelectedIncidentalBooking(null)}
        booking={selectedIncidentalBooking}
      />

      {/* ────────────────── KYC VERIFICATION MODAL ────────────────── */}
      <KYCVerificationModal
        isOpen={!!selectedKYCBooking}
        onClose={() => setSelectedKYCBooking(null)}
        booking={selectedKYCBooking}
      />

      {/* ────────────────── HOUSEKEEPING READINESS OVERRIDE MODAL ────────────────── */}
      {housekeepingWarning && (
        <Modal
          isOpen={!!housekeepingWarning}
          onClose={() => setHousekeepingWarning(null)}
          title="Housekeeping Readiness Alert"
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">
                  Suite #{housekeepingWarning.room.roomNumber || housekeepingWarning.room.number} is Not Ready
                </h4>
                <p className="text-xs text-amber-700 mt-1">
                  Current Housekeeping state:{' '}
                  <strong className="capitalize">
                    {(housekeepingWarning.room.housekeepingStatus || 'dirty').replace(/_/g, ' ')}
                  </strong>
                  . Room has not yet been marked Clean & Inspected.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Handing over the physical / digital key before housekeeping inspection may lead to guest dissatisfaction.
              Are you authorized to proceed?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setHousekeepingWarning(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Wait for Maid
              </button>
              <button
                type="button"
                onClick={() => handleCheckIn(housekeepingWarning.booking, true)}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Handover Key Anyway
              </button>
            </div>
          </div>
        </Modal>
      )}
    </PortalShell>
  );
}
