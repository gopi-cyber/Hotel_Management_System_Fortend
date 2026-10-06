'use client';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { updateCompanyProfile, CompanyProfile, DEFAULT_COMPANY_PROFILE } from '@/lib/features/settingsSlice';
import Modal from '@/components/ui/Modal';
import ChangePasswordModal from '@/components/ui/ChangePasswordModal';
import {
  Building2,
  ShieldCheck,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Percent,
  CheckCircle2,
  Save,
  Printer,
  Sparkles,
  Camera,
  Globe,
  Award,
  FileBadge,
  PhoneCall,
  KeyRound,
  Upload,
} from 'lucide-react';
import Image from 'next/image';
import UserAvatar from '@/components/ui/UserAvatar';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminProfileModal({ isOpen, onClose }: AdminProfileModalProps) {
  const dispatch = useDispatch();
  const savedProfile = useSelector((state: RootState) => state.settings?.companyProfile || DEFAULT_COMPANY_PROFILE);
  const currentUser = useSelector((state: RootState) => state.user?.user);

  const [formData, setFormData] = useState<CompanyProfile>(savedProfile);
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'operations'>('profile');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  // Sync state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData(savedProfile);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  const handleChange = (field: keyof CompanyProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateCompanyProfile(formData));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 4000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'adminAvatarUrl' | 'logoUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please select a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleChange(field, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Admin Profile"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <User size={16} />
            <span>Admin Executive</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('company')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'company'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 size={16} />
            <span>Company & Logo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('operations')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'operations'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck size={16} />
            <span>Hotel Operations</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Corporate Profile and Brand details saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* TAB 1: ADMIN EXECUTIVE PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {/* Header Badge Card */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-5 rounded-2xl text-white flex flex-col sm:flex-row items-center sm:items-start gap-4 border border-slate-800 shadow-md">
                <div className="relative group shrink-0">
                  <UserAvatar name={formData.adminName} avatarUrl={formData.adminAvatarUrl} size="xl" />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-lg font-bold font-display text-white">{formData.adminName}</h3>
                  </div>
                  <p className="text-xs text-amber-200/90 font-medium">{formData.adminTitle}</p>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Admin Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={formData.adminName}
                      onChange={(e) => handleChange('adminName', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role / Title</label>
                  <div className="relative">
                    <Award size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={formData.adminTitle}
                      onChange={(e) => handleChange('adminTitle', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Executive Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      value={formData.adminEmail}
                      onChange={(e) => handleChange('adminEmail', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Direct Phone / Hotkey</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={formData.adminPhone}
                      onChange={(e) => handleChange('adminPhone', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Upload Executive Photo from Device</label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-colors shadow-xs">
                      <Upload size={14} className="text-amber-600" />
                      <span>Choose Crest / Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'adminAvatarUrl')}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPANY & LOGO DETAIL */}
          {activeTab === 'company' && (
            <div className="space-y-5">
              {/* Hotel Brand Logo Preview Card */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-300 shadow-sm shrink-0 bg-white flex items-center justify-center p-2">
                  {formData.logoUrl ? (
                    <Image
                      src={formData.logoUrl}
                      alt={formData.brandName}
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 font-bold text-xs text-center">
                      No Logo
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <h4 className="text-base font-bold font-display text-slate-900">{formData.brandName}</h4>
                  <p className="text-xs text-slate-600 font-medium">{formData.companyName}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-[10px] font-bold">
                      {formData.starRating}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-200 text-slate-800 text-[10px] font-bold font-mono">
                      GSTIN: {formData.gstin}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Hotel Logo</label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-colors shadow-xs">
                    <Upload size={14} className="text-amber-600" />
                    <span>Choose Logo File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'logoUrl')}
                    />
                  </label>
                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={() => handleChange('logoUrl', '')}
                      className="text-xs text-rose-600 font-bold hover:underline"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>

              {/* Company Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hotel Brand Name</label>
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={(e) => handleChange('brandName', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Registered Entity</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GST Number</label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => handleChange('gstin', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Registration Number</label>
                  <input
                    type="text"
                    value={formData.cin}
                    onChange={(e) => handleChange('cin', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hotel Address</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HOTEL OPERATIONS & CONTACTS */}
          {activeTab === 'operations' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Help Desk Phone</label>
                  <input
                    type="text"
                    value={formData.conciergePhone}
                    onChange={(e) => handleChange('conciergePhone', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Phone (24/7)</label>
                  <input
                    type="text"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hotel Star Rating</label>
                  <input
                    type="text"
                    value={formData.starRating}
                    onChange={(e) => handleChange('starRating', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Check-in Time</label>
                  <input
                    type="text"
                    value={formData.checkInTime}
                    onChange={(e) => handleChange('checkInTime', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Check-out Time</label>
                  <input
                    type="text"
                    value={formData.checkOutTime}
                    onChange={(e) => handleChange('checkOutTime', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setPwOpen(true)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <KeyRound size={14} />
              Change Password
            </button>

            <div className="flex items-center gap-2">
              {pwSaved && <span className="text-xs font-bold text-emerald-600">Password updated</span>}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="btn-gold px-5 py-2 text-xs font-bold inline-flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Save size={14} />
                <span>Save</span>
              </button>
            </div>
          </div>
        </form>

        <ChangePasswordModal
          isOpen={pwOpen}
          onClose={() => setPwOpen(false)}
          userId={currentUser?.id || ''}
          userLabel={currentUser?.name || currentUser?.username}
          onSaved={() => {
            setPwSaved(true);
            setTimeout(() => setPwSaved(false), 4000);
          }}
        />
      </div>
    </Modal>
  );
}
