import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export const NotificationDropdown = ({ onClose, onNavigate }) => {
  const { setUnreadNotifsCount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications);
        const unread = res.notifications.filter(n => !n.is_read).length;
        setUnreadNotifsCount(unread);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadNotifsCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await api.markNotificationRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        setUnreadNotifsCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
    if (notif.link && onNavigate) {
      onNavigate(notif.link);
      onClose();
    }
  };

  return (
    <div className="notif-popup" id="notification-popup">
      <div className="notif-header">
        <span style={{ fontWeight: 700, fontSize: '0.925rem' }}>Notifications</span>
        <button 
          className="btn btn-outline btn-sm" 
          style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
          onClick={handleMarkAllRead}
        >
          Mark all read
        </button>
      </div>

      <div className="notif-list">
        {loading ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            Loading alerts...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            No notifications yet
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              className={`notif-item ${!n.is_read ? 'unread' : ''}`}
              onClick={() => handleItemClick(n)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: !n.is_read ? '#a5b4fc' : 'var(--text-main)' }}>
                  {n.title}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {n.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
