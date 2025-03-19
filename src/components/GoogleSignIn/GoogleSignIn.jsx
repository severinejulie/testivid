import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './GoogleSignIn.css';

const GoogleSignIn = () => {
  const { signIn } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      // Store a callback flag in localStorage to identify this as a signin (not signup)
      localStorage.setItem('googleAuthAction', 'signin');
      
      // Use the signIn method with provider parameter
      await signIn({ provider: 'google' });
      // Note: The page will redirect to Google's OAuth page
    } catch (err) {
      console.error('Error initiating Google sign in:', err);
    }
  };

  return (
    <button 
      type="button" 
      className="google-signin-button" 
      onClick={handleGoogleSignIn}
    >
      <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        <g transform="matrix(1, 0, 0, 1, 0, 0)">
          <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12c0,5.523,4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" fill="#FFF"></path>
        </g>
      </svg>
      <span>Sign in with Google</span>
    </button>
  );
};

export default GoogleSignIn;