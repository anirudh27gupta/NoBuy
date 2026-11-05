import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  ShieldCheck, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Star, 
  Clock, 
  Receipt,
  Sparkles
} from 'lucide-react';

export const ReturnInspectionModal: React.FC = () => {
  const { 
    activeModal, 
    selectedBookingId, 
    closeModal, 
    bookings, 
    ownerInspectAndSettle 
  } = useApp();

  const [isReturnedOnTime, setIsReturnedOnTime] = useState(true);
  const [lateFee, setLateFee] = useState(0);
  const [damageLevel, setDamageLevel] = useState<'None' | 'Minor' | 'Significant'>('None');
  const [damageDeduction, setDamageDeduction] = useState(0);
  const [inspectionNotes, setInspectionNotes] = useState('Item returned in excellent working condition with all accessories intact.');
  const [customerRating, setCustomerRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (activeModal !== 'RETURN_INSPECTION' || !selectedBookingId) return null;

  const booking = bookings.find(b => b.id === selectedBookingId);
  if (!booking) return null;

  const depositAmount = booking.depositAmount;
  const totalDeductions = lateFee + damageDeduction;
  const netRefund = Math.max(0, depositAmount - totalDeductions);

  const handleDamageChange = (level: 'None' | 'Minor' | 'Significant') => {
    setDamageLevel(level);
    if (level === 'None') {
      setDamageDeduction(0);
      setInspectionNotes('Item inspected: completely clean, no damage, motor/lenses functional.');
    } else if (level === 'Minor') {
      const suggested = Math.min(depositAmount, Math.round(depositAmount * 0.2));
      setDamageDeduction(suggested);
      setInspectionNotes('Minor cosmetic scuffs noted on casing / dust cleaning required.');
    } else {
      const suggested = Math.min(depositAmount, Math.round(depositAmount * 0.6));
      setDamageDeduction(suggested);
      setInspectionNotes('Functional defect or missing accessory noted during return check.');
    }
  };

  const handleOnTimeChange = (onTime: boolean) => {
    setIsReturnedOnTime(onTime);
    if (onTime) {
      setLateFee(0);
    } else {
      setLateFee(booking.dailyRate); // 1 day rate as default late fee
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (totalDeductions > depositAmount) {
      alert('Total deductions cannot exceed the total security deposit amount.');
      return;
    }

    if (totalDeductions > 0 && !inspectionNotes.trim()) {
      alert('Please enter a documented reason for the deposit deduction (Proposal Section 10).');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      ownerInspectAndSettle(booking.id, {
        isReturnedOnTime,
        damageLevel,
        lateFee,
        damageDeduction,
        notes: inspectionNotes
      });
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Return Inspection & Deposit Settlement</h3>
                <span className="text-[10px] text-slate-400 font-medium">UCS503P FULFILLMENT WORKFLOW (FIGURE 2)</span>
              </div>
            </div>
            
            <button onClick={closeModal} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div>
              <p className="font-semibold text-white">{booking.productTitle}</p>
              <p className="text-[11px] text-slate-400">Renter: {booking.customerName} ({booking.customerPhone})</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-400 block">Security Deposit Held</span>
              <span className="text-lg font-black text-emerald-400">₹{depositAmount}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Step 1: Return Timeliness Check */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-600" />
              <span>1. Check Return Timeliness</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOnTimeChange(true)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isReturnedOnTime
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Returned On Time</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">No late penalty applies</span>
              </button>

              <button
                type="button"
                onClick={() => handleOnTimeChange(false)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  !isReturnedOnTime
                    ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Late Return</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Apply daily rate late fee</span>
              </button>
            </div>

            {!isReturnedOnTime && (
              <div className="mt-3 bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center justify-between">
                <span className="text-xs text-amber-900 font-medium">Late Return Fee (₹):</span>
                <input
                  type="number"
                  min="0"
                  max={depositAmount}
                  value={lateFee}
                  onChange={(e) => setLateFee(Number(e.target.value))}
                  className="w-24 text-xs font-bold bg-white border border-amber-300 rounded-lg px-2 py-1 text-slate-800 text-right"
                />
              </div>
            )}
          </div>

          {/* Step 2: Physical Condition Audit */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-slate-600" />
              <span>2. Inspect Item Physical Condition</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              
              <button
                type="button"
                onClick={() => handleDamageChange('None')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  damageLevel === 'None'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs block">No Damage</span>
                <span className="text-[10px] text-emerald-700">Pristine</span>
              </button>

              <button
                type="button"
                onClick={() => handleDamageChange('Minor')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  damageLevel === 'Minor'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs block">Minor Scratches</span>
                <span className="text-[10px] text-amber-700">Cleaning fee</span>
              </button>

              <button
                type="button"
                onClick={() => handleDamageChange('Significant')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  damageLevel === 'Significant'
                    ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs block">Defect / Missing</span>
                <span className="text-[10px] text-rose-700">Repair cost</span>
              </button>

            </div>

            {damageLevel !== 'None' && (
              <div className="mt-3 bg-rose-50 p-3 rounded-xl border border-rose-200 flex items-center justify-between">
                <span className="text-xs text-rose-900 font-medium">Damage Deduction (₹):</span>
                <input
                  type="number"
                  min="0"
                  max={depositAmount - lateFee}
                  value={damageDeduction}
                  onChange={(e) => setDamageDeduction(Number(e.target.value))}
                  className="w-24 text-xs font-bold bg-white border border-rose-300 rounded-lg px-2 py-1 text-slate-800 text-right"
                />
              </div>
            )}
          </div>

          {/* Documented Reason (Mandatory per Section 5.4 & 10) */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Inspection Notes & Documented Reason
            </label>
            <textarea
              required
              rows={2}
              value={inspectionNotes}
              onChange={(e) => setInspectionNotes(e.target.value)}
              placeholder="Record condition details for transparent customer audit log..."
              className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Settle Calculation Summary */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Security Deposit Held:</span>
              <span className="font-bold text-slate-900">₹{depositAmount}</span>
            </div>
            
            {totalDeductions > 0 && (
              <div className="flex justify-between text-xs text-rose-600 font-semibold">
                <span>Deductions (Late Fee: ₹{lateFee} + Damage: ₹{damageDeduction}):</span>
                <span>- ₹{totalDeductions}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Refund to Customer via Razorpay:</span>
              <span className="text-xl font-black text-emerald-600">₹{netRefund}</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Authorizing Razorpay Refund API...</span>
            ) : (
              <>
                <Receipt className="w-4 h-4" />
                <span>Confirm Inspection & Release ₹{netRefund} Refund</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-slate-400">
            Triggers Razorpay Refund API simulation and records immutable audit log.
          </p>

        </form>

      </div>
    </div>
  );
};
