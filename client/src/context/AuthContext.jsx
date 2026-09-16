import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bookmart_token');
    const saved = localStorage.getItem('bookmart_user');
    if (token && saved) {
      try {
        setUser(JSON.parse(saved));
      } catch { /* ignore */ }
      // Verify token is still valid
      API.get('/auth/me')
        .then(res => {
          setUser(res.data.user);
          localStorage.setItem('bookmart_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem('bookmart_token');
          localStorage.removeItem('bookmart_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('bookmart_token', res.data.token);
    localStorage.setItem('bookmart_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password, phone) => {
    const res = await API.post('/auth/register', { name, email, password, phone });
    localStorage.setItem('bookmart_token', res.data.token);
    localStorage.setItem('bookmart_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const googleLogin = async (payload) => {
    const res = await API.post('/auth/google', payload);
    localStorage.setItem('bookmart_token', res.data.token);
    localStorage.setItem('bookmart_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await API.post('/auth/forgot-password', { email });
    return res.data;
  };

  const resetPassword = async (email, resetCode, newPassword) => {
    const res = await API.post('/auth/reset-password', { email, resetCode, newPassword });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('bookmart_token');
    localStorage.removeItem('bookmart_user');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('bookmart_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      googleLogin, 
      forgotPassword, 
      resetPassword, 
      logout, 
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
