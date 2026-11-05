import React, { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export const AddProductModal = ({ isOpen, onClose, onSuccess, onAuthRequired }) => {
  const { isAuthenticated, user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [itemCondition, setItemCondition] = useState('Like New');
  const [location, setLocation] = useState(user?.address || '');
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onAuthRequired('login');
      return;
    }

    if (!title || !description || !dailyRate) {
      setError('Title, description and daily rate are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const uploadedImage = imageFile ? await api.uploadProductImage(imageFile) : null;
      const res = await api.createProduct({
        title,
        category,
        daily_rate: Number(dailyRate),
        security_deposit: Number(securityDeposit || 0),
        item_condition: itemCondition,
        location,
        image_url: uploadedImage?.image_url || '',
        description
      });

      if (res.success) {
        if (onSuccess) onSuccess(title);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to list item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" id="add-product-modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>List Equipment for Rent</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
              Turn your unused cameras, tools, and gear into passive income
            </p>
          </div>
          <button className="modal-close-btn" id="close-add-product-modal" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} id="add-product-form">
            <div className="form-group">
              <label className="form-label" htmlFor="prod-title">Item Title / Model</label>
              <input 
                id="prod-title"
                type="text" 
                className="form-input" 
                placeholder="e.g. Blackmagic Pocket Cinema 6K Pro + Sigma 18-35mm"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="form-label" htmlFor="prod-category">Category</label>
                <input
                  id="prod-category"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Cameras, camping, tools"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label" htmlFor="prod-condition">Equipment Condition</label>
                <select 
                  id="prod-condition"
                  className="form-select"
                  value={itemCondition}
                  onChange={e => setItemCondition(e.target.value)}
                >
                  <option value="Brand New">Brand New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="form-label" htmlFor="prod-daily-rate">Daily Rental Rate (₹/day)</label>
                <input 
                  id="prod-daily-rate"
                  type="number" 
                  step="0.5"
                  min="1"
                  className="form-input" 
                  placeholder="35.00"
                  value={dailyRate}
                  onChange={e => setDailyRate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label" htmlFor="prod-security-deposit">Security Deposit (₹)</label>
                <input 
                  id="prod-security-deposit"
                  type="number" 
                  step="1"
                  min="0"
                  className="form-input" 
                  placeholder="150.00"
                  value={securityDeposit}
                  onChange={e => setSecurityDeposit(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prod-location">Pickup Location / City</label>
              <input 
                id="prod-location"
                type="text" 
                className="form-input" 
                placeholder="e.g. Downtown Bengaluru, Karnataka"
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prod-image-file">Product photo</label>
              <input 
                id="prod-image-file"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="form-input" 
                onChange={e => setImageFile(e.target.files?.[0] || null)}
              />
              <small style={{ color: 'var(--text-dim)' }}>JPEG, PNG, GIF or WebP, up to 5 MB.</small>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prod-desc">Item Description & What's Included</label>
              <textarea 
                id="prod-desc"
                className="form-textarea" 
                placeholder="List accessories, lenses, cables, batteries, carry cases, and pickup instructions..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                style={{ minHeight: '90px' }}
              />
            </div>

            <button 
              type="submit" 
              id="submit-product-listing-btn"
              className="btn btn-primary btn-lg" 
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Publishing Equipment...' : '🚀 Publish Equipment for Rent'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
