import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookingStatus, Booking } from '../../types';
import { 
  Calendar, 
  MapPin, 
  Phone, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RotateCcw, 
  Star,
  ChevronRight,
  Sparkles,
  Receipt
} from 'lucide-react';

export const BookingHistory: React.FC = () => {
  const { 
    bookings, 
    currentUser, 
    openCheckout, 
    confirmPickup, 
    customerInitiateReturn, 
    openReview 
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'COMPLETED'>('ALL');

  const customerBookings = bookings.filter(b => b.customerId === currentUser.id);

  const filteredBookings = customerBookings.filter(b => {
    if (activeFilter === 'ACTIVE') return b.status === 'CONFIRMED' || b.status === 'IN_USE';
    if (activeFilter === 'PENDING') return b.status === 'PENDING_APPROVAL' || b.status === 'APPROVED';
    if (activeFilter === 'COMPLETED') return b.status === 'COMPLETED' || b.status === 'RETURNED';
    return true;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Owner Review</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300 animate-pulse">
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            <span>Approved • Awaiting Payment</span>
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Paid & Confirmed • Ready for Pickup</span>
          </span>
        );
      case 'IN_USE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-900 border border-teal-300">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Currently in Use</span>
          </span>
        );
      case 'RETURNED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>Returned • Inspection in Progress</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Completed • Deposit Settled</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Declined by Owner</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getStepProgress = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING_APPROVAL': return 1;
      case 'APPROVED': return 2;
      case 'CONFIRMED': return 3;
      case 'IN_USE': return 4;
      case 'RETURNED': return 5;
      case 'COMPLETED': return 6;
      default: return 0;
    }
  };

  const STEPS = ['Requested', 'Approved', 'Paid (Razorpay)', 'In Use', 'Returned', 'Deposit Settled'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20">
      
      {/* Title & Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Rental Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track reservation approvals, Razorpay payments, pickup handoffs, and deposit returns.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({customerBookings.length})
          </button>
          <button
            onClick={() => setActiveFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'ACTIVE' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'PENDING' ? 'bg-white text-amber-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'COMPLETED' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-6 mt-6">
          {filteredBookings.map((booking) => {
            const currentStep = getStepProgress(booking.status);

            return (
              <div 
                key={booking.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 sm:p-7 overflow-hidden"
              >
                
                {/* Top Section: Info & Status */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div className="flex items-start sm:items-center gap-4">
                    <img
                      src={booking.productImage}
                      alt={booking.productTitle}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {booking.category}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-semibold text-slate-600">ID: {booking.id}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {booking.productTitle}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {booking.startDate} to {booking.endDate} ({booking.rentalDays} {booking.rentalDays === 1 ? 'day' : 'days'})
                        </span>
                        <span>•</span>
                        <span className="text-slate-600">
                          Lender: <strong className="text-slate-800">{booking.ownerName}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    {getStatusBadge(booking.status)}
                    <div className="text-xs text-slate-500">
                      Total: <strong className="text-slate-900 text-sm">₹{booking.totalAmount}</strong> (Incl. ₹{booking.depositAmount} Deposit)
                    </div>
                  </div>
                </div>

                {/* Middle Section: Lifecycle Stepper (Proposal Figures 1 & 2) */}
                {booking.status !== 'REJECTED' && (
                  <div className="py-5 border-b border-slate-100">
                    <div className="grid grid-cols-6 gap-1 sm:gap-2">
                      {STEPS.map((step, idx) => {
                        const stepNum = idx + 1;
                        const isDone = currentStep >= stepNum;
                        const isCurrent = currentStep === stepNum;

                        return (
                          <div key={idx} className="flex flex-col items-center text-center">
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isDone
                                ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30'
                                : 'bg-slate-100 text-slate-400'
                            } ${isCurrent ? 'ring-4 ring-emerald-100 font-extrabold' : ''}`}>
                              {isDone ? '✓' : stepNum}
                            </div>
                            <span className={`text-[10px] sm:text-[11px] mt-1.5 font-semibold leading-tight line-clamp-1 ${
                              isDone ? 'text-slate-800' : 'text-slate-400'
                            }`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bottom Section: Contextual Actions */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  
                  {/* Financial & Pickup Note */}
                  <div className="text-xs text-slate-500 space-y-1 w-full sm:w-auto">
                    {booking.status === 'APPROVED' && (
                      <p className="text-blue-700 font-semibold flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>Owner has approved your request! Complete payment within 24 hours.</span>
                      </p>
                    )}

                    {booking.status === 'CONFIRMED' && (
                      <div className="flex items-center gap-3">
                        <p className="text-emerald-700 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Payment verified (Txn: {booking.paymentId})</span>
                        </p>
                        <span className="text-slate-300">|</span>
                        <a href={`tel:${booking.ownerPhone}`} className="text-slate-700 font-bold hover:underline flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>Contact Owner</span>
                        </a>
                      </div>
                    )}

                    {booking.status === 'IN_USE' && (
                      <p className="text-teal-700 font-semibold">
                        Rental period active. Return by {booking.endDate} to avoid late fees.
                      </p>
                    )}

                    {booking.status === 'COMPLETED' && (
                      <div className="text-slate-600 space-y-0.5">
                        <p className="font-semibold text-emerald-700 flex items-center gap-1.5">
                          <Receipt className="w-4 h-4 text-emerald-600" />
                          <span>Razorpay Deposit Refund: ₹{booking.refundedDeposit} processed ({booking.razorpayRefundId})</span>
                        </p>
                        {booking.totalDeduction ? booking.totalDeduction > 0 && (
                          <p className="text-[11px] text-amber-700">
                            * Deduction: ₹{booking.totalDeduction} ({booking.inspectionNotes || 'Documented adjustment'})
                          </p>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Actions according to state */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    
                    {/* Pay button */}
                    {booking.status === 'APPROVED' && (
                      <button
                        onClick={() => openCheckout(booking.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Pay ₹{booking.totalAmount} (Razorpay)</span>
                      </button>
                    )}

                    {/* Pickup handoff confirmation */}
                    {booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => confirmPickup(booking.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Item Picked Up</span>
                      </button>
                    )}

                    {/* Return Item button */}
                    {booking.status === 'IN_USE' && (
                      <button
                        onClick={() => customerInitiateReturn(booking.id)}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white rounded-xl text-xs font-extrabold shadow-md shadow-teal-600/30 flex items-center gap-1.5 transition-all"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Hand Over Item & Initiate Return</span>
                      </button>
                    )}

                    {/* Review button */}
                    {booking.status === 'COMPLETED' && !booking.customerReviewed && (
                      <button
                        onClick={() => openReview(booking.id)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white rounded-xl text-xs font-extrabold shadow-md shadow-amber-500/30 flex items-center gap-1.5 transition-all"
                      >
                        <Star className="w-4 h-4 fill-white" />
                        <span>Leave Review & Rating</span>
                      </button>
                    )}

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 mt-6 max-w-md mx-auto p-8 shadow-xs">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No bookings in this category</h3>
          <p className="text-xs text-slate-500 mt-1">
            Browse our multi-category catalogue and place your first rental request!
          </p>
        </div>
      )}

    </div>
  );
};
