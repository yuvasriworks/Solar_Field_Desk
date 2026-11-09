import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('solar_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('solar_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('solar_user', JSON.stringify(res.data));
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, [token]);

  const login = (data) => {
    localStorage.setItem('solar_token', data.access_token);
    const userData = {
      id: data.user_id,
      name: data.name,
      email: data.email,
      role: data.role,
    };
    localStorage.setItem('solar_user', JSON.stringify(userData));
    setToken(data.access_token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('solar_token');
    localStorage.removeItem('solar_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, role: user?.role, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

