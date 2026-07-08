import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('aura-token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // Fetch user details to verify the token is valid
          const response = await api.get('/profile');
          setUser(response.data);
        } catch (error) {
          console.error('Session validation failed. Logging out...', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: userToken, ...userData } = response.data;
      
      localStorage.setItem('aura-token', userToken);
      localStorage.setItem('aura-user', JSON.stringify(userData));
      
      setToken(userToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      const { token: userToken, ...userData } = response.data;

      localStorage.setItem('aura-token', userToken);
      localStorage.setItem('aura-user', JSON.stringify(userData));

      setToken(userToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Try again.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('aura-token');
    localStorage.removeItem('aura-user');
    setToken(null);
    setUser(null);
  };

  const updateProfileState = (updatedData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
    
    // Update local storage representation
    const saved = localStorage.getItem('aura-user');
    if (saved) {
      const parsed = JSON.parse(saved);
      localStorage.setItem('aura-user', JSON.stringify({ ...parsed, ...updatedData }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfileState,
      }}
    >
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
