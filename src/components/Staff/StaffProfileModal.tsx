'use client';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store';
import { updateUserProfile } from '@/lib/features/userSlice';
import { toggleNightAudit } from '@/lib/features/settingsSlice';
import { syncStaffProfile, updateStaff, Staff } from '@/lib/features/staffSlice';
import Modal from '@/components/ui/Modal';
import {
  UserCheck,
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
  Upload,
} from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';

interface StaffProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StaffProfileModal({ isOpen, onClose }: StaffProfileModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user?.user);
  const staffList = useSelector((state: RootState) => state.staff?.items || []);
  const company = useSelector((state: RootState) => state.settings?.companyProfile);
  const nightAudit = useSelector((state: RootState) => state.settings?.nightAudit || false);

  const [formData, setFormData] = useState({
    name: user?.name || 'Staff Receptionist',
    email: user?.email || 'reception@luxestay.com',
    phone: user?.phone || '+91 98200 44101',
    avatarUrl: user?.avatarUrl || '',
    department: user?.department || 'Front Desk & Guest Services',
    shift: user?.shift || 'Morning Shift (06:00 - 15:00)',
    employeeId: user?.employeeId || 'STF-104',
  });

  const [activeTab, setActiveTab] = useState<'duty' | 'settings'>('duty');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || 'Staff Receptionist',
        email: user.email || 'reception@luxestay.com',
        phone: user.phone || '+91 98200 44101',
        avatarUrl: user.avatarUrl || '',
        department: user.department || 'Front Desk & Guest Services',
        shift: user.shift || 'Morning Shift (06:00 - 15:00)',
        employeeId: user.employeeId || 'STF-104',
      });
      setSavedSuccess(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    const oldName = user?.name;
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

    // Sync to admin staff roster
    dispatch(
      syncStaffProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        oldName,
      })
    );

    const matchedStaff = staffList.find(
      (s: Staff) =>
        (user?.id && String(s.id) === String(user.id)) ||
        (oldName && s.name.toLowerCase() === oldName.toLowerCase()) ||
        (s.role?.toLowerCase().includes('reception') || s.role?.toLowerCase().includes('front desk'))
    );
    if (matchedStaff) {
      dispatch(
        updateStaff({
          ...matchedStaff,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        })
      );
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 4000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please select a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
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
              <UserAvatar name={formData.name} avatarUrl={formData.avatarUrl} size="xl" />

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-lg font-bold font-display text-white">{formData.name}</h3>
                </div>
                <p className="text-xs text-amber-200/90 font-medium">
                  {formData.department}
                </p>
              </div>
            </div>

            {/* Staff Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Name</label>
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
                <input
                  type="text"
                  value={formData.department}
                  readOnly
                  placeholder="Set by Admin"
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Schedule</label>
                <input
                  type="text"
                  value={formData.shift}
                  readOnly
                  placeholder="Set by Admin"
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="10-digit mobile number"
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Upload Staff Photo from Device</label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-colors shadow-xs">
                    <Upload size={14} className="text-amber-600" />
                    <span>Choose Photo File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: STAFF CREDENTIALS */}

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
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
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
    </Modal>
  );
}
