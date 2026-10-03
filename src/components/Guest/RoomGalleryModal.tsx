'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Users,
  BedDouble,
  Maximize,
  Sparkles,
  Check,
  Star,
} from 'lucide-react';
import { Room } from '@/lib/features/roomSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { formatPrice } from '@/lib/features/settingsSlice';

interface RoomGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onSelectBooking?: (room: Room) => void;
}

// Curated high-res suite gallery angles
const GALLERY_ANGLES = [
  {
    title: 'Master Bedroom & Panoramic Glass Wall',
    url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=85',
  },
  {
    title: 'Ensuite Italian Marble Bath & Soaking Tub',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=85',
  },
  {
    title: 'Private Oceanfront Balcony & Sunset Lounger',
    url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1400&q=85',
  },
  {
    title: 'Living Salon & In-Suite Bar Lounge',
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=85',
  },
];

export default function RoomGalleryModal({
  isOpen,
  onClose,
  room,
  onSelectBooking,
}: RoomGalleryModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const currency = useSelector((state: RootState) => state.settings.currency);

  useEffect(() => {
    setActiveIndex(0);
  }, [room]);

  if (!room) return null;

      // Extract any dynamic gallery images configured in admin
      const rawGallery = room.galleryImages;
      const customGalleryUrls = Array.isArray(rawGallery) 
        ? rawGallery 
        : typeof rawGallery === 'string' && rawGallery.trim()
          ? (rawGallery.startsWith('[') ? JSON.parse(rawGallery) : rawGallery.split(',').map((s: string) => s.trim()).filter(Boolean))
          : [];

      const images = customGalleryUrls.length > 0
        ? customGalleryUrls.map((url: string, idx: number) => ({
            title: `${room.name} — View ${idx + 1}`,
            url,
          }))
        : [
            { title: `${room.name} Master View`, url: room.imageUrl || GALLERY_ANGLES[0].url },
            ...GALLERY_ANGLES.slice(1),
          ];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${room.name} — Visual Tour`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Main High-Res Viewer */}
        <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-900 shadow-lg group">
          <Image
            src={images[activeIndex].url}
            alt={images[activeIndex].title}
            fill
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover transition-all duration-300"
          />

          {/* Scrim Overlay & Caption */}
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-slate-950/90 via-slate-950/40 to-transparent p-4 flex items-end justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block">
                Angle {activeIndex + 1} of {images.length}
              </span>
              <p className="text-sm sm:text-base font-semibold text-white">
                {images[activeIndex].title}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 text-xs font-bold border border-amber-500/30">
              Room {String(room.roomNumber || room.id).replace(/^#/, '')}
            </span>
          </div>

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer opacity-90 hover:opacity-100"
            aria-label="Previous photo"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer opacity-90 hover:opacity-100"
            aria-label="Next photo"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Thumbnail Carousel Strip */}
        <div className="grid grid-cols-4 gap-3">
          {images.map((img: { title: string; url: string }, idx: number) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative h-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                activeIndex === idx
                  ? 'border-amber-500 shadow-md ring-2 ring-amber-500/20'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={img.url} alt={img.title} fill sizes="150px" className="object-cover" />
            </button>
          ))}
        </div>

        {/* Specifications & Amenity Badges */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl text-slate-900">{room.name}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                {room.type}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {room.description || 'Architecturally designed luxury sanctuary featuring high-thread linens, sound-dampened suites, and private veranda.'}
            </p>

            <div className="flex items-center gap-4 pt-2 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-amber-600" /> Up to {room.capacity || 2} Guests
              </span>
              <span className="flex items-center gap-1.5">
                <BedDouble size={14} className="text-amber-600" /> King Luxury Bed
              </span>
              <span className="flex items-center gap-1.5">
                <Maximize size={14} className="text-amber-600" /> 75 m²
              </span>
            </div>
          </div>

          <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Price Per Night</span>
            <span className="font-display text-2xl font-bold text-slate-900 block">
              {formatPrice(room.price || 0, currency)}
            </span>
            <span className="text-[11px] text-slate-400 block mb-3">+ taxes & service</span>

            {onSelectBooking && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectBooking(room);
                }}
                disabled={room.status !== 'available'}
                className={`btn-gold text-xs px-5 py-2.5 w-full sm:w-auto justify-center ${
                  room.status !== 'available' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {room.status === 'available' ? 'Book This Suite' : 'Suite Reserved'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
