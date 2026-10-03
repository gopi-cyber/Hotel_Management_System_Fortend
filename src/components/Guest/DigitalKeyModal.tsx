'use client';
import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import {
  KeyRound,
  Wifi,
  CheckCircle2,
  Lock,
  Unlock,
  Sparkles,
  ShieldCheck,
  Bell,
  Hotel,
  Volume2,
} from 'lucide-react';
import { Booking } from '@/lib/features/bookingSlice';

interface DigitalKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking | null;
  roomNumber?: string;
  guestName?: string;
}

export default function DigitalKeyModal({
  isOpen,
  onClose,
  booking,
  roomNumber = '304',
  guestName = 'Valued Guest',
}: DigitalKeyModalProps) {
  const [keyState, setKeyState] = useState<'idle' | 'scanning' | 'unlocked'>('idle');
  const [dndActive, setDndActive] = useState(false);

  // Play audio chime using Web Audio API synth
  const playUnlockSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      // Tone 1: High crisp bell
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Tone 2: Harmonic resolution
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1320, now + 0.15); // E6
      gain2.gain.setValueAtTime(0.25, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.8);
    } catch {
      // AudioContext not allowed or unsupported
    }
  };

  const handleUnlockTap = () => {
    if (keyState === 'scanning' || keyState === 'unlocked') return;

    setKeyState('scanning');

    setTimeout(() => {
      setKeyState('unlocked');
      playUnlockSound();

      setTimeout(() => {
        setKeyState('idle');
      }, 5000);
    }, 1200);
  };

  const displayRoom = booking?.roomNumber || booking?.roomId || roomNumber;
  const displayName = booking?.guestName || guestName;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Digital Key & NFC Suite Access" maxWidth="md">
      <div className="space-y-6">
        {/* Virtual Smart NFC Card */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#1e1b4b] via-[#0f172a] to-[#020617] p-6 text-white shadow-2xl border border-amber-500/30">
          {/* Card background watermarks */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

          {/* Card Top Brand & NFC chip */}
          <div className="flex items-center justify-between relative z-10 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-md shadow-amber-500/20">
                <Hotel className="text-slate-950" size={16} />
              </div>
              <div>
                <span className="font-display font-bold text-sm tracking-tight text-white block">LuxeStay</span>
                <span className="text-[9px] uppercase tracking-widest text-amber-400 font-bold block">Digital Keycard</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] text-amber-300 font-bold">
              <Wifi size={12} className="rotate-90 animate-pulse text-amber-400" />
              <span>NFC Active</span>
            </div>
          </div>

          {/* Interactive Tap-to-Unlock Circle */}
          <div className="my-8 flex flex-col items-center justify-center relative z-10">
            <button
              type="button"
              onClick={handleUnlockTap}
              disabled={keyState === 'scanning'}
              className={`relative w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                keyState === 'unlocked'
                  ? 'bg-emerald-500/20 border-2 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.4)]'
                  : keyState === 'scanning'
                  ? 'bg-amber-500/20 border-2 border-amber-400 animate-pulse shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                  : 'bg-white/5 hover:bg-white/10 border-2 border-amber-500/50 hover:border-amber-400 active:scale-95'
              }`}
            >
              {/* Concentric pulse animation */}
              {keyState === 'scanning' && (
                <div className="absolute inset-0 rounded-full border-2 border-amber-400 animate-ping opacity-40 pointer-events-none" />
              )}
              {keyState === 'unlocked' && (
                <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-30 pointer-events-none" />
              )}

              {keyState === 'unlocked' ? (
                <>
                  <Unlock size={38} className="text-emerald-400 mb-1" />
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Unlocked!</span>
                  <span className="text-[10px] text-emerald-400/80">Turn Handle</span>
                </>
              ) : keyState === 'scanning' ? (
                <>
                  <KeyRound size={34} className="text-amber-400 mb-1 animate-bounce" />
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Reading...</span>
                  <span className="text-[10px] text-amber-400/80">Keep Near Lock</span>
                </>
              ) : (
                <>
                  <Lock size={34} className="text-amber-400 mb-1" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Tap To Unlock</span>
                  <span className="text-[10px] text-amber-400/80">Hold Near Reader</span>
                </>
              )}
            </button>

            <p className="mt-4 text-xs font-semibold text-center text-slate-300">
              {keyState === 'unlocked'
                ? 'Door latch released. Relocking automatically in 5s.'
                : keyState === 'scanning'
                ? 'Transmitting encrypted RFID credentials to door strike...'
                : 'Touch button or position phone near the suite door lock.'}
            </p>
          </div>

          {/* Card Bottom: Suite & Guest Data */}
          <div className="pt-4 border-t border-white/10 flex items-end justify-between relative z-10">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Suite Assigned</span>
              <span className="font-display text-2xl font-bold text-white">#{displayRoom}</span>
              <span className="text-[11px] text-amber-300 font-semibold block truncate max-w-[170px]">{displayName}</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Encrypted Token</span>
              <span className="text-[11px] font-mono text-slate-300">NFC-AES256</span>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold mt-0.5 justify-end">
                <ShieldCheck size={12} />
                <span>Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* In-Suite Quick Amenities Controls */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
            Room {String(displayRoom).replace(/^#/, '')} Smart Controls
          </span>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDndActive(!dndActive)}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                dndActive
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>Do Not Disturb</span>
              <span className={`w-2.5 h-2.5 rounded-full ${dndActive ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`} />
            </button>

            <button
              type="button"
              onClick={handleUnlockTap}
              className="p-3 rounded-xl border bg-white border-slate-200 hover:border-amber-400 text-slate-700 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
            >
              <span>Test Door Sound</span>
              <Volume2 size={15} className="text-amber-600" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
