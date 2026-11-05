import React, { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export const NegotiationModal = ({ product, bookingId = null, onClose, onSuccess, onAuthRequired }) => {
  if (!product) return null;

  const { isAuthenticated, user } = useAuth();
  const [proposedRate, setProposedRate] = useState(
    Math.round(product.daily_rate * 0.85) // default suggested offer ~15% discount
  );
  const [renterMessage, setRenterMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const originalRate = Number(product.daily_rate);
  const diff = originalRate - proposedRate;
  const discountPercent = originalRate > 0 ? Math.round((diff / originalRate) * 100) : 0;

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onAuthRequired('login');
      return;
    }

    if (user && user.id === product.owner_id) {
      setError('You cannot bargain on your own item.');
      return;
    }

    if (proposedRate <= 0) {
      setError('Please propose a daily rate greater than 0.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.createNegotiation({
        product_id: product.id,
        booking_id: bookingId,
        proposed_daily_rate: proposedRate,
        renter_message: renterMessage || `Hi ${product.owner_name}, would you consider ₹${proposedRate}/day for this item?`
      });

      if (res.success) {
        if (onSuccess) onSuccess(proposedRate, product.title);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" id="negotiation-modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Bargain & Make an Offer</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
              Propose a custom daily rental rate to {product.owner_name}
            </p>
          </div>
          <button className="modal-close-btn" id="close-negotiation-modal" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Target Product Summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--border-subtle)' }}>
            <img 
              src={product.image_url || '/product-placeholder.svg'} 
              alt={product.title} 
              style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {product.title}
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                Listed by <strong>{product.owner_name}</strong> · {product.location}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitOffer} id="negotiation-form">
            {/* Rate Compare Grid */}
            <div className="rate-compare-grid">
              <div className="compare-card">
                <div className="compare-title">Original Rate</div>
                <div className="compare-val" style={{ color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                  ₹{originalRate}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>per day</div>
              </div>

              <div className="compare-card" style={{ borderColor: 'var(--border-glow)', background: 'rgba(99, 102, 241, 0.08)' }}>
                <div className="compare-title" style={{ color: '#a5b4fc' }}>Your Proposed Rate</div>
                <div className="compare-val" style={{ color: '#38bdf8' }}>
                  ₹{proposedRate}
                </div>
                <div style={{ fontSize: '0.75rem', color: discountPercent > 0 ? '#34d399' : 'var(--text-dim)', fontWeight: 600 }}>
                  {discountPercent > 0 ? `${discountPercent}% Discount` : 'Regular Price'}
                </div>
              </div>
            </div>

            {/* Slider Control */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }} htmlFor="offer-slider">
                  Adjust Offer Amount
                </label>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>
                  ₹{proposedRate} / day
                </span>
              </div>
              <input 
                id="offer-slider"
                type="range" 
                min={Math.max(5, Math.floor(originalRate * 0.4))}
                max={originalRate}
                step="1"
                value={proposedRate}
                onChange={e => setProposedRate(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                <span>₹{Math.max(5, Math.floor(originalRate * 0.4))} (Min)</span>
                <span>₹{originalRate} (Full price)</span>
              </div>
            </div>

            {/* Pitch Note */}
            <div className="form-group">
              <label className="form-label" htmlFor="offer-message">
                Message to Lender (Give context to increase chance of acceptance)
              </label>
              <textarea 
                id="offer-message"
                className="form-textarea" 
                placeholder="e.g. Planning a 4-day student project. Experienced with gear and will return in pristine condition with extra care."
                value={renterMessage}
                onChange={e => setRenterMessage(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              id="submit-bargain-btn"
              className="btn btn-accent btn-lg" 
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Submitting Offer...' : `🚀 Send ₹${proposedRate}/day Bargain Offer`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
