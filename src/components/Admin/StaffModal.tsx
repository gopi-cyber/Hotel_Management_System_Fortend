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
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleText, setCustomRoleText] = useState('');
  const [shift, setShift] = useState<'Morning' | 'Afternoon' | 'Night'>('Morning');
  const [department, setDepartment] = useState('Front Desk & Guest Services');
  const [status, setStatus] = useState<'Active' | 'On Leave' | 'Inactive'>('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const predefinedRoles = [
    'Receptionist',
    'Front Office Manager',
    'General Manager',
    'Assistant Manager',
    'Duty Manager',
    'Concierge',
    'Housekeeping Supervisor',
    'Housekeeper / Room Attendant',
    'Executive Chef',
    'Sous Chef',
    'Cook / Kitchen Staff',
    'Food & Beverage Captain',
    'Waiter / Waitress',
    'Bartender / Mixologist',
    'Valet & Bellhop',
    'Door Attendant',
    'Security Supervisor',
    'Security Officer',
    'Maintenance Engineer',
    'Electrician',
    'Plumber',
    'Spa Therapist',
    'Fitness Trainer',
    'Finance & Accounts',
    'IT Support',
    'Event Coordinator',
  ];

  useEffect(() => {
    if (staff) {
      setName(staff.name || '');
      setEmail(staff.email || '');
      const existingRole = staff.role || 'Receptionist';
      setShift(staff.shift || 'Morning');
      setDepartment(staff.department || 'Front Desk & Guest Services');
      setStatus(staff.status || 'Active');
      if (predefinedRoles.includes(existingRole)) {
        setRole(existingRole);
        setIsCustomRole(false);
        setCustomRoleText('');
      } else {
        setRole('custom');
        setIsCustomRole(true);
        setCustomRoleText(existingRole);
      }
    } else {
      setName('');
      setEmail('');
      setRole('Receptionist');
      setIsCustomRole(false);
      setCustomRoleText('');
      setShift('Morning');
      setDepartment('Front Desk & Guest Services');
      setStatus('Active');
    }
  }, [staff, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalRole = isCustomRole ? customRoleText.trim() || 'Staff' : role;
    setIsSubmitting(true);
    try {
      await onSave({
        ...(staff ? { id: staff.id } : {}),
        name,
        email,
        role: finalRole,
        department,
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

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Department
          </label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g. Front Desk & Guest Services"
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-900"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Role / Designation
            </label>
            <select
              value={isCustomRole ? 'custom' : role}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setIsCustomRole(true);
                  setRole('custom');
                } else {
                  setIsCustomRole(false);
                  setRole(e.target.value);
                }
              }}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-900 mb-2 cursor-pointer"
            >
              {predefinedRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
              <option value="custom">+ Custom Role...</option>
            </select>

            {isCustomRole && (
              <input
                type="text"
                value={customRoleText}
                onChange={(e) => setCustomRoleText(e.target.value)}
                placeholder="Type custom role or designation..."
                required
                autoFocus
                className="w-full px-3 py-2 text-sm rounded-xl border border-amber-300 bg-amber-50/50 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            )}
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
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default StaffModal;