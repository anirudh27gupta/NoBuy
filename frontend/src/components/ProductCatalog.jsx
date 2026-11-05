import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { ProductCard } from './ProductCard';

export const ProductCatalog = ({ search, onSearchChange, onSelectProduct, onBargainProduct }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [maxPrice, setMaxPrice] = useState(20000);
  const [sort, setSort] = useState('newest');

  const fetchCategories = async () => {
    try {
      const res = await api.getCategories();
      if (res.success) {
        setCategories(res.categories.map((item) => item.category));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        category: selectedCategory === 'All' ? '' : selectedCategory,
        condition: selectedCondition === 'All' ? '' : selectedCondition,
        max_price: maxPrice,
        available_only: true,
        sort,
      };
      const res = await api.getProducts(params);
      if (res.success) {
        setProducts(res.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedCondition, maxPrice, sort]);

  const categoryList = ['All', ...categories];

  return (
    <section className="container" id="product-catalog-section" style={{ paddingBottom: '4rem' }}>
      {/* Filters */}
      <div className="filter-bar">
        {/* Categories Horizontal Scroll */}
        <div className="categories-scroll">
          {categoryList.map((cat) => (
            <button
              key={cat}
              type="button"
              id={`cat-chip-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filter Controls Row */}
        <div className="filter-row">
          <div className="filter-controls-group">
            {/* Condition Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-dim)', fontWeight: 600 }}>Condition:</span>
              <select 
                id="catalog-condition-filter"
                className="form-select" 
                style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
              >
                <option value="All">All Conditions</option>
                <option value="Brand New">Brand New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            {/* Max Daily Rate Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                Max Rate: <strong style={{ color: 'var(--primary)' }}>₹{maxPrice}/day</strong>
              </span>
              <input 
                type="range" 
                id="catalog-price-slider"
                min="100" 
                max="20000" 
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: '110px' }}
              />
            </div>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-dim)', fontWeight: 600 }}>Sort by:</span>
            <select 
              id="catalog-sort-select"
              className="form-select" 
              style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Latest Listings</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="top_rated">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
          {selectedCategory === 'All' ? 'All Community Equipment' : `${selectedCategory}`}
        </h2>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Showing <strong>{products.length}</strong> items available for rent
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s infinite' }}>🔄</div>
          <p>Loading curated equipment listings from MySQL...</p>
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <h3 style={{ marginBottom: '0.5rem' }}>No listings match your search</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Try clearing filters or adjusting your daily rate limit.</p>
          <button 
            type="button" 
            className="btn btn-secondary"
              onClick={() => { onSearchChange(''); setSelectedCategory('All'); setSelectedCondition('All'); setMaxPrice(20000); }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="product-grid" id="product-grid-container">
          {products.map(p => (
            <ProductCard 
              key={p.id} 
              product={p} 
              onSelect={onSelectProduct}
              onBargain={onBargainProduct}
            />
          ))}
        </div>
      )}
    </section>
  );
};
