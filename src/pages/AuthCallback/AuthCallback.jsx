import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './AuthCallback.css';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setCurrentUser, setIsAuthenticated, setIsInGoogleSignupFlow } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setLoading(true);
        
        // Get auth action
        const authAction = localStorage.getItem('googleAuthAction');
        
        // Extract auth parameters from URL
        const hashParams = window.location.hash.substring(1)
          .split('&')
          .reduce((params, pair) => {
            if (!pair) return params;
            const [key, value] = pair.split('=');
            return { ...params, [key]: decodeURIComponent(value || '') };
          }, {});
    
        const accessToken = hashParams.access_token;
      
        if (!accessToken) {
          console.error('No access token found in URL');
          setError('Authentication failed: No access token received');
          return;
        }
        
        localStorage.setItem('googleAccessToken', accessToken);
        
        // Process the authentication with backend
        const response = await api.post('/api/auth/process-auth-callback', {
          accessToken,
          authAction
        });
        
        if (response.data.user && response.data.token) {
          // Check if this is a new user or existing user
          const isNewUser = response.data.isNewUser;
          
          // Store token and user info
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          // Set auth state
          setCurrentUser(response.data.user);
          setIsAuthenticated(true);
          // Handle as a signup if it's a new user, regardless of the original authAction
          if (isNewUser) {
            // Store the flag for Google signup flow
            localStorage.setItem('googleSignupInProgress', 'true');
            
            // Store user data for signup flow
            const googleUserData = {
              email: response.data.user.email,
              firstname: response.data.user.firstname || '',
              lastname: response.data.user.lastname || '',
              picture: response.data.user.avatar_url
            };
            
            localStorage.setItem('googleUserData', JSON.stringify(googleUserData));
            setIsInGoogleSignupFlow(true);
            
            // Navigate to signup with the "fromGoogle" state
            setTimeout(() => {
              navigate('/signup', { 
                state: { 
                  fromGoogle: true,
                  googleStep: 2
                }
              });
            }, 100);
          } else {
            // Existing user doing normal sign in
            localStorage.removeItem('googleSignupInProgress');
            localStorage.removeItem('googleAuthAction');
            setIsInGoogleSignupFlow(false);
            
            setTimeout(() => {
              navigate('/dashboard');
            }, 100);
          }
        } else {
          throw new Error('Authentication failed');
        }
      } catch (err) {
        console.error('Error in auth callback:', err);
        setError(err.message || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, setCurrentUser, setIsAuthenticated, setIsInGoogleSignupFlow]);

  // Rest of component remains the same
  if (loading) {
    return (
      <div className="auth-callback-container">
        <div className="auth-callback-card">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <h2>Processing your sign in...</h2>
          <p>Please wait while we complete your authentication.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-callback-container">
        <div className="auth-callback-card error">
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/signin')}
            className="auth-button"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;