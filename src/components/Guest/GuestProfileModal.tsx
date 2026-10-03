'use client';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store';
import { updateUserProfile } from '@/lib/features/userSlice';
import Modal from '@/components/ui/Modal';
import {
  User,
  Crown,
  HeartHandshake,
  Coffee,
  Sparkles,
  Bed,
  Thermometer,
  ShieldAlert,
  Save,
  CheckCircle2,
  Camera,
  Gift,
  Mail,
  Phone,
  Compass,
  Upload,
} from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';

interface GuestProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuestProfileModal({ isOpen, onClose }: GuestProfileModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user?.user);

  const [formData, setFormData] = useState({
    name: user?.name || user?.username || 'Valued Guest',
    email: user?.email || 'guest@luxestay.com',
    phone: user?.phone || '+91 98765 43210',
    avatarUrl: user?.avatarUrl || '',
    loyaltyTier: user?.loyaltyTier || 'Diamond Royal Guest',
    loyaltyPoints: user?.loyaltyPoints || 14250,
    dietaryPreference: user?.dietaryPreference || 'Pure Vegetarian',
    roomPreference: user?.roomPreference || 'High Floor Ocean View',
    pillowPreference: user?.pillowPreference || 'Goose Down Feather',
    temperaturePreference: user?.temperaturePreference || '21°C (Optimal Luxury)',
    emergencyContactName: user?.emergencyContactName || 'Ananya Sharma',
    emergencyContactPhone: user?.emergencyContactPhone || '+91 98111 22334',
  });

  const [activeTab, setActiveTab] = useState<'membership' | 'preferences' | 'emergency'>('membership');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || user.username || 'Valued Guest',
        email: user.email || 'guest@luxestay.com',
        phone: user.phone || '+91 98765 43210',
        avatarUrl: user.avatarUrl || '',
        loyaltyTier: user.loyaltyTier || 'Diamond Royal Guest',
        loyaltyPoints: user.loyaltyPoints || 14250,
        dietaryPreference: user.dietaryPreference || 'Pure Vegetarian',
        roomPreference: user.roomPreference || 'High Floor Ocean View',
        pillowPreference: user.pillowPreference || 'Goose Down Feather',
        temperaturePreference: user.temperaturePreference || '21°C (Optimal Luxury)',
        emergencyContactName: user.emergencyContactName || 'Ananya Sharma',
        emergencyContactPhone: user.emergencyContactPhone || '+91 98111 22334',
      });
      setSavedSuccess(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    dispatch(
      updateUserProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        avatarUrl: formData.avatarUrl,
        loyaltyTier: formData.loyaltyTier,
        loyaltyPoints: Number(formData.loyaltyPoints),
        dietaryPreference: formData.dietaryPreference,
        roomPreference: formData.roomPreference,
        pillowPreference: formData.pillowPreference,
        temperaturePreference: formData.temperaturePreference,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
      })
    );
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
      title="Guest Membership & Stay Preferences"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('membership')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'membership'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Crown size={16} />
            <span>VIP Loyalty & Identity</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'preferences'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles size={16} />
            <span>Stay Preferences</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('emergency')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'emergency'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <HeartHandshake size={16} />
            <span>Emergency & Billing</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Guest profile and hospitality preferences saved successfully!</span>
          </div>
        )}

        {/* TAB 1: VIP MEMBERSHIP & IDENTITY */}
        {activeTab === 'membership' && (
          <div className="space-y-5">
            {/* VIP Card Banner */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 p-5 rounded-2xl text-white flex flex-col sm:flex-row items-center sm:items-start gap-4 border border-amber-500/30 shadow-lg">
              <UserAvatar name={formData.name} avatarUrl={formData.avatarUrl} size="xl" />

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-lg font-bold font-display text-white">{formData.name}</h3>
                </div>
                <p className="text-xs text-amber-200/90 font-medium">
                  Loyalty Balance: <strong className="text-amber-300 font-display text-sm">{formData.loyaltyPoints.toLocaleString()} Points</strong>
                </p>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Guest Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">VIP Membership Tier</label>
                <div className="relative">
                  <Crown size={14} className="absolute left-3 top-3 text-amber-500" />
                  <select
                    value={formData.loyaltyTier}
                    onChange={(e) => setFormData({ ...formData, loyaltyTier: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Diamond Royal Guest">Diamond Royal Guest (Highest VIP)</option>
                    <option value="Gold Elite Member">Gold Elite Member</option>
                    <option value="Silver Club Resident">Silver Club Resident</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Registered Email Address</label>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Direct Mobile / WhatsApp</label>
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
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Upload Guest Photo from Device</label>
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

        {/* TAB 2: STAY & SUITE PREFERENCES */}
        {activeTab === 'preferences' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-900 font-medium">
              These preferences automatically configure your suite upon check-in and notify concierge housekeeping.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fine Dining & Dietary Style</label>
                <div className="relative">
                  <Coffee size={14} className="absolute left-3 top-3 text-slate-400" />
                  <select
                    value={formData.dietaryPreference}
                    onChange={(e) => setFormData({ ...formData, dietaryPreference: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Pure Vegetarian">Pure Vegetarian (Sattvic & Gourmet)</option>
                    <option value="Vegan Delights">Vegan Delights (Plant-Based)</option>
                    <option value="Gourmet Seafood & Coastal">Gourmet Seafood & Coastal</option>
                    <option value="Halal Certified">Halal Certified</option>
                    <option value="Gluten-Free Precision">Gluten-Free Precision</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Suite Location</label>
                <div className="relative">
                  <Compass size={14} className="absolute left-3 top-3 text-slate-400" />
                  <select
                    value={formData.roomPreference}
                    onChange={(e) => setFormData({ ...formData, roomPreference: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="High Floor Ocean View">High Floor Ocean View (Panoramic)</option>
                    <option value="Quiet Garden Sanctuary">Quiet Garden Sanctuary (Secluded)</option>
                    <option value="Close to Elevator / Access">Close to Elevator / Accessible</option>
                    <option value="Penthouse Corner Suite">Penthouse Corner Suite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Custom Pillow Menu</label>
                <div className="relative">
                  <Bed size={14} className="absolute left-3 top-3 text-slate-400" />
                  <select
                    value={formData.pillowPreference}
                    onChange={(e) => setFormData({ ...formData, pillowPreference: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Goose Down Feather">Goose Down Feather (Ultra Soft)</option>
                    <option value="Memory Foam Orthopedic">Memory Foam Orthopedic (Contoured)</option>
                    <option value="Hypoallergenic Microfiber">Hypoallergenic Microfiber</option>
                    <option value="Mulberry Silk Therapeutic">Mulberry Silk Therapeutic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Suite Climate Preference</label>
                <div className="relative">
                  <Thermometer size={14} className="absolute left-3 top-3 text-slate-400" />
                  <select
                    value={formData.temperaturePreference}
                    onChange={(e) => setFormData({ ...formData, temperaturePreference: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="19°C (Cool & Crisp)">19°C (Cool & Crisp)</option>
                    <option value="21°C (Optimal Luxury)">21°C (Optimal Luxury Standard)</option>
                    <option value="23°C (Warm Ambient)">23°C (Warm Ambient)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EMERGENCY & BILLING */}
        {activeTab === 'emergency' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Full Name</label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-slate-900">Hotel Guest Support</span>
              <p className="text-slate-600">
                Your emergency contact details are kept strictly private under the LuxeStay Hospitality Trust Guarantee and accessed only in medical or flight rerouting emergencies.
              </p>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Saved to your personal stay record.
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
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
