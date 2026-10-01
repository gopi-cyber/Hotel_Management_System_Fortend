'use client';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store';
import { updateUserProfile } from '@/lib/features/userSlice';
import { toggleNightAudit } from '@/lib/features/settingsSlice';
import Modal from '@/components/ui/Modal';
import {
  UserCheck,
  Building,
  ShieldCheck,
  Clock,
  Mail,
  Phone,
  Radio,
  BellRing,
  Moon,
  Sun,
  Save,
  CheckCircle2,
  Camera,
  Sparkles,
  Award,
  IdCard,
} from 'lucide-react';
import Image from 'next/image';

interface StaffProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StaffProfileModal({ isOpen, onClose }: StaffProfileModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user?.user);
  const company = useSelector((state: RootState) => state.settings?.companyProfile);
  const nightAudit = useSelector((state: RootState) => state.settings?.nightAudit || false);

  const [formData, setFormData] = useState({
    name: user?.name || 'Staff Receptionist',
    email: user?.email || 'reception@luxestay.com',
    phone: user?.phone || '+91 98200 44101',
    avatarUrl:
      user?.avatarUrl ||
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    department: user?.department || 'Front Desk & Guest Services',
    shift: user?.shift || 'Morning Shift (06:00 - 15:00)',
    employeeId: user?.employeeId || 'STF-104',
  });

  const [activeTab, setActiveTab] = useState<'duty' | 'station' | 'settings'>('duty');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || 'Staff Receptionist',
        email: user.email || 'reception@luxestay.com',
        phone: user.phone || '+91 98200 44101',
        avatarUrl:
          user.avatarUrl ||
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        department: user.department || 'Front Desk & Guest Services',
        shift: user.shift || 'Morning Shift (06:00 - 15:00)',
        employeeId: user.employeeId || 'STF-104',
      });
      setSavedSuccess(false);
    }
  }, [isOpen]);

  const presetStaffAvatars = [
    {
      name: 'Front Desk Lead',
      url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Concierge Supervisor',
      url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Guest Experience Officer',
      url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const handleSave = () => {
    dispatch(
      updateUserProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        avatarUrl: formData.avatarUrl,
        department: formData.department,
        shift: formData.shift,
        employeeId: formData.employeeId,
      })
    );
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 4000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Front Desk & Hospitality Staff Profile"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('duty')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'duty'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserCheck size={16} />
            <span>Staff Credentials</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('station')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'station'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building size={16} />
            <span>Station & Property</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock size={16} />
            <span>Shift Controls</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Staff profile & duty credentials updated successfully!</span>
          </div>
        )}

        {/* TAB 1: STAFF CREDENTIALS */}
        {activeTab === 'duty' && (
          <div className="space-y-5">
            {/* Staff Card Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-5 rounded-2xl text-white flex flex-col sm:flex-row items-center sm:items-start gap-4 border border-slate-800 shadow-md">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md bg-slate-800 shrink-0">
                <Image
                  src={formData.avatarUrl}
                  alt={formData.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-lg font-bold font-display text-white">{formData.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 uppercase tracking-wider">
                    On Duty Active
                  </span>
                </div>
                <p className="text-xs text-amber-200/90 font-medium">
                  {formData.department} • ID: #{formData.employeeId}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  {formData.shift} • Station: Front Desk Counter A
                </p>
              </div>
            </div>

            {/* Avatar Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Choose Staff Photo Preset
              </label>
              <div className="grid grid-cols-3 gap-3">
                {presetStaffAvatars.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarUrl: preset.url })}
                    className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                      formData.avatarUrl === preset.url
                        ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-400/40'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                      <Image src={preset.url} alt={preset.name} fill sizes="32px" className="object-cover" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 truncate text-left">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Staff Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Staff Member Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Employee ID Number</label>
                <div className="relative">
                  <IdCard size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Front Desk & Guest Services">Front Desk & Guest Services</option>
                  <option value="Concierge & VIP Relations">Concierge & VIP Relations</option>
                  <option value="Reservations & Folio Billing">Reservations & Folio Billing</option>
                  <option value="Night Operations & Audit">Night Operations & Audit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Shift Schedule</label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Morning Shift (06:00 - 15:00)">Morning Shift (06:00 - 15:00)</option>
                  <option value="Evening Shift (14:00 - 23:00)">Evening Shift (14:00 - 23:00)</option>
                  <option value="Night Shift (22:00 - 07:00)">Night Shift (22:00 - 07:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Desk Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Intercom / Mobile Extension</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Custom Photo URL</label>
                <div className="relative">
                  <Camera size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    placeholder="https://example.com/staff.jpg"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STATION & PROPERTY */}
        {activeTab === 'station' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-display font-bold">
                  {company?.brandName?.[0] || 'L'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{company?.brandName || 'LuxeStay Palace'}</h4>
                  <p className="text-xs text-slate-500">{company?.address || 'Marine Drive, Mumbai'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Assigned Duty Desk:</span>
                  <span className="font-bold text-slate-800">Terminal 1 (Lobby Central)</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Walkie Channel:</span>
                  <span className="font-bold text-amber-700">Channel 3 (Front Office)</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Duty Manager on Shift:</span>
                  <span className="font-bold text-slate-800">Aditya Roy (Ext 901)</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Emergency Duty Hotline:</span>
                  <span className="font-bold text-rose-700">{company?.emergencyPhone || '+91 98200 99999'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/60 text-xs space-y-1">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-amber-700" />
                <span>Front Desk POS & Settlement Authority</span>
              </span>
              <p className="text-amber-800/80">
                Staff account authorized to check-in guests, assign RFID room keys, process service requests, and print legal GST folios.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: SHIFT CONTROLS & PREFERENCES */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  {nightAudit ? <Moon size={15} className="text-amber-600" /> : <Sun size={15} className="text-amber-500" />}
                  <span>Night Audit Theme Shift</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Switch the entire portal to dark high-contrast mode for night duty operations.
                </p>
              </div>

              <button
                type="button"
                onClick={() => dispatch(toggleNightAudit())}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  nightAudit
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {nightAudit ? 'Night Mode Active' : 'Day Mode Active'}
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <BellRing size={15} className="text-emerald-600" />
                  <span>Guest Request Bell Chimes</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Play subtle luxury chime audio whenever a new guest dining or housekeeping order arrives.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Enabled
              </span>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Staff settings are synced to your current session.
          </span>

          <div className="flex items-center gap-2">
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
              <span>Save Staff Profile</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
