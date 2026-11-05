import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Sparkles,
  Phone,
  UserCheck
} from 'lucide-react';

interface ProductDetailModalProps {
  onSuccessNavigateToBookings?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ onSuccessNavigateToBookings }) => {
  const { 
    activeModal, 
    selectedProductId, 
    closeModal, 
    products, 
    createBooking 
  } = useApp();

  // Get tomorrow's date formatted as YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Get date after 3 days
  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  const threeDaysLaterStr = threeDaysLater.toISOString().split('T')[0];

  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [startDate, setStartDate] = useState(tomorrowStr);
  const [endDate, setEndDate] = useState(threeDaysLaterStr);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (activeModal !== 'PRODUCT_DETAIL' || !selectedProductId) return null;

  const product = products.find(p => p.id === selectedProductId);
  if (!product) return null;

  // Calculate rental duration
  const startObj = new Date(startDate);
  const endObj = new Date(endDate);
  const diffTime = endObj.getTime() - startObj.getTime();
  const rentalDays = diffTime >= 0 ? Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1) : 0;
  
  const rentalAmount = rentalDays * product.dailyRate;
  const depositAmount = product.securityDeposit;
  const totalPayable = rentalAmount + depositAmount;

  // Check if current range conflicts with bookedRanges
  const isConflicting = product.bookedRanges.some(range => {
    const s1 = startObj.getTime();
    const e1 = endObj.getTime();
    const s2 = new Date(range.startDate).getTime();
    const e2 = new Date(range.endDate).getTime();
    return s1 <= e2 && e1 >= s2;
  });

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (rentalDays <= 0) {
      setErrorMessage('End date must be the same as or later than start date.');
      return;
    }

    if (isConflicting) {
      setErrorMessage('Selected dates conflict with an existing reservation. Please pick different dates.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = createBooking(product.id, startDate, endDate);
      setIsSubmitting(false);
      if (res.success) {
        if (onSuccessNavigateToBookings) {
          onSuccessNavigateToBookings();
        }
      } else {
        setErrorMessage(res.message);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200">
              {product.category}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ID: {product.id}
            </span>
          </div>
          <button
            onClick={closeModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Media & Product Details */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Main Image */}
              <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={product.images[selectedImgIndex] || product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-slate-800 border border-slate-200 shadow-xs">
                  Condition: {product.condition}
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImgIndex(idx)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImgIndex === idx ? 'border-emerald-600 scale-105 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Title & Description */}
              <div>
                <h1 className="text-2xl font-black text-slate-900 leading-snug">
                  {product.title}
                </h1>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Included Accessories */}
              {product.includedAccessories && product.includedAccessories.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Included in this Rental</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {product.includedAccessories.map((acc, idx) => (
                      <span key={idx} className="text-xs font-medium bg-white text-slate-700 px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                        {acc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Guidelines */}
              {product.guidelines && product.guidelines.length > 0 && (
                <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-600" />
                    <span>Owner Guidelines & Safe Handling</span>
                  </h4>
                  <ul className="text-xs text-amber-900/80 space-y-1 pl-4 list-disc">
                    {product.guidelines.map((g, idx) => (
                      <li key={idx}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Owner Trust & Verification Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
                    <UserCheck className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{product.ownerName}</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        Verified Lender
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {product.ownerRating}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {product.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Booking Calculator & Reservation Form (Proposal Section 4.2 & 5.1) */}
            <div className="lg:col-span-5">
              <div className="sticky top-4 bg-white rounded-2xl sm:rounded-3xl border-2 border-emerald-500/30 p-5 sm:p-6 shadow-xl shadow-emerald-500/5">
                
                <div className="flex items-baseline justify-between mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-2xl font-black text-slate-900">₹{product.dailyRate}</span>
                    <span className="text-xs text-slate-500 font-medium"> / day</span>
                  </div>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Instant Availability Check
                  </span>
                </div>

                <form onSubmit={handleSubmitBooking} className="space-y-4">
                  {/* Date Pickers */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                        Return Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Conflict Notice if booked */}
                  {product.bookedRanges.length > 0 && (
                    <div className="text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600">
                      <div className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Existing Booked Ranges:</span>
                      </div>
                      {product.bookedRanges.map((r, i) => (
                        <div key={i} className="text-rose-600 font-semibold">
                          • {r.startDate} to {r.endDate} (Unavailable)
                        </div>
                      ))}
                    </div>
                  )}

                  {isConflicting && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>The dates you picked overlap with an existing rental!</span>
                    </div>
                  )}

                  {/* Rental Cost Breakdown */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Rental Fee (₹{product.dailyRate} × {rentalDays} {rentalDays === 1 ? 'day' : 'days'})</span>
                      <span className="font-bold text-slate-900">₹{rentalAmount}</span>
                    </div>

                    <div className="flex justify-between text-xs text-teal-800 font-medium">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                        <span>Security Deposit (Refundable)</span>
                      </span>
                      <span className="font-bold text-teal-900">₹{depositAmount}</span>
                    </div>

                    <p className="text-[10px] text-slate-500 italic">
                      * 100% of the security deposit is refunded upon return in good condition.
                    </p>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-slate-900">Total Payable upon Approval</span>
                      <span className="text-xl font-extrabold text-slate-900">₹{totalPayable}</span>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                      {errorMessage}
                    </div>
                  )}

                  {/* Submit Action */}
                  <button
                    type="submit"
                    disabled={isConflicting || rentalDays <= 0 || isSubmitting}
                    className={`w-full py-3.5 px-4 rounded-2xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                      isConflicting || rentalDays <= 0 || isSubmitting
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 hover:scale-[1.01]'
                    }`}
                  >
                    {isSubmitting ? (
                      <span>Reserving Slot...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Submit Booking Request</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-slate-400">
                    No charge right now. Payment is only collected via Razorpay after owner acceptance.
                  </p>
                </form>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
