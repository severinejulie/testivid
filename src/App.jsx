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
import TestimonialSubmit from './pages/TestimonialSubmit/TestimonialSubmit';

import './App.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAuthLoading, isInGoogleSignupFlow } = useAuth();
  const location = useLocation();

  // 👇 Wait until session is restored
  if (isAuthLoading) {
    return null; // or a loading spinner
  }

  // Special case: Google signup flow incomplete
  if (isAuthenticated && isInGoogleSignupFlow && location.pathname === '/dashboard') {
    return <Navigate to="/signup" state={{ fromGoogle: true, googleStep: 2 }} replace />;
  }

  // Normal protection
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

const SessionInitializer = () => {
  const { 
    setCurrentUser, 
    setIsAuthenticated, 
    setIsInGoogleSignupFlow, 
    setIsAuthLoading 
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const inGoogleSignup = localStorage.getItem('googleSignupInProgress') === 'true';

          setIsAuthenticated(true);
          setCurrentUser(JSON.parse(userData));

          if (inGoogleSignup) {
            setIsInGoogleSignupFlow(true);
            if (location.pathname !== '/signup') {
              navigate('/signup', { 
                state: { 
                  fromGoogle: true, 
                  googleStep: 2 
                },
                replace: true
              });
            }
          } else {
            setIsInGoogleSignupFlow(false);
          }
        } catch (error) {
          console.error("Error during session restoration:", error);
          localStorage.clear();
          setIsAuthenticated(false);
          setCurrentUser(null);
          setIsInGoogleSignupFlow(false);
        }
      } else {
        // No token or user, treat as unauthenticated
        setIsAuthenticated(false);
        setCurrentUser(null);
        setIsInGoogleSignupFlow(false);
      }
      
      // ✅ Finally mark session restore as done
      setIsAuthLoading(false);
    };

    checkSession();
  }, [setCurrentUser, setIsAuthenticated, setIsInGoogleSignupFlow, setIsAuthLoading, navigate, location.pathname]);

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
            <Route path="/testimonial/submit/:token" element={<TestimonialSubmit />} />
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
