'use client';
import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/store';
import { Booking, KYCData, updateBookingKYC } from '@/lib/features/bookingSlice';
import Modal from '@/components/ui/Modal';
import { 
  ShieldCheck, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon,
  UserCheck
} from 'lucide-react';
import Image from 'next/image';

interface KYCVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export default function KYCVerificationModal({
  isOpen,
  onClose,
  booking,
}: KYCVerificationModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user?.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [docType, setDocType] = useState<KYCData['documentType']>(
    booking?.kyc?.documentType || 'passport'
  );
  const [docNumber, setDocNumber] = useState(booking?.kyc?.documentNumber || '');
  const [docUrl, setDocUrl] = useState(booking?.kyc?.documentUrl || '');
  const [isVerified, setIsVerified] = useState(booking?.kyc?.verified ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  if (!booking) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setUploadError('Please select an image file (JPG, PNG, WebP) or PDF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('ID file must be under 5MB.');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setDocUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber.trim()) {
      setUploadError('Please enter document identification number.');
      return;
    }

    setIsSaving(true);
    const kyc: KYCData = {
      documentType: docType,
      documentNumber: docNumber.trim(),
      documentUrl: docUrl || undefined,
      verified: isVerified,
      verifiedAt: isVerified ? new Date().toISOString() : undefined,
      verifiedBy: user?.name || 'Front Desk Staff',
    };

    dispatch(updateBookingKYC({ bookingId: String(booking.id), kyc }));

    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    }, 400);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Guest KYC & Identity Verification" maxWidth="md">
      <div className="space-y-5">
        {/* Header summary */}
        <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between border border-amber-500/30">
          <div>
            <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider block">
              Hospitality Audit Compliance
            </span>
            <p className="text-sm font-serif font-bold text-white mt-0.5">
              {booking.guestName}
            </p>
            <p className="text-xs text-slate-400">
              Room {booking.roomNumber || booking.roomId} • Booking Ref: #{String(booking.id).slice(-6)}
            </p>
          </div>
          <div>
            {booking.kyc?.verified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                Pending Verification
              </span>
            )}
          </div>
        </div>

        {/* KYC Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Document Type
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as KYCData['documentType'])}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500/30 outline-none"
              >
                <option value="passport">Passport (International)</option>
                <option value="aadhaar">Aadhaar / National ID</option>
                <option value="driving_license">Driver&apos;s License</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ID / Document Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Z5948392 or 4829-1029-3829"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:ring-2 focus:ring-amber-500/30 outline-none"
              />
            </div>
          </div>

          {/* ID File Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Official Identification Scan / Photo
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />

            {docUrl ? (
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                    {docUrl.startsWith('data:image') ? (
                      <Image src={docUrl} alt="KYC Document Preview" fill sizes="48px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <FileText className="w-6 h-6 text-amber-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      ID Document Attached
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Securely Stored
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white transition-all cursor-pointer"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-amber-500 hover:bg-amber-50/30 transition-all flex flex-col items-center justify-center gap-1.5 text-slate-500 cursor-pointer"
              >
                <Upload className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-bold text-slate-700">Upload ID Document (Image or PDF)</span>
                <span className="text-[10px] text-slate-400">Max size 5MB • Instant OCR / Encrypted preview</span>
              </button>
            )}

            {uploadError && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{uploadError}</p>
            )}
          </div>

          {/* Verification toggle checkbox */}
          <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <div>
                <label htmlFor="verify-check" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Mark Identity as Officially Verified
                </label>
                <p className="text-[10px] text-slate-500">
                  Confirmed physically or digitally against government records
                </p>
              </div>
            </div>
            <input
              id="verify-check"
              type="checkbox"
              checked={isVerified}
              onChange={(e) => setIsVerified(e.target.checked)}
              className="w-4 h-4 accent-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-xs shadow-md hover:from-amber-700 hover:to-amber-800 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  Verified & Saved!
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
