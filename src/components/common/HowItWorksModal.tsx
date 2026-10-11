import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Search, 
  CheckCircle2, 
  CreditCard, 
  Package, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

export const HowItWorksModal: React.FC = () => {
  const { activeModal, closeModal } = useApp();

  if (activeModal !== 'HOW_IT_WORKS') return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                How NoBuy Works (Proposal Architecture)
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                UCS503P Project Specification • Figures 1 & 2 Workflow
              </p>
            </div>
          </div>

          <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8 flex-1">
          
          {/* Workflow 1: Booking Side (Figure 1 in Proposal) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Phase 1: Booking & Availability Flow
              </span>
              <span className="text-xs text-slate-400 font-medium">(Figure 1)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 font-bold text-xs">
                  1
                </div>
                <h4 className="text-xs font-bold text-slate-800">Search & Select</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Discover multi-category products filtered by location, category, and price.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-2 font-bold text-xs">
                  2
                </div>
                <h4 className="text-xs font-bold text-slate-800">Availability Check</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Real-time calendar verification prevents double-booking overlaps.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2 font-bold text-xs">
                  3
                </div>
                <h4 className="text-xs font-bold text-slate-800">Submit Request</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Customer reserves window and submits booking to owner for review.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-2 font-bold text-xs">
                  4
                </div>
                <h4 className="text-xs font-bold text-slate-800">Owner Decision</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Owner reviews customer profile and ratings to Accept or Decline.
                </p>
              </div>
            </div>
          </div>

          {/* Workflow 2: Fulfillment & Return Inspection (Figure 2 in Proposal) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full border border-teal-200">
                Phase 2: Payment, Use & Return Inspection
              </span>
              <span className="text-xs text-slate-400 font-medium">(Figure 2)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2 font-bold text-xs">
                  5
                </div>
                <h4 className="text-xs font-bold text-slate-800">Razorpay Payment</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pays rental charge + security deposit held in safe escrow.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 font-bold text-xs">
                  6
                </div>
                <h4 className="text-xs font-bold text-slate-800">Direct Pickup & Use</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  In-person handoff between customer and owner without delivery friction.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-2 font-bold text-xs">
                  7
                </div>
                <h4 className="text-xs font-bold text-slate-800">Return & Inspect</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Owner verifies return timeliness and inspects physical condition.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2 font-bold text-xs">
                  8
                </div>
                <h4 className="text-xs font-bold text-slate-800">Deposit & Review</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Razorpay refund API releases deposit; mutual reviews build local trust.
                </p>
              </div>
            </div>
          </div>

          {/* Academic Constraints & Scope (Section 4.4 & 9.4) */}
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 text-xs text-emerald-950 space-y-2">
            <h4 className="font-extrabold text-sm text-emerald-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Key Technical Decisions from Proposal</span>
            </h4>
            <p className="leading-relaxed">
              <strong>• Deliberately No Logistics Automation:</strong> In-person pickup and return keeps the system clean, dependable, and avoids carrier complexity.
            </p>
            <p className="leading-relaxed">
              <strong>• Safe Escrow:</strong> Solves verbal disputes by requiring documented inspection notes before any deduction can be levied on the security deposit.
            </p>
            <p className="leading-relaxed">
              <strong>• Live Role Toggle:</strong> Switch between <em>Customer View</em> and <em>Owner View</em> in the navigation bar to test both sides of any transaction!
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
