import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refresh_token') || null);
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [ecoPoints, setEcoPoints] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }, [token]);

  useEffect(() => {
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    } else {
      localStorage.removeItem('refresh_token');
    }
  }, [refreshToken]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/users/login', { email, password });
      // Expecting { access_token, refresh_token, token, user, eco_points? }
      const accessToken = data.access_token || data.token;
      const refreshTokenValue = data.refresh_token;
      
      setToken(accessToken);
      if (refreshTokenValue) {
        setRefreshToken(refreshTokenValue);
      }
      setUser(data.user || null);
      if (typeof data.eco_points === 'number') setEcoPoints(data.eco_points);
      toast.success('Logged in');
      return true;
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/users/register', payload);
      // After registration, also set tokens if provided
      if (data.access_token || data.token) {
        const accessToken = data.access_token || data.token;
        setToken(accessToken);
        if (data.refresh_token) {
          setRefreshToken(data.refresh_token);
        }
        if (data.user) {
          setUser(data.user);
          if (typeof data.user.eco_points === 'number') {
            setEcoPoints(data.user.eco_points);
          }
        }
      }
      toast.success('Registered successfully');
      return data;
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'Register failed';
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setEcoPoints(0);
    toast.success('Logged out');
  }, []);

  const refreshEcoPoints = useCallback(async () => {
    try {
      const { data } = await api.get('/eco_points');
      // assume { total, transactions }
      if (typeof data.total === 'number') setEcoPoints(data.total);
      return data;
    } catch (_) {
      return null;
    }
  }, []);

  const value = useMemo(() => ({
    token,
    refreshToken,
    user,
    ecoPoints,
    loading,
    login,
    register,
    logout,
    refreshEcoPoints,
    setUser,
  }), [token, refreshToken, user, ecoPoints, loading, login, register, logout, refreshEcoPoints]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

