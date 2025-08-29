import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, handleAPIError } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      console.log('🔍 Auth check - Token exists:', !!token, 'Stored user exists:', !!storedUser);
      
      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('👤 Setting user from localStorage:', userData);
          setUser(userData);
          setIsAuthenticated(true);
          
          // Verify token is still valid by making a request
          console.log('🔄 Verifying token with server...');
          const profileResponse = await authAPI.getProfile();
          console.log('✅ Token verification successful:', profileResponse);
          
          // Update user data if server returns newer data
          if (profileResponse.user) {
            console.log('📝 Updating user data from server');
            setUser(profileResponse.user);
            localStorage.setItem('user', JSON.stringify(profileResponse.user));
          }
        } catch (error) {
          console.error('❌ Token validation failed:', error);
          logout();
        }
      } else {
        console.log('❌ No auth token or user data found');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      if (response.token && response.user) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        setIsAuthenticated(true);
        
        toast.success(response.message || 'Login successful!');
        return { success: true, user: response.user };
      }
    } catch (error) {
      const message = handleAPIError(error);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.token && response.user) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        setIsAuthenticated(true);
        
        toast.success(response.message || 'Registration successful!');
        return { success: true, user: response.user };
      }
    } catch (error) {
      const message = handleAPIError(error);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
