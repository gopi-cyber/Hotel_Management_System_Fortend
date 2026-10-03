'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Room } from '@/lib/features/roomSlice';
import Modal from '@/components/ui/Modal';
import { Image as ImageIcon, Sparkles, Check } from 'lucide-react';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (room: Partial<Room>) => Promise<void>;
  room?: Room | null;
}

const sampleImages = [
  {
    name: 'Ocean Grand Deluxe',
    url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Garden Sanctuary Villa',
    url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Presidential Penthouse',
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Executive King Suite',
    url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80',
  },
];

export function RoomModal({ isOpen, onClose, onSave, room }: RoomModalProps) {
  const [number, setNumber] = useState('');
  const [type, setType] = useState('Deluxe Suite');
  const [price, setPrice] = useState('22000');
  const [capacity, setCapacity] = useState('2');
  const [status, setStatus] = useState<'available' | 'occupied' | 'maintenance'>('available');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(sampleImages[0].url);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (room) {
      setNumber(room.number || room.roomNumber || '');
      setType(room.type || 'Deluxe Suite');
      setPrice(String(room.price || '22000'));
      setCapacity(String(room.capacity || '2'));
      setStatus(room.status || 'available');
      setDescription(room.description || '');
      setImage(room.image || room.imageUrl || sampleImages[0].url);
    } else {
      setNumber('');
      setType('Deluxe Suite');
      setPrice('22000');
      setCapacity('2');
      setStatus('available');
      setDescription('');
      setImage(sampleImages[0].url);
    }
  }, [room, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        ...(room ? { id: room.id } : {}),
        number,
        roomNumber: number,
        type,
        name: type,
        price: Number(price),
        capacity: Number(capacity),
        status,
        description,
        image,
        imageUrl: image,
        amenities: ['Terrace', 'Ocean View', 'Butler'],
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const [imageSourceMode, setImageSourceMode] = useState<'upload' | 'preset' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        setImage(uploadEvent.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={room ? `Suite ${String(room.number || room.id).replace(/^#/, '')}` : 'Add New Room'}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Live Image Preview & Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Room Photo
            </label>
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setImageSourceMode('upload')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  imageSourceMode === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setImageSourceMode('url')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  imageSourceMode === 'url' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Direct Image Link
              </button>
            </div>
          </div>
          
          {/* Dropzone & Preview Container */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => {
              if (imageSourceMode === 'upload' && fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            className={`relative h-48 w-full rounded-2xl overflow-hidden border-2 transition-all group ${
              isDragging
                ? 'border-amber-500 bg-amber-50/50 scale-[1.01]'
                : 'border-slate-200 bg-slate-100'
            } ${imageSourceMode === 'upload' ? 'cursor-pointer hover:border-amber-400' : ''}`}
          >
            {image ? (
              <>
                <Image
                  src={image}
                  alt="Suite Preview"
                  fill
                  unoptimized={image.startsWith('data:')}
                  sizes="(max-width: 768px) 100vw, 550px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-400/30 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 z-10">
                  <Sparkles size={12} /> Live Preview
                </div>
                {imageSourceMode === 'upload' && (
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4 text-center">
                    <p className="text-xs font-bold bg-amber-600 text-white px-3 py-1.5 rounded-full shadow-md">
                      Click or Drag New Image to Replace
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                <ImageIcon size={36} className="text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-800">
                  Click to Browse Photo or Drag & Drop Here
                </span>
                <span className="text-[11px] text-slate-400 mt-1">Supports PNG, JPG, WebP up to 10MB</span>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          {/* Conditional Controls by Tab */}
          {imageSourceMode === 'upload' && (
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
              >
                Choose Photo
              </button>
              {image && (
                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                >
                  Clear Photo
                </button>
              )}
            </div>
          )}

          {imageSourceMode === 'upload' && null}

          {imageSourceMode === 'url' && (
            <div className="pt-1">
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Paste direct image URL (https://...)"
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50 text-slate-900 outline-none focus:border-amber-600"
              />
            </div>
          )}
        </div>

        {/* Basic Suite Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Room Number
            </label>
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value.replace(/^#/, ''))}
              required
              placeholder="e.g. 101"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Category
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-900"
            >
              <option value="Deluxe Suite">Deluxe Suite</option>
              <option value="Garden Villa">Garden Villa</option>
              <option value="Ocean Grand Deluxe">Ocean Grand Deluxe</option>
              <option value="Presidential Penthouse">Presidential Penthouse</option>
              <option value="Executive">Executive</option>
              <option value="Standard">Standard</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Rate per Night (₹)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Max Guests
            </label>
            <input
              type="number"
              value={capacity}
              min="1"
              max="10"
              onChange={(e) => setCapacity(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'available' | 'occupied' | 'maintenance')}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-900 capitalize"
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key architectural highlights and view..."
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-medium"
          />
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-gold py-2 px-5 text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? 'Saving...' : room ? 'Update' : 'Add Room'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default RoomModal;