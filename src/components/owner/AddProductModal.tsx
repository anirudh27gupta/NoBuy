import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCategory, ProductCondition } from '../../types';
import { 
  X, 
  Upload, 
  Plus, 
  Sparkles, 
  Tag, 
  ShieldCheck, 
  CheckCircle2, 
  Image as ImageIcon 
} from 'lucide-react';

const CATEGORIES: ProductCategory[] = [
  'Power Tools',
  'Electronics & Cameras',
  'Camping & Outdoor',
  'Party & Events',
  'Sports & Fitness',
  'Home & Cleaning'
];

const PRESET_IMAGES = [
  { label: 'Drill / Power Tool', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=1000' },
  { label: 'Camera / Tech', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000' },
  { label: 'Camping Tent', url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&q=80&w=1000' },
  { label: 'Speaker / DJ', url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=1000' },
  { label: 'Pressure Cleaner', url: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=1000' },
  { label: 'Bicycle / Sports', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=1000' }
];

export const AddProductModal: React.FC = () => {
  const { activeModal, closeModal, addProduct, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Power Tools');
  const [description, setDescription] = useState('');
  const [dailyRate, setDailyRate] = useState<number>(300);
  const [securityDeposit, setSecurityDeposit] = useState<number>(1500);
  const [condition, setCondition] = useState<ProductCondition>('Like New');
  const [location, setLocation] = useState(currentUser.location || 'Patiala, Punjab');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [accessories, setAccessories] = useState('Safety goggles, Power cord, Carry box');
  const [guidelines, setGuidelines] = useState('Handle with care, return cleaned and dry');

  if (activeModal !== 'ADD_PRODUCT') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addProduct({
      title,
      category,
      description,
      dailyRate: Number(dailyRate),
      securityDeposit: Number(securityDeposit),
      condition,
      location,
      images: [imageUrl],
      includedAccessories: accessories.split(',').map(s => s.trim()).filter(Boolean),
      guidelines: guidelines.split(',').map(s => s.trim()).filter(Boolean),
      isAvailable: true
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-lg">List Product for Rental</h3>
          </div>
          <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Product Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Stanley 750W Angle Grinder + Cutoff Wheels"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description & Specs</label>
            <textarea
              required
              rows={3}
              placeholder="Describe condition, specifications, recommended use cases..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs sm:text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Pricing & Deposit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Daily Rental (₹)</label>
              <input
                type="number"
                min="10"
                required
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value))}
                className="w-full text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Security Deposit (₹)</label>
              <input
                type="number"
                min="0"
                required
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                className="w-full text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Item Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ProductCondition)}
                className="w-full text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Brand New">Brand New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>

          {/* Preset Photo or URL */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
              Product Photo (Cloudinary Simulation)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_IMAGES.map((img, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setImageUrl(img.url)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                    imageUrl === img.url ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {img.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3 items-center">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or paste image URL"
                className="flex-1 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700"
              />
              <img src={imageUrl} alt="" className="w-12 h-10 object-cover rounded-lg border border-slate-300" />
            </div>
          </div>

          {/* Accessories & Guidelines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Included Accessories (comma-separated)</label>
              <input
                type="text"
                value={accessories}
                onChange={(e) => setAccessories(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Pickup Location / Area</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Listing</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
