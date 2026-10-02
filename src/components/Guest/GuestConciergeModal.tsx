'use client';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/store';
import { addLocalServiceRequest, ServiceRequest } from '@/lib/features/serviceSlice';
import { formatPrice } from '@/lib/features/settingsSlice';
import Modal from '@/components/ui/Modal';
import { 
  Bell, 
  UtensilsCrossed, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Coffee, 
  Car, 
  BedDouble, 
  Wine, 
  Flame,
  ShieldCheck
} from 'lucide-react';

interface GuestConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: any;
  roomId?: string;
  roomNumber?: string;
  guestId?: string;
  guestName?: string;
}

interface ServiceCatalogItem {
  id: string;
  name: string;
  category: 'housekeeping' | 'dining' | 'concierge';
  description: string;
  price: number;
  icon: string;
  estimatedMinutes: number;
}

const CATALOG_ITEMS: ServiceCatalogItem[] = [
  {
    id: 'srv-towels',
    name: 'Extra Egyptian Cotton Towels & Robes',
    category: 'housekeeping',
    description: 'Fresh warm bath sheets, plush hand towels, and velvet slippers delivered to your suite.',
    price: 0,
    icon: 'sparkles',
    estimatedMinutes: 10,
  },
  {
    id: 'srv-pillow',
    name: 'Orthopedic & Goose Feather Pillow Menu',
    category: 'housekeeping',
    description: 'Select your preferred contour memory foam or hypoallergenic Hungarian goose down.',
    price: 0,
    icon: 'bed',
    estimatedMinutes: 15,
  },
  {
    id: 'srv-turndown',
    name: 'Evening Turndown & Aromatherapy',
    category: 'housekeeping',
    description: 'Bed refreshed with lavender pillow mist, ambient lighting, and artisanal bedtime chocolates.',
    price: 0,
    icon: 'sparkles',
    estimatedMinutes: 20,
  },
  {
    id: 'srv-sandwich',
    name: 'Gourmet Midnight Club Sandwich',
    category: 'dining',
    description: 'Smoked chicken or roasted brie on sourdough with rosemary truffle fries and aioli.',
    price: 850,
    icon: 'utensils',
    estimatedMinutes: 25,
  },
  {
    id: 'srv-coffee',
    name: 'French Press Artisanal Coffee & Croissants',
    category: 'dining',
    description: 'Freshly roasted single-origin Arabica coffee served with warm flakey butter pastries.',
    price: 450,
    icon: 'coffee',
    estimatedMinutes: 15,
  },
  {
    id: 'srv-champagne',
    name: 'Chilled Champagne & Caviar Tartlets',
    category: 'dining',
    description: 'Moët & Chandon Brut Impérial on silver ice bucket with lemon caviar pairings.',
    price: 6500,
    icon: 'wine',
    estimatedMinutes: 20,
  },
  {
    id: 'srv-luggage',
    name: 'Express Luggage & Bellhop Assistance',
    category: 'concierge',
    description: 'Uniformed porter team to assist with bags, garment bags, and seamless lobby transfer.',
    price: 0,
    icon: 'bell',
    estimatedMinutes: 10,
  },
  {
    id: 'srv-valet',
    name: 'Valet Car Retrieval at Main Portico',
    category: 'concierge',
    description: 'Have your vehicle temperature-conditioned and waiting at the grand hotel entrance.',
    price: 0,
    icon: 'car',
    estimatedMinutes: 12,
  },
  {
    id: 'srv-latecheckout',
    name: 'Late Checkout Request (2:00 PM)',
    category: 'concierge',
    description: 'Priority extension of your room key card and leisurely afternoon departure.',
    price: 0,
    icon: 'clock',
    estimatedMinutes: 5,
  },
];

