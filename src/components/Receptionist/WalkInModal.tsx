'use client';
import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Room } from '@/lib/features/roomSlice';
import { User, Phone, Mail, CreditCard, Shield, Clock, BedDouble, CheckCircle2 } from 'lucide-react';
import PhoneInput from '@/components/ui/PhoneInput';

interface WalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  availableRooms: Room[];
  onConfirm: (bookingData: {
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
  }) => Promise<void>;
}

export default function WalkInModal({
  isOpen,
  onClose,
  room,
  availableRooms,
  onConfirm,
}: WalkInModalProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [guestEmail, setGuestEmail] = useState('');
  const [idType, setIdType] = useState('Aadhaar Card');
  const [idNumber, setIdNumber] = useState('');
  const [nights, setNights] = useState(1);
  const [guestsCount, setGuestsCount] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (room) {
      setSelectedRoomId(String(room.id));
    } else if (availableRooms.length > 0) {
      setSelectedRoomId(String(availableRooms[0].id));
    }
  }, [room, availableRooms]);

  const activeRoom =
    (room && String(room.id) === selectedRoomId ? room : null) ||
    availableRooms.find((r) => String(r.id) === selectedRoomId) ||
    room;

  const roomPrice = activeRoom?.price || 0;
  const subtotal = roomPrice * nights;
  const gst = Math.round(subtotal * 0.12);
  const total = subtotal + gst;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone || !activeRoom) return;
    setIsSubmitting(true);

    try {
      const fullPhone = `${countryCode} ${guestPhone}`;
      await onConfirm({
        guestName,
        guestPhone: fullPhone,
        guestEmail,
        idType,
        idNumber,
        roomId: String(activeRoom.id),
        roomNumber: String(activeRoom.number || activeRoom.roomNumber || '101'),
        roomType: activeRoom.type,
        nights,
        guestsCount,
        totalPrice: total,
        paymentMethod,
      });

      // Reset form
      setGuestName('');
      setGuestPhone('');
      setGuestEmail('');
      setIdNumber('');
      setNights(1);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Front Desk Walk-In Check-In"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Room Selection & Rate Banner */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <BedDouble size={14} /> Assigned Suite
            </span>
            <div className="flex items-center gap-2">
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none"
              >
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {String(r.number || r.roomNumber).replace(/^#/, '')} — {r.type} (₹{(r.price || 0).toLocaleString()}/night)
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-amber-900/80 block font-medium">Price Per Night</span>
            <span className="text-lg font-bold font-display text-amber-950">
              ₹{roomPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Guest Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Guest Full Name *
            </label>
            <div className="relative rounded-xl border border-slate-300 bg-white focus-within:border-amber-600 focus-within:ring-1 focus-within:ring-amber-500/20">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={16} />
              </div>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Vikramaditya Singhania"
                className="w-full pl-9 pr-3 py-2.5 text-slate-900 bg-transparent rounded-xl outline-none text-xs sm:text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Mobile Contact *
            </label>
            <PhoneInput
              countryCode={countryCode}
              onCountryCodeChange={setCountryCode}
              phone={guestPhone}
              onPhoneChange={setGuestPhone}
              placeholder="e.g. 9876543210"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Government ID Proof
            </label>
            <select
              value={idType}
              onChange={(e) => setIdType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-amber-600"
            >
              <option value="Aadhaar Card">Aadhaar Card</option>
              <option value="Passport">Passport</option>
              <option value="Driving License">Driving License</option>
              <option value="Voter ID">Voter ID</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              ID Document Number *
            </label>
            <div className="relative rounded-xl border border-slate-300 bg-white focus-within:border-amber-600 focus-within:ring-1 focus-within:ring-amber-500/20">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Shield size={16} />
              </div>
              <input
                type="text"
                required
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="XXXX-XXXX-XXXX"
                className="w-full pl-9 pr-3 py-2.5 text-slate-900 bg-transparent rounded-xl outline-none text-xs sm:text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* Stay & Payment Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Duration of Stay
            </label>
            <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setNights(Math.max(1, nights - 1))}
                className="px-3 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold"
              >
                -
              </button>
              <span className="flex-1 text-center font-bold text-xs sm:text-sm">
                {nights} {nights === 1 ? 'Night' : 'Nights'}
              </span>
              <button
                type="button"
                onClick={() => setNights(nights + 1)}
                className="px-3 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Guest Count
            </label>
            <select
              value={guestsCount}
              onChange={(e) => setGuestsCount(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none"
            >
              <option value={1}>1 Adult</option>
              <option value={2}>2 Adults</option>
              <option value={3}>3 Guests</option>
              <option value={4}>4 Guests (Family)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Settlement Mode
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none"
            >
              <option value="Credit Card">Credit / Debit Card</option>
              <option value="UPI / QR">UPI / QR Code</option>
              <option value="Cash at Desk">Cash at Desk</option>
              <option value="Corporate Ledger">Corporate Direct Bill</option>
            </select>
          </div>
        </div>

        {/* Live Bill Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-1.5">
          <div className="flex justify-between text-slate-600">
            <span>Room Charges ({nights} Nights × ₹{roomPrice.toLocaleString()}):</span>
            <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Hospitality GST (12%):</span>
            <span className="font-semibold text-slate-900">₹{gst.toLocaleString()}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold">
            <span className="text-slate-900">Total Folio Charge:</span>
            <span className="font-display text-base text-amber-900">₹{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !activeRoom}
            className="btn-gold px-6 py-2.5 text-xs font-bold cursor-pointer inline-flex items-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={16} /> Complete Walk-In & Check In
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
