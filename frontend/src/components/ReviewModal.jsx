import React, { useState } from 'react';
import { api } from '../api';

export const ReviewModal = ({ booking, onClose, onSuccess }) => {
  if (!booking) return null;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const quickTags = [
    'Mint condition equipment',
    'Responsive communication',
    'Careful handover',
    'Accurate description',
    'Would rent again'
  ];

  const handleAddTag = (tag) => {
    if (!comment.includes(tag)) {
      setComment(prev => prev ? `${prev} · ${tag}` : tag);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide feedback comments.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.createReview({
        booking_id: booking.id,
        rating,
        comment
      });

      if (res.success) {
        if (onSuccess) onSuccess(rating, booking.product_title);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" id="review-modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Rate & Review Rental</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
              Share your experience with {booking.product_title}
            </p>
          </div>
          <button className="modal-close-btn" id="close-review-modal" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} id="review-form">
            {/* 5-Star Selector */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-dim)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Overall Experience Rating
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    id={`star-btn-${star}`}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '2.4rem',
                      cursor: 'pointer',
                      color: (hoverRating || rating) >= star ? '#fbbf24' : '#334155',
                      transition: 'transform 0.1s ease',
                      padding: '0 0.15rem'
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 700, marginTop: '0.25rem' }}>
                {rating === 5 && 'Outstanding! 5/5'}
                {rating === 4 && 'Great experience 4/5'}
                {rating === 3 && 'Average rental 3/5'}
                {rating === 2 && 'Had some issues 2/5'}
                {rating === 1 && 'Unsatisfactory 1/5'}
              </div>
            </div>

            {/* Quick Tag suggestions */}
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.775rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                Tap to include highlights:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {quickTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                    onClick={() => handleAddTag(tag)}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed feedback */}
            <div className="form-group">
              <label className="form-label" htmlFor="review-comment">Review Comments</label>
              <textarea 
                id="review-comment"
                className="form-textarea" 
                placeholder="How was the equipment condition? Was the owner helpful during pickup and return?"
                value={comment}
                onChange={e => setComment(e.target.value)}
                required
                style={{ minHeight: '90px' }}
              />
            </div>

            <button 
              type="submit" 
              id="submit-review-btn"
              className="btn btn-primary btn-lg" 
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Posting Review...' : '⭐ Submit Verified Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
