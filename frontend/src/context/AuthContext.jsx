import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then((res) => setUser(res.data))
        .catch((err) => {
          // Only clear token on explicit 401 — not on network errors
          if (err.response?.status === 401) localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const updateUser = (userData) => setUser((prev) => ({ ...prev, ...userData }));

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
