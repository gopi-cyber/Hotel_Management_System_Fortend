'use client';
import React, { useEffect, useState } from 'react';
import { KeyRound } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | number;
  userLabel?: string;
  onSaved?: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose, userId, userLabel, onSaved }: ChangePasswordModalProps) {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setError('');
      setSaving(false);
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!currentPw.trim()) {
      setError('Enter your current password.');
      return;
    }
    if (newPw.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (!/[A-Z]/.test(newPw) || !/[a-z]/.test(newPw) || !/[0-9]/.test(newPw) ||
        !/[@$!%*?&_#^~()+\-=[\]{}|;:'",.<>/?]/.test(newPw)) {
      setError('Use uppercase, lowercase, number and special character.');
      return;
    }
    if (newPw !== confirmPw) {
      setError('Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, currentPassword: currentPw, password: newPw }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      onSaved?.();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <KeyRound className="text-amber-600" size={20} />
            Change Password
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
          >
            ✕
          </button>
        </div>
        <p className="text-xs text-slate-500">
          You are changing the password for{' '}
          <strong className="text-slate-800">{userLabel || 'your account'}</strong>. Your current password is required.
        </p>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Current Password</label>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Enter your current password"
              autoComplete="current-password"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">New Password</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="New password"
                autoComplete="new-password"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
                autoComplete="new-password"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Minimum 6 characters with uppercase, lowercase, number and special character.
          </p>
          {error && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
