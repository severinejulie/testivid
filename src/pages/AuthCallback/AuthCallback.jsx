import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './AuthCallback.css';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setCurrentUser, setIsAuthenticated } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setLoading(true);
        
        // Extract any auth parameters from URL
        const hashParams = window.location.hash.substring(1)
          .split('&')
          .reduce((params, pair) => {
            const [key, value] = pair.split('=');
            return { ...params, [key]: decodeURIComponent(value) };
          }, {});

        const accessToken = hashParams.access_token;
      
        if (!accessToken) {
          console.error('No access token found in URL');
          setError('Authentication failed: No access token received');
          return;
        }
        localStorage.setItem('googleAccessToken', accessToken);
        // Check if this is a signup or signin
        const authAction = localStorage.getItem('googleAuthAction');
        localStorage.removeItem('googleAuthAction'); // Clean up
        
        // Call your backend to validate and process the authentication
        const response = await api.post('/api/auth/process-auth-callback', {
          hashParams,
          authAction,
          accessToken
        });
        
        if (response.data.user) {
          if (authAction === 'signup') {
            // Store user data for the signup flow
            const googleUserData = {
              email: response.data.user.email,
              firstname: response.data.user.firstname || '',
              lastname: response.data.user.lastname || '',
              picture: response.data.user.avatar_url
            };
            
            localStorage.setItem('googleUserData', JSON.stringify(googleUserData));
            setTimeout(() => {
              navigate('/signup', { 
                state: { 
                  fromGoogle: true,
                  googleStep: 2
                }
              });
            }, 100);
          } else {
            // For sign in, set token and redirect to dashboard
            if (response.data.token) {
              localStorage.setItem('token', response.data.token);
              localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            setCurrentUser(response.data.user);
            setIsAuthenticated(true);
            
            setTimeout(() => {
              navigate('/dashboard');
            }, 1000);
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
  }, [navigate]);

  // Rest of your component remains the same
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