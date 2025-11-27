// src/context/AuthContext.js - COMPLETELY FIXED
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('❌ useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('✅ User loaded from storage:', parsedUser.name);
      } else {
        console.log('ℹ️ No user in storage');
      }
    } catch (error) {
      console.error('❌ Error loading user:', error);
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      console.log('📍 Logging in:', email);
      
      const response = await authAPI.login(email, password);
      
      if (!response || !response.token) {
        throw new Error('No token in response');
      }

      const { token, user: userData } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('✅ Login successful:', userData.name);
      return { success: true };
      
    } catch (error) {
      console.error('❌ Login error:', error.message);
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      console.log('📍 Registering:', email);
      
      const response = await authAPI.register(name, email, password);
      
      if (!response || !response.token) {
        throw new Error('No token in response');
      }

      const { token, user: userData } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('✅ Registration successful:', userData.name);
      return { success: true };
      
    } catch (error) {
      console.error('❌ Registration error:', error.message);
      return { 
        success: false, 
        error: error.message || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log('📍 Logging out');
    authAPI.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    console.log('✅ Logout successful');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;