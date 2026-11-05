import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export const Dashboard = ({ 
  onOpenCheckout, 
  onOpenReceipt, 
  onOpenInspection, 
  onOpenReview, 
  onOpenAddProduct,
  onShowToast
}) => {
  const { user } = useAuth();
  const [hubMode, setHubMode] = useState('renter'); // 'renter' or 'lender'
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sub-tab states
  const [renterTab, setRenterTab] = useState('rentals'); // 'rentals' or 'offers'
  const [lenderTab, setLenderTab] = useState('requests'); // 'requests', 'returns', 'offers', 'listings'

  // Data collections
  const [renterBookings, setRenterBookings] = useState([]);
  const [ownerBookings, setOwnerBookings] = useState([]);
  const [negotiations, setNegotiations] = useState([]);
  const [myListings, setMyListings] = useState([]);

  // Counter offer state
  const [counterNegId, setCounterNegId] = useState(null);
  const [counterRateInput, setCounterRateInput] = useState('');
  const [counterMsgInput, setCounterMsgInput] = useState('');

  // Return request note modal/input
  const [returnBookingId, setReturnBookingId] = useState(null);
  const [returnNoteInput, setReturnNoteInput] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, rBookRes, oBookRes, negRes, listRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getRenterBookings(),
        api.getOwnerBookings(),
        api.getNegotiations(),
        api.getMyListings()
      ]);

      if (sumRes.success) setSummary(sumRes);
      if (rBookRes.success) setRenterBookings(rBookRes.bookings);
      if (oBookRes.success) setOwnerBookings(oBookRes.bookings);
      if (negRes.success) setNegotiations(negRes.negotiations);
      if (listRes.success) setMyListings(listRes.listings);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle owner booking approval / rejection
  const handleBookingAction = async (bookingId, status) => {
    try {
      const res = await api.updateBookingStatus(bookingId, status);
      if (res.success) {
        onShowToast(`Booking #${bookingId} has been ${status}!`, 'success');
        fetchDashboardData();
      }
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  // Handle negotiation response (accept, counter, reject)
  const handleNegResponse = async (negId, action, extra = {}) => {
    try {
      const payload = { action, ...extra };
      const res = await api.respondNegotiation(negId, payload);
      if (res.success) {
        onShowToast(`Negotiation response: ${action.toUpperCase()} processed.`, 'success');
        setCounterNegId(null);
        fetchDashboardData();
      }
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  // Handle renter requesting return
  const handleInitiateReturn = async (e) => {
    e.preventDefault();
    if (!returnBookingId) return;
    try {
      const res = await api.requestReturn({
        booking_id: returnBookingId,
        renter_notes: returnNoteInput || 'Handed back on time in original condition.'
      });
      if (res.success) {
        onShowToast('Return request submitted! Owner notified for gear inspection.', 'success');
        setReturnBookingId(null);
        setReturnNoteInput('');
        fetchDashboardData();
      }
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  // Toggle listing availability
  const handleToggleListing = async (listing) => {
    try {
      const res = await api.updateProduct(listing.id, {
        is_available: !listing.is_available
      });
      if (res.success) {
        onShowToast(`Listing "${listing.title}" availability toggled!`, 'success');
        fetchDashboardData();
      }
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  // Delete listing
  const handleDeleteListing = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete listing "${title}"?`)) return;
    try {
      const res = await api.deleteProduct(id);
      if (res.success) {
        onShowToast(`Listing removed.`, 'info');
        fetchDashboardData();
      }
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-green">🟢 Actively Rented</span>;
      case 'pending':
        return <span className="badge badge-amber">⏳ Pending Approval</span>;
      case 'approved':
        return <span className="badge badge-blue">✓ Approved (Awaiting Payment)</span>;
      case 'return_pending':
        return <span className="badge badge-indigo">🔄 Return in Inspection</span>;
      case 'completed':
        return <span className="badge badge-green">✅ Completed & Deposit Returned</span>;
      case 'rejected':
      case 'cancelled':
        return <span className="badge badge-rose">✕ {status}</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  // Separate negotiations for renter vs owner
  const mySentOffers = negotiations.filter(n => n.renter_id === user?.id);
  const myReceivedOffers = negotiations.filter(n => n.owner_id === user?.id);

  // Return pending bookings for owner inspection
  const ownerReturnsToInspect = ownerBookings.filter(b => b.return_status === 'pending_inspection');

  return (
    <section className="container" id="user-dashboard-section" style={{ paddingBottom: '5rem' }}>
      {/* Top Header & Role Switcher */}
      <div className="dashboard-header">
        <div className="dashboard-title-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.85rem' }}>Activity & Rental Hub</h1>
              <span className="badge badge-indigo">Unified Account</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Logged in as <strong>{user?.full_name}</strong> ({user?.email}) · One account to rent & loan
            </p>
          </div>

          {/* Unified Dual-Role Switcher */}
          <div className="role-switcher-tabs" id="hub-role-switcher">
            <button
              type="button"
              id="switch-to-renter-hub"
              className={`role-tab-btn ${hubMode === 'renter' ? 'active' : ''}`}
              onClick={() => setHubMode('renter')}
            >
              🛍️ Renter Hub
            </button>
            <button
              type="button"
              id="switch-to-lender-hub"
              className={`role-tab-btn ${hubMode === 'lender' ? 'active' : ''}`}
              onClick={() => setHubMode('lender')}
            >
              📦 Lender Hub
            </button>
          </div>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="metrics-cards-grid">
        {hubMode === 'renter' ? (
          <>
            <div className="metric-card">
              <div className="metric-card-title">Active Rentals</div>
              <div className="metric-card-number gradient-text">
                {summary?.renter_metrics?.active_rentals || 0}
              </div>
              <div className="metric-card-subtitle">Equipment currently in hand</div>
            </div>

            <div className="metric-card">
              <div className="metric-card-title">Estimated Savings vs Buying</div>
              <div className="metric-card-number" style={{ color: '#10b981' }}>
                ₹{summary?.renter_metrics?.estimated_savings || '0.00'}
              </div>
              <div className="metric-card-subtitle">Saved by borrowing rather than buying</div>
            </div>

            <div className="metric-card">
              <div className="metric-card-title">Deposits in Escrow</div>
              <div className="metric-card-number" style={{ color: '#06b6d4' }}>
                ₹{summary?.renter_metrics?.active_deposits_held || '0.00'}
              </div>
              <div className="metric-card-subtitle">Held securely until return</div>
            </div>

            <div className="metric-card">
              <div className="metric-card-title">Bargain Proposals</div>
              <div className="metric-card-number" style={{ color: '#a855f7' }}>
                {mySentOffers.length}
              </div>
              <div className="metric-card-subtitle">Counter-offers and discounts</div>
            </div>
          </>
        ) : (
          <>
            <div className="metric-card">
              <div className="metric-card-title">My Listed Equipment</div>
              <div className="metric-card-number gradient-text">
                {summary?.owner_metrics?.total_listings || 0}
              </div>
              <div className="metric-card-subtitle">Active items in catalog</div>
            </div>

            <div className="metric-card">
              <div className="metric-card-title">Total Rental Earnings</div>
              <div className="metric-card-number" style={{ color: '#10b981' }}>
                ₹{summary?.owner_metrics?.total_earnings || '0.00'}
              </div>
              <div className="metric-card-subtitle">Generated from peer rentals</div>
            </div>

            <div className="metric-card">
              <div className="metric-card-title">Pending Rental Requests</div>
              <div className="metric-card-number" style={{ color: '#f59e0b' }}>
                {summary?.owner_metrics?.incoming_requests || 0}
              </div>
              <div className="metric-card-subtitle">Awaiting your approval</div>
            </div>

            <div className="metric-card">
              <div className="metric-card-title">Returns to Inspect</div>
              <div className="metric-card-number" style={{ color: '#a855f7' }}>
                {ownerReturnsToInspect.length}
              </div>
              <div className="metric-card-subtitle">Ready for deposit release</div>
            </div>
          </>
        )}
      </div>

      {/* ============================================================== */}
      {/* RENTER HUB VIEW */}
      {/* ============================================================== */}
      {hubMode === 'renter' && (
        <div>
          {/* Sub tabs */}
          <div className="dashboard-nav-tabs">
            <button
              id="renter-tab-rentals"
              className={`dashboard-tab ${renterTab === 'rentals' ? 'active' : ''}`}
              onClick={() => setRenterTab('rentals')}
            >
              📅 My Equipment Bookings ({renterBookings.length})
            </button>
            <button
              id="renter-tab-offers"
              className={`dashboard-tab ${renterTab === 'offers' ? 'active' : ''}`}
              onClick={() => setRenterTab('offers')}
            >
              💬 My Bargain Proposals ({mySentOffers.length})
            </button>
          </div>

          {/* Renter Bookings */}
          {renterTab === 'rentals' && (
            <div className="items-table-wrapper" id="renter-bookings-list">
              {renterBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-dim)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🛒</div>
                  <h3>You haven't rented any equipment yet</h3>
                  <p style={{ marginTop: '0.4rem' }}>Explore cameras, drones, camping tents and tools in the catalog.</p>
                </div>
              ) : (
                renterBookings.map((b) => (
                  <div key={b.id} className="item-row" id={`booking-row-${b.id}`}>
                    <div className="item-row-left">
                      <img 
                        src={b.product_image || '/product-placeholder.svg'} 
                        alt={b.product_title} 
                        className="item-thumb" 
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.2rem' }}>
                          <span className="item-info-title">{b.product_title}</span>
                          {getStatusBadge(b.status)}
                          {b.is_negotiated && <span className="badge badge-blue">Negotiated Rate</span>}
                        </div>
                        <div className="item-info-meta">
                          <span>Owner: <strong>{b.owner_name}</strong></span>
                          <span>Dates: {b.start_date} → {b.end_date} ({b.total_days} days)</span>
                          <span>Daily Rate: ₹{b.daily_rate}/day</span>
                          <span>Total: <strong>₹{b.total_amount}</strong> (Deposit: ₹{b.security_deposit})</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons based on status */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {b.status === 'approved' && (
                        <button
                          type="button"
                          id={`pay-booking-btn-${b.id}`}
                          className="btn btn-primary btn-sm"
                          onClick={() => onOpenCheckout(b)}
                        >
                          💳 Pay ₹{b.total_amount} (Activate Rental)
                        </button>
                      )}

                      {b.status === 'active' && (
                        <button
                          type="button"
                          id={`return-gear-btn-${b.id}`}
                          className="btn btn-accent btn-sm"
                          onClick={() => setReturnBookingId(b.id)}
                        >
                          🔄 Hand Back & Request Return
                        </button>
                      )}

                      {b.payment_id && (
                        <button
                          type="button"
                          id={`receipt-btn-${b.id}`}
                          className="btn btn-outline btn-sm"
                          onClick={() => onOpenReceipt(b.payment_id)}
                        >
                          🧾 View Receipt
                        </button>
                      )}

                      {b.status === 'completed' && !b.has_reviewed && (
                        <button
                          type="button"
                          id={`review-btn-${b.id}`}
                          className="btn btn-secondary btn-sm"
                          onClick={() => onOpenReview(b)}
                        >
                          ⭐ Rate & Review
                        </button>
                      )}

                      {b.status === 'pending' && (
                        <button
                          type="button"
                          className="btn btn-outline btn-danger btn-sm"
                          onClick={() => handleBookingAction(b.id, 'cancelled')}
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Renter Negotiations / Bargain Offers */}
          {renterTab === 'offers' && (
            <div className="items-table-wrapper" id="renter-offers-list">
              {mySentOffers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-dim)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💬</div>
                  <h3>No bargain proposals sent</h3>
                  <p>When you see an item in the catalog, click "Bargain" to propose a custom rate!</p>
                </div>
              ) : (
                mySentOffers.map((n) => (
                  <div key={n.id} className="item-row" id={`negotiation-row-${n.id}`}>
                    <div className="item-row-left">
                      <img 
                        src={n.product_image || '/product-placeholder.svg'} 
                        alt={n.product_title} 
                        className="item-thumb" 
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.2rem' }}>
                          <span className="item-info-title">{n.product_title}</span>
                          <span className={`badge ${
                            n.status === 'accepted' ? 'badge-green' :
                            n.status === 'countered' ? 'badge-indigo' :
                            n.status === 'rejected' ? 'badge-rose' : 'badge-amber'
                          }`}>
                            {n.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="item-info-meta">
                          <span>Original Rate: <strong>₹{n.original_daily_rate}/day</strong></span>
                          <span>Your Proposed Rate: <strong style={{ color: '#38bdf8' }}>₹{n.proposed_daily_rate}/day</strong></span>
                          {n.counter_daily_rate && (
                            <span>Owner Counter-Offer: <strong style={{ color: '#a855f7' }}>₹{n.counter_daily_rate}/day</strong></span>
                          )}
                        </div>
                        {n.owner_message && (
                          <div style={{ fontSize: '0.8rem', color: '#a5b4fc', marginTop: '0.35rem' }}>
                            <em>Owner reply:</em> "{n.owner_message}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions if countered */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {n.status === 'countered' && (
                        <>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleNegResponse(n.id, 'accept')}
                          >
                            ✓ Accept ₹{n.counter_daily_rate}/day
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-danger btn-sm"
                            onClick={() => handleNegResponse(n.id, 'reject')}
                          >
                            Decline
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* LENDER HUB VIEW */}
      {/* ============================================================== */}
      {hubMode === 'lender' && (
        <div>
          {/* Sub tabs */}
          <div className="dashboard-nav-tabs">
            <button
              id="lender-tab-requests"
              className={`dashboard-tab ${lenderTab === 'requests' ? 'active' : ''}`}
              onClick={() => setLenderTab('requests')}
            >
              📥 Rental Requests ({ownerBookings.filter(b => b.status === 'pending').length})
            </button>
            <button
              id="lender-tab-returns"
              className={`dashboard-tab ${lenderTab === 'returns' ? 'active' : ''}`}
              onClick={() => setLenderTab('returns')}
            >
              🔍 Returns to Inspect ({ownerReturnsToInspect.length})
            </button>
            <button
              id="lender-tab-offers"
              className={`dashboard-tab ${lenderTab === 'offers' ? 'active' : ''}`}
              onClick={() => setLenderTab('offers')}
            >
              💬 Bargains Received ({myReceivedOffers.length})
            </button>
            <button
              id="lender-tab-listings"
              className={`dashboard-tab ${lenderTab === 'listings' ? 'active' : ''}`}
              onClick={() => setLenderTab('listings')}
            >
              📦 My Listed Equipment ({myListings.length})
            </button>
          </div>

          {/* Incoming Rental Requests */}
          {lenderTab === 'requests' && (
            <div className="items-table-wrapper" id="lender-requests-list">
              {ownerBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-dim)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📥</div>
                  <h3>No incoming rental requests</h3>
                  <p>When renters request to rent your equipment, requests will appear here for your approval.</p>
                </div>
              ) : (
                ownerBookings.map((b) => (
                  <div key={b.id} className="item-row" id={`lender-req-row-${b.id}`}>
                    <div className="item-row-left">
                      <img 
                        src={b.product_image || '/product-placeholder.svg'} 
                        alt={b.product_title} 
                        className="item-thumb" 
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.2rem' }}>
                          <span className="item-info-title">{b.product_title}</span>
                          {getStatusBadge(b.status)}
                        </div>
                        <div className="item-info-meta">
                          <span>Renter: <strong>{b.renter_name}</strong> ({b.renter_phone || b.renter_email})</span>
                          <span>Dates: {b.start_date} → {b.end_date} ({b.total_days} days)</span>
                          <span>Total Payout: <strong style={{ color: '#10b981' }}>₹{b.rent_amount}</strong> (+ ₹{b.security_deposit} held deposit)</span>
                        </div>
                        {b.renter_note && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            <em>Renter note:</em> "{b.renter_note}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {b.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            id={`approve-booking-${b.id}`}
                            className="btn btn-primary btn-sm"
                            onClick={() => handleBookingAction(b.id, 'approved')}
                          >
                            ✓ Approve Rental
                          </button>
                          <button
                            type="button"
                            id={`reject-booking-${b.id}`}
                            className="btn btn-outline btn-danger btn-sm"
                            onClick={() => handleBookingAction(b.id, 'rejected')}
                          >
                            ✕ Decline
                          </button>
                        </>
                      )}

                      {b.status === 'return_pending' && (
                        <button
                          type="button"
                          className="btn btn-accent btn-sm"
                          onClick={() => onOpenInspection({ ...b, return_id: b.return_id })}
                        >
                          🔍 Inspect & Release Deposit
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Returns to Inspect */}
          {lenderTab === 'returns' && (
            <div className="items-table-wrapper" id="lender-returns-list">
              {ownerReturnsToInspect.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-dim)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✨</div>
                  <h3>No pending returns awaiting inspection</h3>
                  <p>When renters hand back equipment, you can inspect gear and refund deposits here.</p>
                </div>
              ) : (
                ownerReturnsToInspect.map((b) => (
                  <div key={b.id} className="item-row">
                    <div className="item-row-left">
                      <img 
                        src={b.product_image || '/product-placeholder.svg'} 
                        alt={b.product_title} 
                        className="item-thumb" 
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.2rem' }}>
                          <span className="item-info-title">{b.product_title}</span>
                          <span className="badge badge-amber">Ready for Inspection</span>
                        </div>
                        <div className="item-info-meta">
                          <span>Renter: <strong>{b.renter_name}</strong></span>
                          <span>Security Deposit in Escrow: <strong>₹{b.security_deposit}</strong></span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      id={`inspect-return-btn-${b.id}`}
                      className="btn btn-accent btn-sm"
                      onClick={() => onOpenInspection({ ...b, return_id: b.return_id })}
                    >
                      🔍 Inspect Gear & Refund Deposit
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Received Bargain Proposals */}
          {lenderTab === 'offers' && (
            <div className="items-table-wrapper" id="lender-offers-list">
              {myReceivedOffers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-dim)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏷️</div>
                  <h3>No bargain proposals received</h3>
                  <p>When renters negotiate rates on your equipment, you can counter-offer or accept here.</p>
                </div>
              ) : (
                myReceivedOffers.map((n) => (
                  <div key={n.id} className="item-row" id={`received-offer-row-${n.id}`}>
                    <div className="item-row-left">
                      <img 
                        src={n.product_image || '/product-placeholder.svg'} 
                        alt={n.product_title} 
                        className="item-thumb" 
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.2rem' }}>
                          <span className="item-info-title">{n.product_title}</span>
                          <span className={`badge ${
                            n.status === 'accepted' ? 'badge-green' :
                            n.status === 'countered' ? 'badge-indigo' :
                            n.status === 'rejected' ? 'badge-rose' : 'badge-amber'
                          }`}>
                            {n.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="item-info-meta">
                          <span>From Renter: <strong>{n.renter_name}</strong></span>
                          <span>Original Rate: ₹{n.original_daily_rate}/day</span>
                          <span>Proposed Rate: <strong style={{ color: '#38bdf8' }}>₹{n.proposed_daily_rate}/day</strong></span>
                        </div>
                        {n.renter_message && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            <em>Renter's pitch:</em> "{n.renter_message}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {n.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            id={`accept-offer-${n.id}`}
                            className="btn btn-primary btn-sm"
                            onClick={() => handleNegResponse(n.id, 'accept')}
                          >
                            ✓ Accept ₹{n.proposed_daily_rate}/day
                          </button>
                          <button
                            type="button"
                            id={`counter-offer-btn-${n.id}`}
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setCounterNegId(n.id);
                              setCounterRateInput(Math.round((n.original_daily_rate + n.proposed_daily_rate) / 2));
                            }}
                          >
                            🔄 Counter-Offer
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-danger btn-sm"
                            onClick={() => handleNegResponse(n.id, 'reject')}
                          >
                            Decline
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* My Listed Equipment */}
          {lenderTab === 'listings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button
                  type="button"
                  id="dashboard-add-product-btn"
                  className="btn btn-primary"
                  onClick={onOpenAddProduct}
                >
                  + Add New Equipment
                </button>
              </div>

              <div className="items-table-wrapper" id="lender-listings-list">
                {myListings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-dim)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📷</div>
                    <h3>You haven't listed any equipment yet</h3>
                    <p style={{ marginBottom: '1.25rem' }}>Start earning by listing your cameras, drones, camping tents, or tools.</p>
                    <button type="button" className="btn btn-primary" onClick={onOpenAddProduct}>
                      + List Your First Item
                    </button>
                  </div>
                ) : (
                  myListings.map((l) => (
                    <div key={l.id} className="item-row" id={`my-listing-row-${l.id}`}>
                      <div className="item-row-left">
                        <img 
                          src={l.image_url || '/product-placeholder.svg'} 
                          alt={l.title} 
                          className="item-thumb" 
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.2rem' }}>
                            <span className="item-info-title">{l.title}</span>
                            <span className={`badge ${l.is_available ? 'badge-green' : 'badge-rose'}`}>
                              {l.is_available ? 'Available' : 'Paused / Rented'}
                            </span>
                            <span className="badge badge-blue">{l.category}</span>
                          </div>
                          <div className="item-info-meta">
                            <span>Rate: <strong>₹{l.daily_rate}/day</strong></span>
                            <span>Deposit: ₹{l.security_deposit}</span>
                            <span>Total Bookings: {l.total_bookings || 0}</span>
                            <span>Revenue: <strong style={{ color: '#10b981' }}>₹{l.total_revenue || 0}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleToggleListing(l)}
                        >
                          {l.is_available ? 'Pause Listing' : 'Make Available'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-danger btn-sm"
                          onClick={() => handleDeleteListing(l.id, l.title)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Counter-Offer Prompt Modal */}
      {counterNegId && (
        <div className="modal-overlay" onClick={() => setCounterNegId(null)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem' }}>Propose Counter-Offer</h3>
              <button className="modal-close-btn" onClick={() => setCounterNegId(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label" htmlFor="counter-rate-field">Your Counter Daily Rate (₹/day)</label>
                <input 
                  id="counter-rate-field"
                  type="number"
                  className="form-input" 
                  value={counterRateInput}
                  onChange={e => setCounterRateInput(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="counter-msg-field">Message to Renter</label>
                <textarea 
                  id="counter-msg-field"
                  className="form-textarea" 
                  placeholder="e.g. Can meet you halfway if you take extra care of the lenses!"
                  value={counterMsgInput}
                  onChange={e => setCounterMsgInput(e.target.value)}
                />
              </div>
              <button 
                type="button" 
                id="send-counter-offer-btn"
                className="btn btn-primary btn-lg" 
                style={{ width: '100%' }}
                onClick={() => handleNegResponse(counterNegId, 'counter', { counter_rate: counterRateInput, message: counterMsgInput })}
              >
                Send Counter-Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Request Modal */}
      {returnBookingId && (
        <div className="modal-overlay" onClick={() => setReturnBookingId(null)}>
          <div className="modal-content" style={{ maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem' }}>Initiate Gear Return</h3>
              <button className="modal-close-btn" onClick={() => setReturnBookingId(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Notify the equipment owner that you are ready to hand back the item. The owner will inspect the condition and release your security deposit from escrow.
              </p>
              <form onSubmit={handleInitiateReturn}>
                <div className="form-group">
                  <label className="form-label" htmlFor="return-handover-notes">Handover Notes for Owner</label>
                  <textarea 
                    id="return-handover-notes"
                    className="form-textarea" 
                    placeholder="e.g. Gear packed into original carry bag with all cables and lens caps. Left at reception or ready for pickup."
                    value={returnNoteInput}
                    onChange={e => setReturnNoteInput(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  id="confirm-return-request-btn"
                  className="btn btn-accent btn-lg" 
                  style={{ width: '100%' }}
                >
                  🚀 Submit Return & Notify Owner
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
