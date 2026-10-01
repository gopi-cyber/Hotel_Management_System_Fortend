'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRooms, Room, updateRoom } from '@/lib/features/roomSlice';
import { fetchUserBookings, Booking } from '@/lib/features/bookingSlice';
import { RootState, AppDispatch } from '@/lib/store';
import { formatPrice } from '@/lib/features/settingsSlice';
import {
  Calendar,
  Search,
  CheckCircle2,
  AlertCircle,
  Compass,
  MapPin,
  Star,
  CreditCard,
  BedDouble,
  Users,
  ArrowRight,
  Clock,
  Sparkles,
  BellRing,
  FileText,
  ShieldCheck,
  Check,
  KeyRound,
  Image as ImageIcon,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import PortalShell from '@/components/PortalShell';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import InvoiceModal from '@/components/ui/InvoiceModal';
import DigitalKeyModal from '@/components/Guest/DigitalKeyModal';
import RoomGalleryModal from '@/components/Guest/RoomGalleryModal';

export default function GuestDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.user);
  const currency = useSelector((state: RootState) => state.settings.currency);
  const { items: rooms, status: roomsStatus } = useSelector((state: RootState) => state.rooms);
  const { items: myBookings, status: bookingsStatus } = useSelector((state: RootState) => state.bookings);

  const [activeTab, setActiveTab] = useState<'stays' | 'discover'>('stays');
  const [roomFilter, setRoomFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Advanced Filter & Sort states
  const [maxPrice, setMaxPrice] = useState(60000);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'capacity'>('recommended');
  const [selectedAmenity, setSelectedAmenity] = useState<string>('all');

  // Modals
  const [selectedKeyBooking, setSelectedKeyBooking] = useState<Booking | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [selectedGalleryRoom, setSelectedGalleryRoom] = useState<Room | null>(null);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  
  // Booking dates
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkOutDate, setCheckOutDate] = useState(tomorrowStr);
  const [guestsCount, setGuestsCount] = useState(2);

  // Booking Modal & Payment
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'arrival'>('upi');
  const [selectedFolioBooking, setSelectedFolioBooking] = useState<Booking | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchRooms());
      dispatch(fetchUserBookings(user.id));
    }
  }, [dispatch, user]);

  const handleStartBooking = (room: Room) => {
    setBookingError('');
    if (!checkInDate || !checkOutDate) {
      setBookingError('Please specify check-in and check-out dates.');
      return;
    }
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setBookingError('Check-out date must be strictly after check-in date.');
      return;
    }
    setSelectedRoom(room);
    setIsBookingModalOpen(true);
  };

  const handleConfirmReservation = async () => {
    if (!selectedRoom || !user) return;
    setIsConfirming(true);

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    const totalPrice = nights * selectedRoom.price;

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          userId: user.id,
          guestName: user.name || user.username,
          checkInDate,
          checkOutDate,
          totalPrice,
          nights,
          paymentMethod: paymentMethod === 'upi' ? 'Instant UPI / GPay' : paymentMethod === 'card' ? 'Encrypted Luxury Card' : 'Pay at Front Desk Check-in',
          status: 'confirmed',
        }),
      });

      if (response.ok) {
        setBookingSuccess(`Your reservation for ${selectedRoom.name || selectedRoom.type} has been confirmed!`);
        setIsBookingModalOpen(false);
        await dispatch(fetchUserBookings(user.id));
        // Update room status to occupied in state
        await dispatch(updateRoom({ ...selectedRoom, status: 'occupied' }));
        setActiveTab('stays');
        setTimeout(() => setBookingSuccess(''), 5000);
      } else {
        setBookingError('Unable to complete reservation. Please try again.');
      }
    } catch {
      setBookingError('Service temporarily offline. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  // Advanced Filtered & Sorted rooms
  const filteredRooms = useMemo(() => {
    const list = rooms.filter((r) => {
      const matchesSearch =
        (r.name || r.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.roomNumber && r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = roomFilter === 'All' || r.type.toLowerCase() === roomFilter.toLowerCase();
      const matchesPrice = (r.price || 0) <= maxPrice;

      // Amenity chips filter
      let matchesAmenity = true;
      if (selectedAmenity === 'ocean') {
        matchesAmenity = (r.name + ' ' + (r.description || '')).toLowerCase().includes('ocean') ||
          (r.name + ' ' + (r.description || '')).toLowerCase().includes('terrace');
      } else if (selectedAmenity === 'pool') {
        matchesAmenity = (r.name + ' ' + (r.description || '')).toLowerCase().includes('pool') ||
          (r.name + ' ' + (r.description || '')).toLowerCase().includes('villa');
      } else if (selectedAmenity === 'presidential') {
        matchesAmenity = (r.name + ' ' + (r.description || '')).toLowerCase().includes('presidential') ||
          (r.name + ' ' + (r.description || '')).toLowerCase().includes('penthouse') ||
          r.type.toLowerCase() === 'presidential';
      }

      return matchesSearch && matchesType && matchesPrice && matchesAmenity;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'capacity') return (b.capacity || 2) - (a.capacity || 2);
      // 'recommended': available rooms first, then by price
      if (a.status === 'available' && b.status !== 'available') return -1;
      if (a.status !== 'available' && b.status === 'available') return 1;
      return 0;
    });
  }, [rooms, searchQuery, roomFilter, maxPrice, selectedAmenity, sortBy]);

  const navItems = [
    {
      id: 'stays',
      label: 'My Reservations',
      icon: Calendar,
      badge: myBookings.length,
      isActive: activeTab === 'stays',
      onClick: () => setActiveTab('stays'),
    },
    {
      id: 'discover',
      label: 'Explore Suites',
      icon: Compass,
      isActive: activeTab === 'discover',
      onClick: () => setActiveTab('discover'),
    },
    {
      id: 'concierge',
      label: 'In-Room Concierge',
      icon: BellRing,
      onClick: () => (window.location.href = '/profile'),
    },
  ];

  return (
    <PortalShell
      requiredRole="guest"
      title={`Welcome, ${user?.name || user?.username || 'Honored Guest'}`}
      subtitle="Manage your personal itinerary, explore private residences, and order on-demand room amenities."
      navItems={navItems}
      activeNavId={activeTab}
      actions={
        <div className="flex items-center gap-2">
          <Link href="/profile" className="btn-gold text-xs py-2 px-4 inline-flex items-center gap-2">
            <BellRing size={14} /> Request Concierge
          </Link>
        </div>
      }
    >
      {/* Toast Notification */}
      {bookingSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-3 shadow-xs">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <span>{bookingSuccess}</span>
        </div>
      )}

      {/* ────────────────── VIEW 1: MY RESERVATIONS ────────────────── */}
      {activeTab === 'stays' && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                Current & Upcoming Stays
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {myBookings.length > 0
                  ? `You have ${myBookings.length} confirmed itinerary record(s).`
                  : 'You do not have any active bookings at LuxeStay.'}
              </p>
            </div>
            {myBookings.length === 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('discover')}
                className="btn-gold py-2.5 px-5 text-xs self-start sm:self-auto cursor-pointer"
              >
                Browse Available Suites <ArrowRight size={14} />
              </button>
            )}
          </div>

          {myBookings.length > 0 && (
            <div className="p-5 rounded-3xl bg-linear-to-r from-slate-950 via-[#1e1b4b] to-slate-900 text-white border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                  <KeyRound size={24} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block">Contactless RFID / NFC</span>
                  <h3 className="text-lg font-bold font-display text-white">Smart Mobile Suite Key</h3>
                  <p className="text-xs text-slate-300 mt-0.5">Instant tap-to-unlock access for your assigned room without stopping at reception.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedKeyBooking(myBookings[0] || null);
                  setIsKeyModalOpen(true);
                }}
                className="btn-gold py-2.5 px-5 text-xs font-bold shrink-0 inline-flex items-center gap-2 justify-center"
              >
                <KeyRound size={14} /> Open Digital Key
              </button>
            </div>
          )}

          {myBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myBookings.map((b: Booking) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-400 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Stay Reference #{b.id}
                      </span>
                      <StatusBadge status={b.status} />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold font-display text-slate-900">
                        {b.roomNumber ? `Suite ${b.roomNumber}` : 'LuxeStay Residence'}
                      </h3>
                      <p className="text-xs font-medium text-slate-500">
                        Registered Guest: <strong className="text-slate-800">{b.guestName}</strong>
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Check-In</span>
                        <strong className="text-slate-900">{b.checkInDate}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Check-Out</span>
                        <strong className="text-slate-900">{b.checkOutDate}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200">
                        <span>Duration</span>
                        <strong className="text-slate-900">{b.nights || 1} Night(s)</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-600 block">
                        Total Folio
                      </span>
                      <span className="text-lg font-bold text-slate-900 font-display">
                        {formatPrice(Number(b.totalPrice) || 0, currency)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedKeyBooking(b);
                          setIsKeyModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Open Digital NFC Keycard"
                      >
                        <KeyRound size={13} className="text-amber-700" /> Key
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedFolioBooking(b)}
                        className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="View & Print Official Hotel Folio"
                      >
                        <FileText size={13} className="text-amber-700" /> Folio
                      </button>
                      <Link
                        href="/profile"
                        className="px-2.5 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <BellRing size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4">
                <BedDouble size={28} />
              </div>
              <h3 className="text-lg font-bold font-display text-slate-900 mb-1">
                No Active Reservations
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Your journey of luxury begins here. Explore our signature ocean suites and villas.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('discover')}
                className="btn-gold py-2.5 px-6 text-xs inline-flex items-center gap-2 cursor-pointer"
              >
                Discover Suites <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ────────────────── VIEW 2: EXPLORE & BOOK SUITES ────────────────── */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          {/* Date Picker Strip for Booking */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Check-In Date
              </label>
              <input
                type="date"
                value={checkInDate}
                min={todayStr}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 text-slate-900 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Check-Out Date
              </label>
              <input
                type="date"
                value={checkOutDate}
                min={checkInDate || todayStr}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 text-slate-900 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Suite Category
              </label>
              <select
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 text-slate-900 bg-slate-50/50"
              >
                <option value="All">All Categories</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
                <option value="Executive">Executive</option>
                <option value="Penthouse">Penthouse</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Search Suites
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm font-medium rounded-xl border border-slate-300 text-slate-900 bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          {/* Advanced Filter & Sorter Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Amenity Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'All Suites' },
                { id: 'ocean', label: 'Ocean View & Terrace' },
                { id: 'pool', label: 'Private Pool / Villa' },
                { id: 'presidential', label: 'Presidential & Penthouse' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setSelectedAmenity(chip.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedAmenity === chip.id
                      ? 'bg-slate-900 text-amber-400 shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Slider & Sorter Controls */}
            <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap justify-between md:justify-end">
              {/* Price Range Slider */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 min-w-[200px]">
                <SlidersHorizontal size={14} className="text-amber-600 shrink-0" />
                <span className="shrink-0 text-[11px] font-bold">Max: {formatPrice(maxPrice, currency)}</span>
                <input
                  type="range"
                  min="15000"
                  max="60000"
                  step="2500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>

              {/* Sorter Dropdown */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold">
                <ArrowUpDown size={13} className="text-slate-500 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-bold text-xs text-slate-800 cursor-pointer focus:outline-none"
                  aria-label="Sort suites"
                >
                  <option value="recommended">Sort: Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="capacity">Capacity: Largest First</option>
                </select>
              </div>

              <span className="text-xs text-slate-500 font-medium">
                {filteredRooms.length} suite(s)
              </span>
            </div>
          </div>

          {bookingError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{bookingError}</span>
            </div>
          )}

          {/* Rooms Grid: fully fluid across laptop, desktop, mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
              const isUnavailable = room.status !== 'available';
              return (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm flex flex-col justify-between hover:border-amber-400 transition-all duration-200"
                >
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                    {room.imageUrl ? (
                      <Image
                        src={room.imageUrl}
                        alt={room.name || room.type || 'LuxeStay Suite'}
                        fill
                        sizes="(max-width: 768px) 100vw, 350px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <BedDouble size={36} />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <StatusBadge status={room.status} />
                    </div>
                    <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-bold">
                      {room.roomNumber ? `No. ${room.roomNumber}` : room.type}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                        <span>{room.type}</span>
                        <span>Up to {room.capacity} Guests</span>
                      </div>
                      <h3 className="text-xl font-bold font-display text-slate-900 leading-snug">
                        {room.name || room.type}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {room.description || 'Spacious sanctuary with marble bathroom, panoramic terrace, and bespoke guest amenities.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-600 block">
                          Per Night
                        </span>
                        <span className="text-lg font-bold text-slate-900 font-display">
                          {formatPrice(Number(room.price) || 0, currency)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedGalleryRoom(room);
                            setIsGalleryModalOpen(true);
                          }}
                          className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-amber-700 hover:border-amber-400 bg-slate-50 transition-colors cursor-pointer"
                          title="View Fullscreen Photo Gallery"
                        >
                          <ImageIcon size={15} />
                        </button>

                        <button
                          type="button"
                          disabled={isUnavailable}
                          onClick={() => handleStartBooking(room)}
                          className={`text-xs px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                            isUnavailable
                              ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                              : 'btn-gold'
                          }`}
                        >
                          {room.status === 'occupied'
                            ? 'Occupied'
                            : room.status === 'maintenance'
                            ? 'Under Maintenance'
                            : room.status === 'cleaning'
                            ? 'Being Serviced'
                            : 'Reserve Suite'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ────────────────── RESERVATION CONFIRMATION MODAL ────────────────── */}
      {selectedRoom && (
        <Modal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          title="Confirm Suite Reservation"
          subtitle={`Review details for ${selectedRoom.name || selectedRoom.type}`}
        >
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Guest Name:</span>
                <strong className="text-slate-900">{user?.name || user?.username}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Suite Category:</span>
                <strong className="text-slate-900">{selectedRoom.name || selectedRoom.type} ({selectedRoom.type})</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Check-in Date:</span>
                <strong className="text-slate-900">{checkInDate}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Check-out Date:</span>
                <strong className="text-slate-900">{checkOutDate}</strong>
              </div>
            </div>

            {/* Price breakdown */}
            {(() => {
              const checkIn = new Date(checkInDate);
              const checkOut = new Date(checkOutDate);
              const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
              const subtotal = nights * selectedRoom.price;
              const tax = Math.round(subtotal * 0.12);
              const total = subtotal + tax;

              return (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Nightly Rate (₹{selectedRoom.price.toLocaleString()} × {nights} nights):</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Luxury Hospitality GST (12%):</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Reservation Folio:</span>
                    <span className="text-lg font-display text-amber-800">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              );
            })()}

            {/* Payment Method Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Payment & Settlement Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'upi'
                      ? 'bg-amber-50/80 border-amber-600 ring-1 ring-amber-600/30'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">Instant UPI</span>
                    {paymentMethod === 'upi' && <Check size={14} className="text-amber-700" />}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">GPay, PhonePe, Paytm QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'card'
                      ? 'bg-amber-50/80 border-amber-600 ring-1 ring-amber-600/30'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">Credit / Debit Card</span>
                    {paymentMethod === 'card' && <Check size={14} className="text-amber-700" />}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Visa, Mastercard, Amex</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('arrival')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'arrival'
                      ? 'bg-amber-50/80 border-amber-600 ring-1 ring-amber-600/30'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">Pay on Arrival</span>
                    {paymentMethod === 'arrival' && <Check size={14} className="text-amber-700" />}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Front Desk Settlement</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                <span>256-Bit SSL Encrypted 5-Star Hospitality Guarantee</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isConfirming}
                onClick={handleConfirmReservation}
                className="btn-gold py-2.5 px-6 text-xs inline-flex items-center gap-2 cursor-pointer"
              >
                {isConfirming ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Confirm & Reserve <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ────────────────── OFFICIAL GUEST TAX FOLIO / INVOICE ────────────────── */}
      <InvoiceModal
        isOpen={!!selectedFolioBooking}
        onClose={() => setSelectedFolioBooking(null)}
        booking={selectedFolioBooking}
      />

      {/* ────────────────── DIGITAL MOBILE NFC KEYCARD MODAL ────────────────── */}
      <DigitalKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        booking={selectedKeyBooking}
      />

      {/* ────────────────── SUITE FULLSCREEN PHOTO GALLERY MODAL ────────────────── */}
      <RoomGalleryModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        room={selectedGalleryRoom}
        onSelectBooking={(r) => handleStartBooking(r)}
      />
    </PortalShell>
  );
}
