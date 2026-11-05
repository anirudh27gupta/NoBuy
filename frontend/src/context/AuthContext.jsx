import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nobuy_token') || null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  const fetchCurrentUser = async () => {
    if (!localStorage.getItem('nobuy_token')) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        if (res.user.stats && res.user.stats.unread_notifs !== undefined) {
          setUnreadNotifsCount(res.user.stats.unread_notifs);
        }
      }
    } catch (err) {
      console.warn('Failed to validate session:', err.message);
      // If token expired or invalid, clear it
      localStorage.removeItem('nobuy_token');
      localStorage.removeItem('nobuy_user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('nobuy_token', res.token);
      localStorage.setItem('nobuy_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('nobuy_token', res.token);
      localStorage.setItem('nobuy_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('nobuy_token');
    localStorage.removeItem('nobuy_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      unreadNotifsCount,
      setUnreadNotifsCount,
      login,
      register,
      logout,
      refreshUser,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
