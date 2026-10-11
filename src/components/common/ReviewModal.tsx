import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Star, Sparkles, ThumbsUp } from 'lucide-react';

export const ReviewModal: React.FC = () => {
  const { 
    activeModal, 
    selectedBookingId, 
    closeModal, 
    bookings, 
    role, 
    submitReview 
  } = useApp();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Punctual', 'Great Condition']);

  if (activeModal !== 'REVIEW' || !selectedBookingId) return null;

  const booking = bookings.find(b => b.id === selectedBookingId);
  if (!booking) return null;

  const availableTags = role === 'CUSTOMER' 
    ? ['Item in Mint Condition', 'Punctual Handoff', 'Helpful Owner', 'Fair Deposit Return', 'Smooth Return', 'Highly Recommended']
    : ['Respectful Renter', 'Punctual Return', 'Item Returned Clean', 'Zero Damage', 'Great Communication'];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReview(booking.id, rating, comment || 'Great rental experience!', selectedTags);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h3 className="font-extrabold text-slate-900 text-base">
              {role === 'CUSTOMER' ? 'Rate Rental & Owner' : 'Rate Customer'}
            </h3>
          </div>
          <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div className="text-center">
            <p className="text-xs text-slate-500">How was your experience with</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">
              {role === 'CUSTOMER' ? booking.productTitle : booking.customerName}
            </p>

            {/* Interactive Star Picker */}
            <div className="flex justify-center gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200 fill-slate-100'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-amber-600 mt-1">
              {rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Average' : 'Could be better'}
            </p>
          </div>

          {/* Quick Feedback Tags */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2 text-center">
              Select Experience Highlights
            </label>
            <div className="flex flex-wrap justify-center gap-1.5">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                      isSelected
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Feedback Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Leave a short comment to help the community build trust..."
              className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-md shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Submit Review</span>
          </button>

        </form>

      </div>
    </div>
  );
};
