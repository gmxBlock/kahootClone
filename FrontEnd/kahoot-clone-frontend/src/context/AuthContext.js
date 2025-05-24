import React, { createContext, useState, useEffect } from 'react';
import { getUser, loginUser, registerUser, logoutUser, isAuthenticated } from '../services/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is already authenticated
        if (isAuthenticated()) {
          const currentUser = await getUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.log('Could not fetch user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials, rememberMe = false) => {
    try {
      const response = await loginUser(credentials, rememberMe);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await registerUser(userData);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      // Even if logout fails, clear user state
      setUser(null);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: () => !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};