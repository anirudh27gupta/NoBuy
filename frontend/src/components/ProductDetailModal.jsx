import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export const ProductDetailModal = ({ product, onClose, onBargain, onBookingSuccess, onAuthRequired }) => {
  if (!product) return null;

  const { user, isAuthenticated } = useAuth();
  const [detailedProduct, setDetailedProduct] = useState(product);
  const [loading, setLoading] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Date selectors default to tomorrow and 3 days later
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultEnd = new Date(tomorrow);
  defaultEnd.setDate(defaultEnd.getDate() + 3);

  const formatDate = (d) => d.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(formatDate(tomorrow));
  const [endDate, setEndDate] = useState(formatDate(defaultEnd));
  const [renterNote, setRenterNote] = useState('');

  // Fetch full details and reviews
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.getProduct(product.id);
        if (res.success) {
          setDetailedProduct(res.product);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDetail();
  }, [product.id]);

  // Calculate rental pricing
  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  const totalDays = calculateDays();
  const rentSubtotal = (detailedProduct.daily_rate * totalDays).toFixed(2);
  const securityDeposit = Number(detailedProduct.security_deposit).toFixed(2);
  const totalAmount = (Number(rentSubtotal) + Number(securityDeposit)).toFixed(2);

  const isOwner = user && user.id === detailedProduct.owner_id;

  const handleBookNow = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onAuthRequired('login');
      return;
    }
    if (isOwner) {
      setBookingError('You cannot rent your own listed equipment.');
      return;
    }

    setSubmittingBooking(true);
    setBookingError('');

    try {
      const res = await api.createBooking({
        product_id: detailedProduct.id,
        start_date: startDate,
        end_date: endDate,
        renter_note: renterNote,
      });

      if (res.success) {
        if (onBookingSuccess) onBookingSuccess(res.booking_id, detailedProduct.title);
        onClose();
      }
    } catch (err) {
      setBookingError(err.message || 'Failed to submit booking');
    } finally {
      setSubmittingBooking(false);
    }
  };

  return (
    <div className="modal-overlay" id="product-detail-modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '820px' }} 
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="badge badge-blue">{detailedProduct.category}</span>
            <span className="badge badge-green">{detailedProduct.item_condition}</span>
          </div>
          <button className="modal-close-btn" id="close-detail-modal" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Left: Product Media & Info */}
            <div>
              <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '280px', background: '#090d16', marginBottom: '1.25rem' }}>
                <img 
                  src={detailedProduct.image_url || '/product-placeholder.svg'} 
                  alt={detailedProduct.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>

              <h2 style={{ fontSize: '1.45rem', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                {detailedProduct.title}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <span>📍 {detailedProduct.location}</span>
                <span>★ {detailedProduct.avg_rating > 0 ? `${detailedProduct.avg_rating} Rating` : 'New listing'}</span>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>
                {detailedProduct.description}
              </p>

              {/* Owner card */}
              <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Lender Profile
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <img 
                    src={detailedProduct.owner_avatar || '/avatar-placeholder.svg'} 
                    alt={detailedProduct.owner_name} 
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{detailedProduct.owner_name}</div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                      {detailedProduct.owner_bio || 'Verified gear owner on No-Buy.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              {detailedProduct.reviews && detailedProduct.reviews.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Community Reviews ({detailedProduct.reviews.length})</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {detailedProduct.reviews.map(r => (
                      <div key={r.id} style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.reviewer_name}</span>
                          <span style={{ color: '#fbbf24', fontSize: '0.85rem' }}>{'★'.repeat(r.rating)}</span>
                        </div>
                        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Booking Calculator & Reservation Box */}
            <div>
              <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-glow)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-display)' }}>
                      ₹{detailedProduct.daily_rate}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}> / day</span>
                  </div>
                  <span className="badge badge-indigo">Instant Reserve</span>
                </div>

                {bookingError && (
                  <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem', marginBottom: '1rem' }}>
                    {bookingError}
                  </div>
                )}

                <form onSubmit={handleBookNow} id="booking-reserve-form">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div>
                      <label className="form-label" htmlFor="book-start-date">Start Date</label>
                      <input 
                        id="book-start-date"
                        type="date" 
                        className="form-input" 
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        min={formatDate(new Date())}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label" htmlFor="book-end-date">End Date</label>
                      <input 
                        id="book-end-date"
                        type="date" 
                        className="form-input" 
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        min={startDate}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="book-note">Note to Owner (Optional)</label>
                    <textarea 
                      id="book-note"
                      className="form-textarea" 
                      placeholder="e.g. Need this for a weekend documentary shoot in Marin..."
                      value={renterNote}
                      onChange={e => setRenterNote(e.target.value)}
                      style={{ minHeight: '60px' }}
                    />
                  </div>

                  {/* Pricing Breakdown Card */}
                  <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        ₹{detailedProduct.daily_rate} × {totalDays} {totalDays === 1 ? 'day' : 'days'}
                      </span>
                      <span>₹{rentSubtotal}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Refundable Security Deposit 🛡️
                      </span>
                      <span>₹{securityDeposit}</span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#10b981', marginBottom: '0.75rem' }}>
                      ✓ Deposit held safely in simulated escrow & refunded upon return inspection
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
                      <span>Total Due Today:</span>
                      <span style={{ color: '#10b981' }}>₹{totalAmount}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {isOwner ? (
                    <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-md)', color: '#a5b4fc', fontSize: '0.85rem' }}>
                      ℹ This is your listing. Switch accounts or view it in Lender Hub.
                    </div>
                  ) : (
                    <>
                      <button 
                        type="submit" 
                        id="submit-booking-btn"
                        className="btn btn-primary btn-lg" 
                        style={{ width: '100%', marginBottom: '0.75rem' }}
                        disabled={submittingBooking}
                      >
                        {submittingBooking ? 'Submitting Reservation...' : '📅 Reserve & Request Rental'}
                      </button>

                      <button 
                        type="button" 
                        id="trigger-bargain-btn"
                        className="btn btn-secondary btn-lg" 
                        style={{ width: '100%' }}
                        onClick={() => {
                          onClose();
                          onBargain(detailedProduct);
                        }}
                      >
                        💬 Want a better price? Make an Offer
                      </button>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
