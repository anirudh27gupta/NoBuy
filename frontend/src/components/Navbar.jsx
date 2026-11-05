import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

export const Navbar = ({ currentView, searchValue, onSearchChange, onViewChange, onOpenAuth, onOpenAddProduct }) => {
  const { user, isAuthenticated, logout, unreadNotifsCount } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand */}
        <div className="nav-brand" id="nav-brand-logo" onClick={() => onViewChange('catalog')}>
          <div className="brand-icon">🔄</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>No-Buy</span>
            </div>
            <div className="brand-tagline">Local gear rentals</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="nav-links">
          <span 
            id="nav-link-dashboard"
            className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              if (isAuthenticated) onViewChange('dashboard');
              else onOpenAuth('login');
            }}
          >
            My Activity & Hub
          </span>
          {isAuthenticated && (
            <div className="nav-role-badge" title="Unified Account: You can rent products and list items seamlessly without separate accounts">
              <span style={{ fontSize: '0.8rem' }}>⚡</span> Dual Mode: Renter & Lender
            </div>
          )}
        </nav>

        {currentView === 'catalog' && (
          <div className="nav-search" role="search">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search products"
              type="search"
              placeholder="Search equipment or location"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        )}

        {/* Actions & User state */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                id="nav-list-item-btn"
                className="btn btn-primary btn-sm"
                onClick={onOpenAddProduct}
              >
                <span>+</span> List Equipment
              </button>

              {/* Notification Bell */}
              <div style={{ position: 'relative' }} ref={notifRef}>
                <button
                  type="button"
                  id="nav-notif-btn"
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: 'var(--radius-full)', width: '38px', height: '38px', padding: 0, position: 'relative' }}
                  onClick={() => setShowNotifs(!showNotifs)}
                  title="Notifications"
                >
                  🔔
                  {unreadNotifsCount > 0 && (
                    <span 
                      style={{
                        position: 'absolute',
                        top: '-3px',
                        right: '-3px',
                        background: '#f43f5e',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid var(--bg-dark)'
                      }}
                    >
                      {unreadNotifsCount}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <NotificationDropdown 
                    onClose={() => setShowNotifs(false)} 
                    onNavigate={(link) => onViewChange('dashboard')} 
                  />
                )}
              </div>

              {/* User Dropdown */}
              <div style={{ position: 'relative' }} ref={userMenuRef}>
                <div 
                  className="user-menu-trigger" 
                  id="nav-user-menu"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <img 
                    src={user?.avatar_url || '/avatar-placeholder.svg'} 
                    alt={user?.full_name} 
                    className="user-avatar"
                  />
                  <span className="user-name">{user?.full_name?.split(' ')[0]}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>▼</span>
                </div>

                {showUserMenu && (
                  <div 
                    className="notif-popup" 
                    style={{ width: '220px', padding: '0.5rem 0' }}
                    id="user-dropdown-menu"
                  >
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{user?.email}</div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.35rem 0' }} />
                    <button 
                      id="nav-logout-btn"
                      className="btn btn-outline btn-danger" 
                      style={{ width: '100%', justifyContent: 'flex-start', border: 'none', borderRadius: 0, padding: '0.65rem 1rem' }}
                      onClick={() => { logout(); setShowUserMenu(false); }}
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                id="nav-login-btn"
                className="btn btn-secondary btn-sm"
                onClick={() => onOpenAuth('login')}
              >
                Sign In
              </button>
              <button
                type="button"
                id="nav-register-btn"
                className="btn btn-primary btn-sm"
                onClick={() => onOpenAuth('register')}
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
