import React from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCategory } from '../../types';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Tag, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  X,
  Sparkles
} from 'lucide-react';

const CATEGORIES: ProductCategory[] = [
  'All',
  'Power Tools',
  'Electronics & Cameras',
  'Camping & Outdoor',
  'Party & Events',
  'Sports & Fitness',
  'Home & Cleaning'
];

export const HeroSection: React.FC = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory,
    locationFilter,
    setLocationFilter,
    dateFilter,
    setDateFilter,
    resetFilters
  } = useApp();

  const isFiltered = searchQuery || selectedCategory !== 'All' || locationFilter || dateFilter.startDate;

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white pt-8 pb-12 sm:pt-14 sm:pb-16 border-b border-slate-200/60">
      
      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-gradient-to-r from-emerald-200/30 via-teal-200/20 to-cyan-200/30 blur-3xl -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Text */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/60 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sustainable Peer-to-Peer & Shop Rental Platform</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight sm:leading-tight">
            Rent What You Need. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              Own Less. Save Money.
            </span>
          </h1>
          
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Short-term access to tools, camera gear, camping sets, and party supplies from local owners and shopkeepers in your neighborhood.
          </p>
        </div>

        {/* Search & Discovery Bar Container */}
        <div className="max-w-5xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-slate-200/70 border border-slate-200/90 p-3 sm:p-4 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Search Query */}
            <div className="md:col-span-4 relative">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <Search className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="w-full">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Search Product</label>
                  <input
                    type="text"
                    placeholder="e.g. Bosch Drill, Sony A7, Tent..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-800 focus:outline-none placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="md:col-span-3 relative">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <Tag className="w-4 h-4 text-teal-600 shrink-0" />
                <div className="w-full">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as ProductCategory)}
                    className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-800 focus:outline-none cursor-pointer"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Rental Date Window */}
            <div className="md:col-span-3 relative">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="w-full">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Start Date</label>
                  <input
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                    className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-800 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Action / Reset Button */}
            <div className="md:col-span-2 flex items-center gap-2">
              {isFiltered && (
                <button
                  onClick={resetFilters}
                  title="Clear Filters"
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="w-full">
                <button
                  type="button"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  <span>Explore</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 3 Core Value Signals (as detailed in Proposal Section 1 & 4) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mt-6 text-xs text-slate-600">
          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xs py-2 px-3 rounded-xl border border-slate-200/60 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Zero Double-Bookings:</strong> Conflict-free calendar checked in real-time</span>
          </div>
          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xs py-2 px-3 rounded-xl border border-slate-200/60 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span><strong>Razorpay Escrow:</strong> 100% refundable deposit returned on safe handoff</span>
          </div>
          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xs py-2 px-3 rounded-xl border border-slate-200/60 shadow-2xs">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            <span><strong>Direct Local Pickup:</strong> Verified shopkeepers and neighbours nearby</span>
          </div>
        </div>

      </div>
    </div>
  );
};