export default function GuestConciergeModal({
  isOpen,
  onClose,
  booking,
  roomId: propRoomId,
  roomNumber: propRoomNumber,
  guestId: propGuestId,
  guestName: propGuestName,
}: GuestConciergeModalProps) {
  const roomId = propRoomId || (booking as any)?.roomId || '101';
  const roomNumber = propRoomNumber || (booking as any)?.roomNumber || '101';
  const guestId = propGuestId || (booking as any)?.userId || '3';
  const guestName = propGuestName || (booking as any)?.guestName || 'Valued Guest';
  const dispatch = useDispatch<AppDispatch>();
  const currency = useSelector((state: RootState) => state.settings?.currency || 'INR');

  const [activeCategory, setActiveCategory] = useState<'all' | 'housekeeping' | 'dining' | 'concierge'>('all');
  const [selectedItem, setSelectedItem] = useState<ServiceCatalogItem>(CATALOG_ITEMS[0]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'priority' | 'urgent'>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const filteredItems = CATALOG_ITEMS.filter((item) => 
    activeCategory === 'all' ? true : item.category === activeCategory
  );

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Audio fallback silent
    }
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newRequest: ServiceRequest = {
      id: `SRV-${Date.now().toString().slice(-5)}`,
      guestId,
      guestName,
      roomId,
      roomNumber,
      serviceName: selectedItem.name,
      description: specialInstructions 
        ? `${selectedItem.description} | Note: ${specialInstructions}`
        : selectedItem.description,
      status: 'pending',
      urgency,
      createdAt: new Date().toISOString(),
    };

    dispatch(addLocalServiceRequest(newRequest));
    playChime();

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setSpecialInstructions('');
        onClose();
      }, 1500);
    }, 400);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'sparkles': return <Sparkles className="w-5 h-5" />;
      case 'bed': return <BedDouble className="w-5 h-5" />;
      case 'utensils': return <UtensilsCrossed className="w-5 h-5" />;
      case 'coffee': return <Coffee className="w-5 h-5" />;
      case 'wine': return <Wine className="w-5 h-5" />;
      case 'car': return <Car className="w-5 h-5" />;
      case 'clock': return <Clock className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="24/7 Royal Concierge & In-Room Service" maxWidth="lg">
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white flex items-center justify-between border border-amber-500/30 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Bell className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-amber-300">
                In-Suite Concierge Dispatch
              </h3>
              <p className="text-xs text-slate-300">
                Suite {roomNumber} • Guest {guestName} • 24/7 Direct Butler Line
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Staff On Duty
          </span>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All Offerings' },
            { id: 'housekeeping', label: 'Housekeeping & Comfort' },
            { id: 'dining', label: 'In-Room Fine Dining' },
            { id: 'concierge', label: 'Concierge & Valet' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id as typeof activeCategory)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Item Selection Grid */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Select Requested Service
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
            {filteredItems.map((item) => {
              const isSelected = selectedItem.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-400/40'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${
                    isSelected ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {getIcon(item.icon)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {item.name}
                      </h4>
                      <span className="text-xs font-bold text-amber-700 shrink-0">
                        {item.price === 0 ? 'Complimentary' : formatPrice(item.price, currency)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>~{item.estimatedMinutes} mins delivery</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Details */}
        <form onSubmit={handleSendRequest} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Special Requests or Dietary Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Extra ice, delivery at 10:30 PM, ring door softly"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Urgency Priority
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as typeof urgency)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white font-medium focus:ring-2 focus:ring-amber-500/40 outline-none"
              >
                <option value="normal">Standard Service</option>
                <option value="priority">Priority Dispatch</option>
                <option value="urgent">Immediate Attention ⚡</option>
              </select>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Fulfilled directly by 5-star concierge team</span>
            </div>
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
                disabled={isSubmitting || isSuccess}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-xs shadow-md hover:from-amber-700 hover:to-amber-800 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200 animate-bounce" />
                    Request Dispatched!
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    {isSubmitting ? 'Dispatching...' : 'Dispatch Request'}
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
