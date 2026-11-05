import React, { useState } from 'react';
import { api } from '../api';

export const InspectionModal = ({ returnItem, onClose, onSuccess }) => {
  if (!returnItem) return null;

  const [condition, setCondition] = useState(returnItem.item_condition || 'good');
  const [damageFee, setDamageFee] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const deposit = Number(returnItem.security_deposit || 0);
  const calculatedRefund = Math.max(0, deposit - Number(damageFee)).toFixed(2);

  const handleInspect = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.inspectReturn(returnItem.return_id, {
        item_condition: condition,
        damage_fee: Number(damageFee),
        owner_remarks: remarks || `Inspection complete: Item in ${condition} condition.`
      });

      if (res.success) {
        if (onSuccess) onSuccess(res.refunded_deposit, returnItem.product_title);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit inspection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" id="inspection-modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Gear Return & Quality Inspection</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
              Inspect returned equipment and release renter's escrow deposit
            </p>
          </div>
          <button className="modal-close-btn" id="close-inspection-modal" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Item & Renter Handover note */}
          <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem' }}>
              {returnItem.product_title}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Rented by <strong>{returnItem.renter_name}</strong>
            </div>
            {returnItem.renter_notes && (
              <div style={{ fontSize: '0.8rem', background: 'var(--bg-surface)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}>
                <em>Renter note:</em> "{returnItem.renter_notes}"
              </div>
            )}
          </div>

          {error && (
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleInspect} id="inspection-form">
            {/* Condition assessment radio chips */}
            <div className="form-group">
              <label className="form-label">Evaluated Equipment Condition</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  id="cond-excellent"
                  className={`btn btn-sm ${condition === 'excellent' ? 'btn-secondary' : 'btn-outline'}`}
                  style={{ borderColor: condition === 'excellent' ? '#10b981' : 'var(--border-subtle)' }}
                  onClick={() => { setCondition('excellent'); setDamageFee(0); }}
                >
                  ✨ Pristine / Like New
                </button>
                <button
                  type="button"
                  id="cond-good"
                  className={`btn btn-sm ${condition === 'good' ? 'btn-secondary' : 'btn-outline'}`}
                  style={{ borderColor: condition === 'good' ? '#10b981' : 'var(--border-subtle)' }}
                  onClick={() => { setCondition('good'); setDamageFee(0); }}
                >
                  👍 Good (Normal Use)
                </button>
                <button
                  type="button"
                  id="cond-minor"
                  className={`btn btn-sm ${condition === 'minor_wear' ? 'btn-secondary' : 'btn-outline'}`}
                  style={{ borderColor: condition === 'minor_wear' ? '#f59e0b' : 'var(--border-subtle)' }}
                  onClick={() => setCondition('minor_wear')}
                >
                  ⚠️ Minor Wear & Tear
                </button>
                <button
                  type="button"
                  id="cond-damaged"
                  className={`btn btn-sm ${condition === 'damaged' ? 'btn-secondary' : 'btn-outline'}`}
                  style={{ borderColor: condition === 'damaged' ? '#f43f5e' : 'var(--border-subtle)' }}
                  onClick={() => setCondition('damaged')}
                >
                  💥 Damaged / Issue
                </button>
              </div>
            </div>

            {/* Damage Fee Deduction if not pristine */}
            {(condition === 'minor_wear' || condition === 'damaged') && (
              <div className="form-group">
                <label className="form-label" htmlFor="damage-fee-input">
                  Damage Deduction from Deposit (Max: ₹{deposit})
                </label>
                <input 
                  id="damage-fee-input"
                  type="number"
                  min="0"
                  max={deposit}
                  step="1"
                  className="form-input" 
                  value={damageFee}
                  onChange={e => setDamageFee(Math.min(deposit, Math.max(0, Number(e.target.value))))}
                />
              </div>
            )}

            {/* Deposit Refund Calculation Box */}
            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Held Escrow Deposit:</span>
                <span>₹{deposit.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ color: damageFee > 0 ? '#fb7185' : 'var(--text-muted)' }}>
                  Damage Fee Deducted:
                </span>
                <span style={{ color: damageFee > 0 ? '#fb7185' : 'inherit' }}>
                  -₹{Number(damageFee).toFixed(2)}
                </span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem' }}>
                <span>Net Refund to Renter:</span>
                <span style={{ color: '#10b981' }}>₹{calculatedRefund}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="owner-remarks-input">Owner Inspection Remarks</label>
              <textarea 
                id="owner-remarks-input"
                className="form-textarea" 
                placeholder="e.g. Gear was cleaned and lenses are clear of scratches. Thank you!"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              id="confirm-inspection-btn"
              className="btn btn-primary btn-lg" 
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Processing Refund...' : `✓ Complete Return & Refund ₹${calculatedRefund}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
