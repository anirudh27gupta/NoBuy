import React from 'react';

export const ProductCard = ({ product, onSelect, onBargain }) => {
  return (
    <div className="product-card" id={`product-card-${product.id}`}>
      <div className="product-image-container" onClick={() => onSelect(product)} style={{ cursor: 'pointer' }}>
        <img 
          src={product.image_url || '/product-placeholder.svg'} 
          alt={product.title} 
          className="product-img"
          loading="lazy"
        />
        <div className="product-condition-tag">
          {product.item_condition}
        </div>
        <div className="product-category-tag">
          {product.category}
        </div>
      </div>

      <div className="product-card-body">
        {/* Owner & Rating Row */}
        <div className="product-owner-row">
          <div className="owner-info-small">
            <img 
              src={product.owner_avatar || '/avatar-placeholder.svg'} 
              alt={product.owner_name} 
              className="owner-avatar-small" 
            />
            <span className="owner-name-small">{product.owner_name}</span>
          </div>
          <div className="rating-badge-small">
            <span>★</span>
            <span>{product.avg_rating > 0 ? product.avg_rating : 'New'}</span>
            {product.review_count > 0 && (
              <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>({product.review_count})</span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 
          className="product-card-title" 
          onClick={() => onSelect(product)}
          style={{ cursor: 'pointer' }}
          title={product.title}
        >
          {product.title}
        </h3>

        {/* Location */}
        <div className="product-card-location">
          <span>📍</span> {product.location}
        </div>

        {/* Pricing Box */}
        <div className="product-pricing-box">
          <div>
            <span className="product-rate-main">₹{product.daily_rate}</span>
            <span className="product-rate-unit"> / day</span>
          </div>
          <div className="product-deposit-note">
            + ₹{product.security_deposit} deposit
          </div>
        </div>

        {/* Card Actions */}
        <div className="product-card-actions">
          <button 
            type="button" 
            id={`book-btn-${product.id}`}
            className="btn btn-primary btn-sm"
            onClick={() => onSelect(product)}
          >
            📅 Rent Gear
          </button>
          <button 
            type="button" 
            id={`bargain-btn-${product.id}`}
            className="btn btn-secondary btn-sm"
            onClick={() => onBargain(product)}
            title="Make a counter-offer or propose a custom daily rental rate"
          >
            💬 Bargain
          </button>
        </div>
      </div>
    </div>
  );
};
