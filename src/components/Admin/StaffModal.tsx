'use client';
import React, { useState, useEffect } from 'react';
import { Staff } from '@/lib/features/staffSlice';
import Modal from '@/components/ui/Modal';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: Partial<Staff>) => Promise<void>;
  staff?: Staff | null;
}

export function StaffModal({ isOpen, onClose, onSave, staff }: StaffModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Receptionist');
  const [shift, setShift] = useState<'Morning' | 'Afternoon' | 'Night'>('Morning');
  const [status, setStatus] = useState<'Active' | 'On Leave' | 'Inactive'>('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (staff) {
      setName(staff.name || '');
      setEmail(staff.email || '');
      setRole(staff.role || 'Receptionist');
      setShift(staff.shift || 'Morning');
      setStatus(staff.status || 'Active');
    } else {
      setName('');
      setEmail('');
      setRole('Receptionist');
      setShift('Morning');
      setStatus('Active');
    }
  }, [staff, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        ...(staff ? { id: staff.id } : {}),
        name,
        email,
        role,
        shift,
        status,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={staff ? `Edit Staff` : 'Add Staff'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Liam Sterling"
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="liam@luxestay.com"
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-900"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Role / Designation
            </label>
            <input
              type="text"
              list="hotel-roles-list"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Concierge, Chef, Bartender..."
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-900"
            />
            <datalist id="hotel-roles-list">
              <option value="Receptionist" />
              <option value="Front Office Manager" />
              <option value="General Manager" />
              <option value="Assistant Manager" />
              <option value="Duty Manager" />
              <option value="Concierge" />
              <option value="Housekeeping Supervisor" />
              <option value="Housekeeper / Room Attendant" />
              <option value="Executive Chef" />
              <option value="Sous Chef" />
              <option value="Cook / Kitchen Staff" />
              <option value="Food & Beverage Captain" />
              <option value="Waiter / Waitress" />
              <option value="Bartender / Mixologist" />
              <option value="Valet & Bellhop" />
              <option value="Door Attendant" />
              <option value="Security Supervisor" />
              <option value="Security Officer" />
              <option value="Maintenance Engineer" />
              <option value="Electrician" />
              <option value="Plumber" />
              <option value="Spa Therapist" />
              <option value="Fitness Trainer" />
              <option value="Finance & Accounts" />
              <option value="IT Support" />
              <option value="Event Coordinator" />
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Shift
            </label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value as Staff['shift'])}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-900"
            >
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Night">Night</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Staff['status'])}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-900"
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-gold py-2 px-5 text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? 'Saving...' : staff ? 'Update Staff' : 'Add Staff'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default StaffModal;