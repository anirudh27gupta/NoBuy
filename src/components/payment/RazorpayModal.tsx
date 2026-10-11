import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  QrCode,
  ArrowRight
} from 'lucide-react';

export const RazorpayModal: React.FC = () => {
  const { 
    activeModal, 
    selectedBookingId, 
    closeModal, 
    bookings, 
    processPayment 
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiOption, setUpiOption] = useState<'gpay' | 'phonepe' | 'paytm' | 'id'>('gpay');
  const [upiId, setUpiId] = useState('anirudh@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 6789');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('892');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (activeModal !== 'CHECKOUT' || !selectedBookingId) return null;

  const booking = bookings.find(b => b.id === selectedBookingId);
  if (!booking) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);

      setTimeout(() => {
        const methodLabel = paymentMethod === 'upi' ? `UPI (${upiOption.toUpperCase()})` : paymentMethod === 'card' ? 'Credit/Debit Card' : 'Netbanking';
        processPayment(booking.id, methodLabel);
        setPaymentSuccess(false);
      }, 1000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Razorpay Authentic Blue Header */}
        <div className="bg-[#0c2340] text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 font-bold text-sm">
                R
              </div>
              <div>
                <span className="font-extrabold tracking-tight text-white text-base">Razorpay</span>
                <span className="text-[10px] block text-blue-300 font-medium tracking-wide">SECURE CHECKOUT</span>
              </div>
            </div>
            
            <button
              onClick={closeModal}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-blue-900/60 flex justify-between items-end">
            <div>
              <p className="text-[11px] text-blue-200 font-medium">Paying for: {booking.productTitle}</p>
              <p className="text-[10px] text-blue-300">Order ID: {booking.id}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-white">₹{booking.totalAmount}</span>
            </div>
          </div>

          {/* Test Mode pill */}
          <div className="absolute top-2 right-12 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
            SANDBOX TEST MODE
          </div>
        </div>

        {/* Escrow Deposit Protection Banner */}
        <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>₹{booking.depositAmount}</strong> refundable deposit is held in escrow and released upon item return.
          </span>
        </div>

        {paymentSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Payment Authorized!</h3>
            <p className="text-xs text-slate-500">
              Razorpay transaction captured. Confirmation receipt sent.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePay} className="p-6 space-y-5">
            
            {/* Payment Method Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-2">
                Select Payment Option
              </label>
              <div className="grid grid-cols-3 gap-2">
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'upi'
                      ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <span className="text-xs">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-xs">Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'netbanking'
                      ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span className="text-xs">NetBanking</span>
                </button>

              </div>
            </div>

            {/* UPI Option Sub-view */}
            {paymentMethod === 'upi' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUpiOption('gpay')}
                    className={`flex-1 py-2 text-xs rounded-xl font-bold border transition-colors ${
                      upiOption === 'gpay' ? 'bg-white border-blue-600 text-blue-900 shadow-2xs' : 'bg-slate-100 text-slate-600 border-transparent'
                    }`}
                  >
                    Google Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiOption('phonepe')}
                    className={`flex-1 py-2 text-xs rounded-xl font-bold border transition-colors ${
                      upiOption === 'phonepe' ? 'bg-white border-blue-600 text-blue-900 shadow-2xs' : 'bg-slate-100 text-slate-600 border-transparent'
                    }`}
                  >
                    PhonePe
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiOption('id')}
                    className={`flex-1 py-2 text-xs rounded-xl font-bold border transition-colors ${
                      upiOption === 'id' ? 'bg-white border-blue-600 text-blue-900 shadow-2xs' : 'bg-slate-100 text-slate-600 border-transparent'
                    }`}
                  >
                    UPI ID
                  </button>
                </div>

                {upiOption === 'id' ? (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Enter VPA / UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                    <QrCode className="w-8 h-8 text-slate-700" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Scan & Pay from {upiOption === 'gpay' ? 'Google Pay' : 'PhonePe'}</p>
                      <p className="text-[10px] text-slate-500">Auto-approved in simulation</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Card Option Sub-view */}
            {paymentMethod === 'card' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Netbanking Sub-view */}
            {paymentMethod === 'netbanking' && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <label className="block text-[10px] font-bold uppercase text-slate-400">Select Bank</label>
                <select className="w-full bg-white border border-slate-200 rounded-xl p-2 font-medium text-slate-800">
                  <option>HDFC Bank</option>
                  <option>State Bank of India</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Punjab National Bank</option>
                </select>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 px-4 bg-[#0c2340] hover:bg-[#153a66] active:scale-[0.99] text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-blue-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <span>Securing Transaction with Razorpay...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Pay ₹{booking.totalAmount} & Confirm</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>256-bit SSL Encrypted • PCI-DSS Compliant Payment</span>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
