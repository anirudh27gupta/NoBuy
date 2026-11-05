import React from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCategory } from '../../types';
import { 
  Sparkles, 
  Wrench, 
  Camera, 
  Tent, 
  Music2, 
  Bike, 
  Paintbrush
} from 'lucide-react';

interface CategoryItem {
  id: ProductCategory;
  label: string;
  icon: React.ElementType;
}

const CATEGORY_ITEMS: CategoryItem[] = [
  { id: 'All', label: 'All Items', icon: Sparkles },
  { id: 'Power Tools', label: 'Power Tools', icon: Wrench },
  { id: 'Electronics & Cameras', label: 'Cameras & Tech', icon: Camera },
  { id: 'Camping & Outdoor', label: 'Camping & Outdoor', icon: Tent },
  { id: 'Party & Events', label: 'Party & Sound', icon: Music2 },
  { id: 'Sports & Fitness', label: 'Sports & Mobility', icon: Bike },
  { id: 'Home & Cleaning', label: 'Home & Washers', icon: Paintbrush },
];

export const CategoryFilter: React.FC = () => {
  const { selectedCategory, setSelectedCategory, products } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between gap-4 mb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Explore by Category
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          {products.length} verified listings available near you
        </span>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORY_ITEMS.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedCategory === item.id;
          
          const count = item.id === 'All' 
            ? products.length 
            : products.filter(p => p.category === item.id).length;

          return (
            <button
              key={item.id}
              onClick={() => setSelectedCategory(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shadow-2xs border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-[1.02]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isSelected ? 'bg-slate-800 text-emerald-300' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
