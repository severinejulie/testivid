import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInGoogleSignupFlow, setIsInGoogleSignupFlow] = useState(false);

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
    const token = localStorage.getItem('token');
    if (token) {
      const inGoogleSignup = localStorage.getItem('googleSignupInProgress') === 'true';
      
      if (inGoogleSignup) {
        setIsInGoogleSignupFlow(true); 
      }
      
      setIsAuthenticated(true);
      
      const userData = loadUserFromStorage();
      if (userData) {
        setCurrentUser(userData);
      } else {
        const fetchUserData = async () => {
          try {
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
              localStorage.removeItem('googleSignupInProgress'); // Also clear this flag
              setIsAuthenticated(false);
              setIsInGoogleSignupFlow(false); // Reset this state too
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
      // For Google sign-ups, check if we have the fromGoogle flag
      if (userData.fromGoogle) {
        const accessToken = userData.accessToken;

        if (!accessToken) {
          throw new Error('No access token available for Google signup');
        }

        const response = await api.post('/api/auth/signup', {
          ...userData,
          accessToken
        });
        setIsAuthenticated(true);
        return response.data;
      } else {
        // Regular email/password signup
        const response = await api.post('/api/auth/signup', userData);
        return response.data;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error during signup');
      throw err;
    }
  };

  const signIn = async (credentials) => {
    setError(null);
    try {
      // Check if this is a Google sign-in
      if (credentials.provider === 'google') {
        const response = await api.post('/api/auth/signin-google', {
          provider: 'google'
        });
        
        // Redirect to Google OAuth URL
        if (response.data && response.data.url) {
          window.location.href = response.data.url;
        }
        
        // This won't execute since we're redirecting, but included for completeness
        return response.data;
      } else {
        // Regular email/password signin
        const response = await api.post('/api/auth/signin', credentials);
        
        // Store token and user data
        if (response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
          
          // Only store user data if it exists
          if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setCurrentUser(response.data.user);
          }
          
          setIsAuthenticated(true);
        }
        
        return response.data;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
      throw err;
    }
  };

  const handleGoogleCallback = async () => {
    try {
      // This function would be called after redirecting back from Google OAuth
      // You would typically check with your backend to get user details
      const response = await api.get('/api/auth/me');
      
      if (response.data && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setCurrentUser(response.data.user);
        setIsAuthenticated(true);
        return response.data.user;
      }
    } catch (err) {
      console.error('Error handling Google callback:', err);
      setError('Failed to complete Google authentication');
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await api.post('/api/auth/signout');
    } catch (err) {
      console.error('Error during sign out:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('googleAccessToken');
      localStorage.removeItem('googleSignupInProgress');
      localStorage.removeItem('googleUserData'); 
      setCurrentUser(null);
      setIsAuthenticated(false);
      setIsInGoogleSignupFlow(false);
    }
  };

  const forgotPassword = async (email) => {
    setError(null);
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return response.data; // Message from backend
    } catch (err) {
      console.error('Forgot Password Error:', err);
      setError(err.response?.data?.error || "Error sending password reset email.");
      throw err;
    }
  };

  // 🔹 Reset Password (Update Password)
  const resetPassword = async (access_token, new_password) => {
    setError(null);
    try {
      const response = await api.post('/api/auth/reset-password', { access_token, new_password });
      return response.data; // Message from backend
    } catch (err) {
      console.error('Reset Password Error:', err);
      setError(err.response?.data?.error || "Error resetting password.");
      throw err;
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
    setError,
    updateUserData,
    forgotPassword,
    resetPassword, 
    handleGoogleCallback,
    setCurrentUser,
    setIsAuthenticated,
    isInGoogleSignupFlow,
    setIsInGoogleSignupFlow
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;