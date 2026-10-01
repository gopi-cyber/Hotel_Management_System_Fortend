'use client';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/store';
import { addIncidentalCharge, Booking, IncidentalCharge } from '@/lib/features/bookingSlice';
import { formatPrice } from '@/lib/features/settingsSlice';
import Modal from '@/components/ui/Modal';
import { 
  Receipt, 
  Wine, 
  Sparkles, 
  Utensils, 
  Car, 
  Shirt, 
  PlusCircle, 
  CheckCircle2, 
  CreditCard 
} from 'lucide-react';

interface IncidentalChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

const PRESET_INCIDENTALS = [
  {
    title: 'Minibar Spirits & Artisan Confections',
    category: 'minibar' as const,
    amount: 1500,
    icon: 'wine',
  },
  {
    title: 'Ayurvedic Spa & Hydrotherapy Session',
    category: 'spa' as const,
    amount: 3800,
    icon: 'sparkles',
  },
  {
    title: 'Midnight Chef In-Room Dining & Dessert',
    category: 'dining' as const,
    amount: 1950,
    icon: 'utensils',
  },
  {
    title: 'Executive Airport Chauffeur Transfer',
    category: 'transport' as const,
    amount: 2500,
    icon: 'car',
  },
  {
    title: 'Same-Day Express Laundry & Steam Press',
    category: 'laundry' as const,
    amount: 650,
    icon: 'shirt',
  },
];

export default function IncidentalChargeModal({
  isOpen,
  onClose,
  booking,
}: IncidentalChargeModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const currency = useSelector((state: RootState) => state.settings?.currency || 'INR');
  const user = useSelector((state: RootState) => state.user?.user);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IncidentalCharge['category']>('minibar');
  const [amount, setAmount] = useState<number>(1500);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!booking) return null;

  const handleSelectPreset = (preset: typeof PRESET_INCIDENTALS[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setAmount(preset.amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    const charge: IncidentalCharge = {
      id: `INC-${Date.now().toString().slice(-6)}`,
      title: title.trim(),
      category,
      amount: Number(amount),
      date: new Date().toISOString(),
      postedBy: user?.name || 'Front Desk Staff',
    };

    dispatch(addIncidentalCharge({ bookingId: String(booking.id), charge }));
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      setTitle('');
      setAmount(1500);
      onClose();
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post Incidental Charge to Room Folio" size="md">
      <div className="space-y-5">
        {/* Folio Header Target */}
        <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between border border-amber-500/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400">Room {booking.roomNumber || booking.roomId}</span>
              <span className="text-[11px] text-slate-400">• Folio #{String(booking.id).slice(-6)}</span>
            </div>
            <p className="text-sm font-serif font-bold text-white mt-0.5">{booking.guestName}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Current Balance</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">
              {formatPrice(booking.totalPrice, currency)}
            </span>
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Luxury Charge Presets
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_INCIDENTALS.map((preset) => (
              <button
                key={preset.title}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  title === preset.title
                    ? 'border-amber-600 bg-amber-50/70 ring-1 ring-amber-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 block truncate">{preset.title}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">{preset.category}</span>
                </div>
                <span className="text-xs font-bold text-amber-700 shrink-0">
                  {formatPrice(preset.amount, currency)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Charge Item Description
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Minibar, Fine Dining, Spa Treatment"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncidentalCharge['category'])}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500/30 outline-none"
              >
                <option value="minibar">Minibar</option>
                <option value="dining">Dining</option>
                <option value="spa">Spa</option>
                <option value="transport">Transport</option>
                <option value="laundry">Laundry</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Amount to Post ({currency})
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500/30 outline-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              Direct room charge to guest folio
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSuccess}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-xs shadow-md hover:from-amber-700 hover:to-amber-800 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    Posted to Folio!
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    Post Charge
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
