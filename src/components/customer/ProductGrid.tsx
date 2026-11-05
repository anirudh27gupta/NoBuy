import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { Product } from '../../types';
import { SlidersHorizontal, AlertCircle, RefreshCw } from 'lucide-react';

export const ProductGrid: React.FC = () => {
  const { 
    products, 
    searchQuery, 
    selectedCategory, 
    locationFilter, 
    dateFilter,
    resetFilters
  } = useApp();

  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'distance' | 'rating'>('recommended');

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Category match
    if (selectedCategory !== 'All' && product.category !== selectedCategory) {
      return false;
    }

    // Search query match
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = product.title.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchCat = product.category.toLowerCase().includes(q);
      const matchOwner = product.ownerName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat && !matchOwner) return false;
    }

    // Date availability filter: (Proposal Section 5.1 Product Availability != Confirmed Booking Calendar)
    if (dateFilter.startDate) {
      const filterStart = new Date(dateFilter.startDate).getTime();
      const filterEnd = dateFilter.endDate ? new Date(dateFilter.endDate).getTime() : filterStart;

      const hasConflict = product.bookedRanges.some((range) => {
        const bookedStart = new Date(range.startDate).getTime();
        const bookedEnd = new Date(range.endDate).getTime();
        return filterStart <= bookedEnd && filterEnd >= bookedStart;
      });

      if (hasConflict) return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_low') return a.dailyRate - b.dailyRate;
    if (sortBy === 'price_high') return b.dailyRate - a.dailyRate;
    if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
    if (sortBy === 'rating') return b.ownerRating - a.ownerRating;
    return 0; // recommended
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mb-16">
      
      {/* Subheader with counts and sorter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {selectedCategory === 'All' ? 'All Verified Rentals' : selectedCategory}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Showing <strong className="text-slate-900">{sortedProducts.length}</strong> items available right now
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
          >
            <option value="recommended">Featured / Recommended</option>
            <option value="distance">Nearest to You (km)</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Highest Owner Rating</option>
          </select>
        </div>
      </div>

      {/* Grid of Products */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto p-8 shadow-xs">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No matching items found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
            Try adjusting your search keywords, clearing your date window, or exploring other categories.
          </p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}

    </section>
  );
};
