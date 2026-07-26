import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

function readStoredUser() {
  const raw = localStorage.getItem('ft_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser());
  const [token, setToken] = useState(localStorage.getItem('ft_token'));

  const persist = (data) => {
    localStorage.setItem('ft_token', data.token);
    localStorage.setItem(
      'ft_user',
      JSON.stringify({ userId: data.userId, name: data.name, email: data.email })
    );
    setToken(data.token);
    setUser({ userId: data.userId, name: data.name, email: data.email });
  };

  const login = useCallback(async (email, password) => {
    const data = await api.post('/api/auth/login', { email, password });
    persist(data);
    return data;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const data = await api.post('/api/auth/signup', { name, email, password });
    persist(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ft_token');
    localStorage.removeItem('ft_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
