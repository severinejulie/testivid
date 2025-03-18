import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to safely parse user data from localStorage
  const loadUserFromStorage = () => {
    try {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        console.log('Loaded user data from storage:', userData);
        return userData;
      }
    } catch (err) {
      console.error('Failed to parse user data from localStorage:', err);
      localStorage.removeItem('user'); // Clear invalid data
    }
    return null;
  };

  useEffect(() => {
    // Check if user is logged in on page load/refresh
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      
      // Load user data from storage
      const userData = loadUserFromStorage();
      if (userData) {
        setCurrentUser(userData);
      } else {
        // If we have a token but no user data, try to fetch user data from server
        const fetchUserData = async () => {
          try {
            // This endpoint should return the current user data
            // You may need to implement this on your backend
            const response = await api.get('/api/auth/me');
            if (response.data && response.data.user) {
              setCurrentUser(response.data.user);
              localStorage.setItem('user', JSON.stringify(response.data.user));
            }
          } catch (err) {
            console.error('Failed to fetch user data:', err);
            // If we can't get user data, we should probably log out
            if (err.response && err.response.status === 401) {
              localStorage.removeItem('token');
              setIsAuthenticated(false);
            }
          }
        };
        
        fetchUserData();
      }
    }
    setIsLoading(false);
  }, []);

  const signUp = async (userData) => {
    setError(null);
    try {
      const response = await api.post('/api/auth/signup', userData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error during signup');
      throw err;
    }
  };

  const signIn = async (credentials) => {
    setError(null);
    try {
      const response = await api.post('/api/auth/signin', credentials);
      
      console.log('Sign-in response:', response.data);
      
      // Make sure we have valid data before storing
      if (response.data && response.data.token) {
        // Store token
        localStorage.setItem('token', response.data.token);
        
        // Only store user data if it exists
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setCurrentUser(response.data.user);
        } else {
          console.warn('Sign-in response missing user data', response.data);
        }
        
        setIsAuthenticated(true);
      }
      
      return response.data;
    } catch (err) {
      console.error('Sign-in error:', err);
      setError(err.response?.data?.message || 'Authentication failed');
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await api.post('/api/auth/signout');
    } catch (err) {
      console.error('Error during sign out:', err);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  // Update user data in state and storage
  const updateUserData = (userData) => {
    if (userData) {
      setCurrentUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    updateUserData // Add this new function to the context
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;