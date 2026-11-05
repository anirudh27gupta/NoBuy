import React, { useState } from 'react';
import { api } from '../api';

export const CheckoutModal = ({ booking, onClose, onSuccess }) => {
  if (!booking) return null;

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [upiId, setUpiId] = useState('renter@simulatedupi');
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState('');

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Realistic simulated step animation
      setProcessingStep('Authenticating payment method with simulated sandbox...');
      await new Promise(r => setTimeout(r, 700));

      setProcessingStep('Placing security deposit into escrow vault...');
      await new Promise(r => setTimeout(r, 700));

      setProcessingStep('Finalizing transaction with MySQL persistent store...');

      const cardLast4 = paymentMethod === 'card' ? '4242' : null;
      const res = await api.processPayment({
        booking_id: booking.id,
        payment_method: paymentMethod,
        card_last4: cardLast4,
        upi_id: paymentMethod === 'upi' ? upiId : null
      });

      if (res.success) {
        if (onSuccess) onSuccess(res.payment_id, res.transaction_id);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Payment simulation failed');
      setLoading(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="modal-overlay" id="checkout-modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Simulated Secure Checkout</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
              Booking #{booking.id} · {booking.product_title}
            </p>
          </div>
          <button className="modal-close-btn" id="close-checkout-modal" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Escrow assurance banner */}
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🛡️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#34d399' }}>
                Simulated Escrow Protection Active
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                Your security deposit (₹{booking.security_deposit}) is locked in escrow until return inspection is approved.
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Equipment Rental ({booking.total_days} days @ ₹{booking.daily_rate}/day)</span>
              <span style={{ fontWeight: 600 }}>₹{booking.rent_amount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Refundable Security Deposit (Escrow)</span>
              <span style={{ fontWeight: 600 }}>₹{booking.security_deposit}</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.15rem' }}>
              <span>Total Payment:</span>
              <span style={{ color: '#10b981' }}>₹{booking.total_amount}</span>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          {/* Payment Method Selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Select Simulated Payment Method</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                id="pay-method-card"
                className={`btn btn-sm ${paymentMethod === 'card' ? 'btn-secondary' : 'btn-outline'}`}
                style={{ borderColor: paymentMethod === 'card' ? 'var(--primary)' : 'var(--border-subtle)' }}
                onClick={() => setPaymentMethod('card')}
              >
                💳 Card
              </button>
              <button
                type="button"
                id="pay-method-upi"
                className={`btn btn-sm ${paymentMethod === 'upi' ? 'btn-secondary' : 'btn-outline'}`}
                style={{ borderColor: paymentMethod === 'upi' ? 'var(--primary)' : 'var(--border-subtle)' }}
                onClick={() => setPaymentMethod('upi')}
              >
                📱 UPI
              </button>
              <button
                type="button"
                id="pay-method-wallet"
                className={`btn btn-sm ${paymentMethod === 'wallet' ? 'btn-secondary' : 'btn-outline'}`}
                style={{ borderColor: paymentMethod === 'wallet' ? 'var(--primary)' : 'var(--border-subtle)' }}
                onClick={() => setPaymentMethod('wallet')}
              >
                👛 Wallet
              </button>
            </div>
          </div>

          <form onSubmit={handlePay} id="simulated-payment-form">
            {paymentMethod === 'card' && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="card-num">Test Card Number</label>
                  <input 
                    id="card-num"
                    type="text" 
                    className="form-input" 
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label className="form-label" htmlFor="card-exp">Expiry (MM/YY)</label>
                    <input 
                      id="card-exp"
                      type="text" 
                      className="form-input" 
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="card-cvc">CVC</label>
                    <input 
                      id="card-cvc"
                      type="text" 
                      className="form-input" 
                      value={cardCvc}
                      onChange={e => setCardCvc(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {paymentMethod === 'upi' && (
              <div className="form-group">
                <label className="form-label" htmlFor="upi-vpa">Simulated UPI ID (VPA)</label>
                <input 
                  id="upi-vpa"
                  type="text" 
                  className="form-input" 
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="name@okaxis"
                  required
                />
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div style={{ padding: '0.85rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                Simulated Sandbox Wallet Balance: <strong>₹1,50,000.00</strong>
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-md)', color: '#a5b4fc', fontSize: '0.9rem' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem', animation: 'spin 1s infinite' }}>⏳</div>
                {processingStep}
              </div>
            ) : (
              <button 
                type="submit" 
                id="submit-payment-btn"
                className="btn btn-primary btn-lg" 
                style={{ width: '100%' }}
              >
                🔒 Confirm & Pay ₹{booking.total_amount} (Simulated)
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
