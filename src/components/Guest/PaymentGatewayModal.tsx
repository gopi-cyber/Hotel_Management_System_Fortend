'use client';
import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { formatPrice } from '@/lib/features/settingsSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Room } from '@/lib/features/roomSlice';
import {
  QrCode,
  CreditCard,
  Building,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Smartphone,
  Lock,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  nights: number;
  totalAmount: number;
  paymentMethod: 'upi' | 'card' | 'arrival';
  onPaymentSuccess: (transactionDetails: {
    transactionId: string;
    methodLabel: string;
    paidStatus: 'paid' | 'pending';
  }) => void;
}

export default function PaymentGatewayModal({
  isOpen,
  onClose,
  room,
  nights,
  totalAmount,
  paymentMethod,
  onPaymentSuccess,
}: PaymentGatewayModalProps) {
  const { currency } = useSelector((state: RootState) => state.settings || { currency: 'INR' });
  const { user } = useSelector((state: RootState) => state.user || { user: null });

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [selectedApp, setSelectedApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'cred'>('gpay');

  // Countdown timer for QR code (5 minutes)
  const [timeLeft, setTimeLeft] = useState(300);

  // Card form state
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardHolder, setCardHolder] = useState(user?.name || 'ALEX MORGAN');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('•••');

  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false);
      setPaymentDone(false);
      setTimeLeft(300);
      return;
    }

    if (paymentMethod === 'upi') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, paymentMethod]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCompletePayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentDone(true);

      const txnId =
        paymentMethod === 'upi'
          ? `UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`
          : paymentMethod === 'card'
          ? `CARD-AUTH-${Math.floor(100000 + Math.random() * 900000)}`
          : `RES-VOUCHER-${Math.floor(10000 + Math.random() * 90000)}`;

      const methodLabel =
        paymentMethod === 'upi'
          ? 'Instant UPI / QR'
          : paymentMethod === 'card'
          ? 'Encrypted Luxury Card'
          : 'Pay on Arrival / Hotel Check-in';

      setTimeout(() => {
        onPaymentSuccess({
          transactionId: txnId,
          methodLabel,
          paidStatus: paymentMethod === 'arrival' ? 'pending' : 'paid',
        });
      }, 1000);
    }, 1800);
  };

  // Generate UPI QR SVG representation dynamically
  const upiId = 'luxestay.palace@hdfcbank';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${upiId}%26pn=LuxeStay%20Palace%26am=${totalAmount}%26cu=${currency}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        paymentMethod === 'upi'
          ? 'Scan & Pay via UPI / QR'
          : paymentMethod === 'card'
          ? 'Encrypted Card Settlement'
          : 'Guaranteed Reservation Guarantee'
      }
      subtitle={`Total Settlement: ${formatPrice(totalAmount, currency)} for Suite #${room.roomNumber || room.number || room.id}`}
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Header Summary Pill */}
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between border border-amber-500/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400">
                {room.name || room.type}
              </span>
              <span className="text-[11px] text-slate-400">• {nights} Night(s)</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Guest: <span className="text-white font-medium">{user?.name || user?.username}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Total Payable</span>
            <span className="text-lg font-bold text-emerald-400 font-display">
              {formatPrice(totalAmount, currency)}
            </span>
          </div>
        </div>

        {/* ────────────────── METHOD 1: UPI & QR SCANNER ────────────────── */}
        {paymentMethod === 'upi' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col items-center text-center">
              <div className="flex items-center justify-between w-full mb-3 px-1 text-xs">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-amber-700" />
                  Official LuxeStay VPA
                </span>
                <span className="font-mono text-amber-900 font-bold bg-amber-200/60 px-2 py-0.5 rounded-md">
                  {upiId}
                </span>
              </div>

              {/* QR Code Graphic Frame */}
              <div className="relative p-3 bg-white rounded-2xl shadow-md border border-slate-200 group">
                <img
                  src={qrUrl}
                  alt="UPI Payment QR Code"
                  className="w-44 h-44 object-contain rounded-xl"
                />
                <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-amber-500 pointer-events-none animate-pulse" />
              </div>

              <div className="flex items-center gap-2 mt-3 text-xs text-slate-600 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                <span>QR expires in <strong className="text-amber-900 font-mono">{formatTimer(timeLeft)}</strong></span>
              </div>
            </div>

            {/* UPI Apps Supported */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                Supported Mobile UPI Apps
              </label>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {[
                  { id: 'gpay', label: 'Google Pay', color: 'text-blue-600' },
                  { id: 'phonepe', label: 'PhonePe', color: 'text-purple-600' },
                  { id: 'paytm', label: 'Paytm', color: 'text-sky-600' },
                  { id: 'cred', label: 'CRED UPI', color: 'text-slate-900' },
                ].map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedApp(app.id as any)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      selectedApp === app.id
                        ? 'border-amber-600 bg-amber-50 ring-1 ring-amber-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className={`w-4 h-4 mx-auto mb-1 ${app.color}`} />
                    <span className="font-bold text-[11px] block text-slate-800">{app.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ────────────────── METHOD 2: CREDIT / DEBIT CARD ────────────────── */}
        {paymentMethod === 'card' && (
          <div className="space-y-4">
            {/* Realistic Luxury Golden Card Mockup */}
            <div className="w-full h-44 rounded-2xl p-5 bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950 text-white border border-amber-500/40 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between relative z-10">
                <span className="font-serif italic tracking-wider text-amber-300 font-bold text-sm">
                  LuxeStay Concierge Card
                </span>
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>

              {/* EMV Chip & Contactless */}
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-7 rounded-md bg-linear-to-r from-amber-300 to-amber-500 border border-amber-200/50 shadow-inner flex items-center justify-center">
                  <div className="w-7 h-5 border border-amber-800/40 rounded-xs" />
                </div>
                <span className="text-xs tracking-widest text-slate-400 font-mono">))))</span>
              </div>

              <div className="relative z-10 space-y-1">
                <div className="font-mono text-base tracking-widest text-amber-100">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono uppercase">
                  <span>{cardHolder || 'CARDHOLDER NAME'}</span>
                  <span>EXP: {cardExpiry || 'MM/YY'}</span>
                </div>
              </div>
            </div>

            {/* Form Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4532 8920 1829 8821"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:ring-2 focus:ring-amber-500/30 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="ALEX MORGAN"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs uppercase font-medium focus:ring-2 focus:ring-amber-500/30 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Expiry
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="08/28"
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-mono text-center focus:ring-2 focus:ring-amber-500/30 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="882"
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-mono text-center focus:ring-2 focus:ring-amber-500/30 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ────────────────── METHOD 3: PAY AT HOTEL ────────────────── */}
        {paymentMethod === 'arrival' && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
              <Building className="w-5 h-5 text-amber-700" />
              <span>Official Check-in Guarantee Voucher</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your suite is immediately reserved in LuxeStay&apos;s central PMS. No immediate credit or digital charge is debited right now.
            </p>
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1 text-slate-700">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                <Check className="w-4 h-4" /> Zero Upfront Payment Required
              </div>
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <Check className="w-4 h-4 text-emerald-700" /> Pay via Cash, Card, or UPI during Front Desk Check-in
              </div>
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <Check className="w-4 h-4 text-emerald-700" /> Free cancellation up to 24 hours prior to arrival
              </div>
            </div>
          </div>
        )}

        {/* Security & Regulatory Assurance */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted Hospitality Checkout</span>
          </div>
          <span className="font-semibold text-slate-700">RBI & PCI-DSS Compliant</span>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isProcessing || paymentDone}
            onClick={handleCompletePayment}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            {paymentDone ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                Payment Authorized!
              </>
            ) : isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Verifying Transaction...
              </>
            ) : paymentMethod === 'upi' ? (
              <>
                <Smartphone className="w-4 h-4" />
                I Have Paid via UPI / QR <ArrowRight size={14} />
              </>
            ) : paymentMethod === 'card' ? (
              <>
                <CreditCard className="w-4 h-4" />
                Authorize & Pay {formatPrice(totalAmount, currency)} <ArrowRight size={14} />
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Confirm Guaranteed Reservation <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
