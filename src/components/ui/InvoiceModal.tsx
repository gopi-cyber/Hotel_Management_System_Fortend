'use client';
import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { formatPrice } from '@/lib/features/settingsSlice';
import Modal from './Modal';
import { Printer, Download, CheckCircle, ShieldCheck, Hotel, Sparkles, Building2 } from 'lucide-react';
import Image from 'next/image';

export interface InvoiceBooking {
  id: string | number;
  guestName: string;
  guestEmail?: string;
  roomId?: string | number;
  roomNumber?: string;
  roomType?: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  nights?: number;
  status: string;
  paymentMethod?: string;
  createdAt?: string;
  incidentalCharges?: Array<{
    id: string;
    title: string;
    category: string;
    amount: number;
    date: string;
  }>;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: InvoiceBooking | null;
}

export function InvoiceModal({ isOpen, onClose, booking }: InvoiceModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const currency = useSelector((state: RootState) => state.settings?.currency || 'INR');
  const company = useSelector((state: RootState) => state.settings?.companyProfile);

  if (!booking) return null;

  const nights = booking.nights || 1;
  const totalPrice = Number(booking.totalPrice) || 0;
  const incidentals = booking.incidentalCharges || [];
  const incidentalsTotal = incidentals.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  
  // Tax & breakdown calculations
  // Total = Base (89.28%) + CGST (5.36%) + SGST (5.36%) = 100% (12% GST inclusive)
  const roomBase = Math.round((totalPrice - incidentalsTotal) / 1.12);
  const incidentalsBase = Math.round(incidentalsTotal / 1.12);
  const baseTariff = roomBase + incidentalsBase;
  const gstTotal = totalPrice - baseTariff;
  const cgst = Math.round(gstTotal / 2);
  const sgst = gstTotal - cgst;
  const nightlyBase = Math.round(roomBase / nights);

  const handlePrint = () => {
    window.print();
  };

  const invoiceNo = `LX-${String(booking.id).padStart(5, '0')}`;
  const issueDate = booking.createdAt 
    ? new Date(booking.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Hotel Bill & Tax Invoice`}
      subtitle={`Official settlement statement #${invoiceNo}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Printable Folio Document */}
        <div 
          ref={invoiceRef}
          id="printable-invoice"
          className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0"
        >
          {/* Header & Crest */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                {company?.logoUrl ? (
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                    <Image
                      src={company.logoUrl}
                      alt={company.brandName}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <span className="w-8 h-8 rounded-lg bg-slate-950 text-amber-400 flex items-center justify-center font-bold font-display text-lg">
                    L
                  </span>
                )}
                <span className="text-xl font-bold font-display tracking-tight text-slate-950 uppercase">
                  {company?.brandName || 'LuxeStay Palace'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {company?.address || 'Marine Drive, Nariman Point, Mumbai 400021, India'}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                GSTIN: {company?.gstin || '27AABCL8842K1ZZ'} | CIN: {company?.cin || 'U55101MH2021PTC384910'}
              </p>
            </div>

            <div className="sm:text-right space-y-0.5">
              <span className="inline-block px-3 py-1 bg-amber-50 border border-amber-300/60 rounded-full text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                Invoice
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1">Invoice {invoiceNo}</p>
              <p className="text-[11px] text-slate-500">Date of Issue: {issueDate}</p>
            </div>
          </div>

          {/* Guest & Reservation Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Billed To (Guest Details)
              </span>
              <p className="font-bold text-slate-900 text-sm">{booking.guestName}</p>
              {booking.guestEmail && <p className="text-slate-500">{booking.guestEmail}</p>}
              <p className="text-slate-600">
                Reservation Ref: <strong className="text-slate-900">RES-{booking.id}</strong>
              </p>
            </div>

            <div className="space-y-1.5 sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Stay Itinerary
              </span>
              <p className="font-bold text-slate-900">
                Suite: {booking.roomType || 'Deluxe Luxury Suite'} ({booking.roomNumber ? `Room ${String(booking.roomNumber).replace(/^#/, '')}` : `Room ${String(booking.roomId).replace(/^#/, '')}`})
              </p>
              <p className="text-slate-600">
                Check-in: <strong>{booking.checkInDate}</strong>
              </p>
              <p className="text-slate-600">
                Check-out: <strong>{booking.checkOutDate}</strong> ({nights} {nights === 1 ? 'Night' : 'Nights'})
              </p>
            </div>
          </div>

          {/* Itemized Charges Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-center">Qty / Nights</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block">
                      {booking.roomType || 'Room Stay Charges'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Complimentary high-speed WiFi, breakfast & butler concierge
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-semibold">{nights}</td>
                  <td className="py-3 px-3 text-right font-medium">{formatPrice(nightlyBase, currency)}</td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-900">
                    {formatPrice(roomBase, currency)}
                  </td>
                </tr>
                {incidentals.map((charge) => {
                  const chargeBase = Math.round(Number(charge.amount || 0) / 1.12);
                  return (
                    <tr key={charge.id} className="bg-amber-50/20">
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-800 block">
                          {charge.title}
                        </span>
                        <span className="text-[10px] text-amber-700 uppercase tracking-wider font-semibold">
                          Incidental • {charge.category} • {new Date(charge.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-medium">1</td>
                      <td className="py-2.5 px-3 text-right font-medium">{formatPrice(chargeBase, currency)}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                        {formatPrice(chargeBase, currency)}
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td className="py-2.5 px-3 text-slate-600">Central GST (CGST @ 6%)</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">—</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                  <td className="py-2.5 px-3 text-right font-medium">{formatPrice(cgst, currency)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-slate-600">State GST (SGST @ 6%)</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">—</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                  <td className="py-2.5 px-3 text-right font-medium">{formatPrice(sgst, currency)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-amber-50/60 font-bold text-slate-900 border-t-2 border-slate-200">
                  <td colSpan={3} className="py-3 px-3 text-right uppercase tracking-wider text-xs">
                    Grand Total Settlement:
                  </td>
                  <td className="py-3 px-3 text-right text-base font-display text-amber-900">
                    {formatPrice(totalPrice, currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Verification Stamp & Settlement Status */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-slate-200 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <span>PAYMENT SETTLED & VERIFIED</span>
                  <CheckCircle size={14} />
                </div>
                <p className="text-[11px] text-slate-500">
                  Method: {booking.paymentMethod || 'Online Payment'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">Auth Token: LX-AUTH-{booking.id}-OK</p>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 sm:text-right">
              <p className="font-semibold text-slate-600">Authorized Signature & Seal</p>
              <p className="font-display italic text-amber-700 font-bold text-sm">LuxeStay Hospitality Registrar</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="btn-gold py-2.5 px-5 text-xs inline-flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
            >
              <Printer size={15} />
              Print / Save as PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 w-full sm:w-auto cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default InvoiceModal;
