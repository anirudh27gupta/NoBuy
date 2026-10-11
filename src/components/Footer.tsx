import React from 'react';
import { Repeat, ShieldCheck, Zap, RefreshCw, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand & Purpose */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <Repeat className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">NoBuy</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Turning fragmented, informal rental arrangements into a transparent, secure platform. Rent what you need, lend what you own.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Razorpay Refundable Deposit Escrow</span>
            </div>
          </div>

          {/* Col 2: System Architecture */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-3">Platform Pillars</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Multi-Category Product Listings</span>
              </li>
              <li className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                <span>Conflict-Free Real-Time Booking</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Documented Return & Inspection</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-purple-400" />
                <span>Transparent Dual-Sided Ratings</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Academic Proposal Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-3">Course Project UCS503P</h4>
            <div className="text-xs text-slate-400 space-y-1.5">
              <p className="font-semibold text-slate-200">Thapar Institute of Engineering & Technology</p>
              <p>Submitted to: <span className="text-slate-200">Ms. Kirtika Goyal</span></p>
              <p className="text-[11px] text-slate-500 pt-1">3-Tier Web Architecture: React.js + Python/Flask + MySQL + Razorpay Sandbox + Cloudinary Media</p>
            </div>
          </div>

          {/* Col 4: Project Team */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-3">Engineering Team</h4>
            <div className="text-xs text-slate-400 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-300 font-medium">Anirudh Gupta</span>
                <span className="font-mono text-slate-500">1024030629</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 font-medium">Shriya Sidana</span>
                <span className="font-mono text-slate-500">1024030642</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 font-medium">Tatvik Bhandari</span>
                <span className="font-mono text-slate-500">1024030637</span>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 NoBuy Project Proposal • Built for sustainable local consumption</p>
          <p className="flex items-center gap-1">
            <span>Engineered with care</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>by TIET Computer Science</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
