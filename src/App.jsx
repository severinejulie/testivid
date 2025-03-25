import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing/Landing';
import SignUp from './pages/SignUp/SignUp';
import SignIn from './pages/SignIn/SignIn';
import Dashboard from './pages/Dashboard/Dashboard';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import AuthCallback from './pages/AuthCallback/AuthCallback';

import './App.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInGoogleSignupFlow } = useAuth();
  const location = useLocation();
  // Redirect to signup if Google flow is incomplete
  if (isAuthenticated && isInGoogleSignupFlow && 
      location.pathname === '/dashboard') {
    return <Navigate to="/signup" state={{ fromGoogle: true, googleStep: 2 }} />;
  }
  // Normal protection logic
  if (!isAuthenticated) {
    return <Navigate to="/signin" />;
  }
  
  return children;
};

const SessionInitializer = () => {
  const { 
    setCurrentUser, 
    setIsAuthenticated, 
    setIsInGoogleSignupFlow
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          // Check if we're in the middle of Google signup
          const inGoogleSignup = localStorage.getItem('googleSignupInProgress') === 'true';
          
          // Set auth state from localStorage first
          setIsAuthenticated(true);
          setCurrentUser(JSON.parse(userData));
          
          // Important: Set this state based on localStorage
          if (inGoogleSignup) {
            setIsInGoogleSignupFlow(true);
            
            // Redirect only if not already on signup page
            if (location.pathname !== '/signup') {
              navigate('/signup', { 
                state: { 
                  fromGoogle: true, 
                  googleStep: 2 
                },
                replace: true // Use replace to avoid building up history
              });
            }
          } else {
            // Explicitly set this to false for normal sign-ins
            setIsInGoogleSignupFlow(false);
          }
        } catch (error) {
          // Token invalid, clean up ALL auth state
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('googleSignupInProgress');
          localStorage.removeItem('googleUserData');
          localStorage.removeItem('googleAccessToken');
          localStorage.removeItem('googleAuthAction');
          setIsAuthenticated(false);
          setCurrentUser(null);
          setIsInGoogleSignupFlow(false);
        }
      }
    };
    
    checkSession();
  }, [setCurrentUser, setIsAuthenticated, setIsInGoogleSignupFlow, navigate, location.pathname]);
  
  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <SessionInitializer />
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;