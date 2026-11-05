import React, { useEffect, useState } from 'react';
import { api } from '../api';

export const ReceiptModal = ({ paymentId, onClose }) => {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!paymentId) return;
    const fetchReceipt = async () => {
      try {
        const res = await api.getReceipt(paymentId);
        if (res.success) {
          setReceipt(res.receipt);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [paymentId]);

  if (!paymentId) return null;

  return (
    <div className="modal-overlay" id="receipt-modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🧾</span>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Rental Payment Receipt</h3>
              <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>Simulated Transaction</span>
            </div>
          </div>
          <button className="modal-close-btn" id="close-receipt-modal" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-dim)' }}>
              Loading receipt details...
            </div>
          ) : !receipt ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-dim)' }}>
              Receipt record not found.
            </div>
          ) : (
            <div id="printable-receipt">
              {/* Receipt Header details */}
              <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Transaction ID:</span>
                  <strong style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{receipt.transaction_id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Date & Time:</span>
                  <span>{new Date(receipt.paid_at).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Payment Method:</span>
                  <span style={{ textTransform: 'capitalize' }}>{receipt.payment_method}</span>
                </div>
              </div>

              {/* Rented Equipment Info */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Equipment Details
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  {receipt.product_title}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Rental Duration: <strong>{receipt.start_date}</strong> to <strong>{receipt.end_date}</strong> ({receipt.total_days} days)
                </div>
              </div>

              {/* Parties */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.825rem' }}>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontWeight: 600 }}>Renter:</div>
                  <div style={{ fontWeight: 700 }}>{receipt.renter_name}</div>
                  <div style={{ color: 'var(--text-dim)' }}>{receipt.renter_email}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontWeight: 600 }}>Lender / Owner:</div>
                  <div style={{ fontWeight: 700 }}>{receipt.owner_name}</div>
                  <div style={{ color: 'var(--text-dim)' }}>{receipt.owner_email}</div>
                </div>
              </div>

              {/* Line Items */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                  <span>Rent ({receipt.total_days} days @ ₹{receipt.daily_rate}/day)</span>
                  <span>₹{receipt.rent_amount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                  <span>Security Deposit (In Escrow)</span>
                  <span>₹{receipt.deposit_amount}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.15rem' }}>
                  <span>Total Amount Paid:</span>
                  <span style={{ color: '#10b981' }}>₹{receipt.total_amount}</span>
                </div>
              </div>

              {/* Escrow note */}
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem', fontSize: '0.775rem', color: '#a5b4fc', textAlign: 'center' }}>
                🔒 Status: Escrow {receipt.escrow_status.replace(/_/g, ' ').toUpperCase()} · Deposit is automatically returned after handover inspection.
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => window.print()}
          >
            🖨️ Print Receipt
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
