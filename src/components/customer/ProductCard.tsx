import React from 'react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  MapPin, 
  Star, 
  ShieldCheck, 
  Calendar, 
  ChevronRight, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { openProductDetail } = useApp();

  const getConditionColor = (condition: Product['condition']) => {
    switch (condition) {
      case 'Brand New':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Like New':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Good':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Fair':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div 
      onClick={() => openProductDetail(product.id)}
      className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer hover:-translate-y-1"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Condition Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-2xs ${getConditionColor(product.condition)}`}>
            {product.condition}
          </span>
          <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 border border-slate-200 shadow-2xs">
            {product.category}
          </span>
        </div>

        {/* Distance Chip */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-bold text-white bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs">
          <MapPin className="w-3 h-3 text-emerald-400" />
          <span>{product.distanceKm} km away</span>
        </div>

        {/* Real-time Availability status */}
        <div className="absolute bottom-3 right-3 text-[11px] font-bold text-emerald-950 bg-emerald-300/90 backdrop-blur-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse"></span>
          <span>Available</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Owner Details */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-slate-700 truncate max-w-[170px]">
              {product.ownerName}
            </span>
            <div className="flex items-center gap-1 text-slate-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{product.ownerRating}</span>
              <span className="text-slate-400 text-[10px]">({product.ownerReviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {product.title}
          </h3>

          {/* Short description */}
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & Deposit Section (Proposal Core requirement) */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900">
                ₹{product.dailyRate}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ day</span>
            </div>
            
            <div className="flex items-center gap-1 mt-1 text-[11px] text-teal-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>₹{product.securityDeposit} Refundable Deposit</span>
            </div>
          </div>

          <button 
            type="button"
            className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-emerald-600 text-slate-600 group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs group-hover:shadow-md group-hover:shadow-emerald-600/30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
