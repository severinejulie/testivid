import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleSignup from '../../components/GoogleSignup/GoogleSignup';
import './SignUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, error, setError } = useAuth();
  
  // Get Google step from location state
  const initialStep = location.state?.googleStep || 1;
  const fromGoogle = location.state?.fromGoogle || false;
  
  // Add step state to track the current step
  const [currentStep, setCurrentStep] = useState(initialStep);
  const totalSteps = 3;
  
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    companyName: '',
    password: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animation, setAnimation] = useState('');
  const [message, setMessage] = useState(location.state?.message || '');
  
  // If coming from Google auth, load stored user data
  useEffect(() => {
    if (fromGoogle) {
      try {
        const googleData = JSON.parse(localStorage.getItem('googleUserData'));
        if (googleData) {
          setFormData(prevData => ({
            ...prevData,
            firstname: googleData.firstname || '',
            lastname: googleData.lastname || '',
            email: googleData.email || ''
          }));
        }
      } catch (err) {
        console.error('Error loading Google user data:', err);
      }
    }
  }, [fromGoogle]);
  
  // Calculate progress percentage
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
  
  // Handle step transition animation
  useEffect(() => {
    setAnimation('fadeIn');
    const timer = setTimeout(() => {
      setAnimation('');
    }, 500);
    
    return () => clearTimeout(timer);
  }, [currentStep]);

  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);
  
  // Reset errors when the component mounts
  useEffect(() => {
    setError(null); // Clears any previous authentication errors
    setMessage(''); // Clears success messages
  }, [setError]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear the error for this field when the user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  // Validation for step 1
  const validateStep1 = () => {
    const errors = {};
    
    if (!formData.firstname.trim()) {
      errors.firstname = 'First name is required';
    }
    
    if (!formData.lastname.trim()) {
      errors.lastname = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    return errors;
  };
  
  // Validation for step 2
  const validateStep2 = () => {
    const errors = {};
    
    if (!formData.companyName.trim()) {
      errors.companyName = 'Company name is required';
    }
    
    return errors;
  };
  
  // Validation for step 3
  const validateStep3 = () => {
    const errors = {};
    
    if (!fromGoogle) { // Only validate password if not from Google
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    return errors;
  };
  
  // Function to handle next step with smooth transition
  const handleNextStep = () => {
    let errors = {};
    
    if (currentStep === 1) {
      errors = validateStep1();
    } else if (currentStep === 2) {
      errors = validateStep2();
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setAnimation('step-exit-active');
    setTimeout(() => {
      setCurrentStep(currentStep + 1);
      setFormErrors({});
    }, 300);
  };
  
  // Function to handle previous step with smooth transition
  const handlePrevStep = () => {
    setAnimation('step-exit-active');
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
      setFormErrors({});
    }, 300);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateStep3();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...signupData } = formData;
      
      // If signing up with Google, indicate this in the request
      if (fromGoogle) {
        signupData.fromGoogle = true;
        const googleUser = JSON.parse(localStorage.getItem('googleUserData'));
        // Add any other Google data needed
        if (googleUser) {
          signupData.googleId = googleUser.sub;
          signupData.picture = googleUser.picture;
        }
        // Clean up stored data
        localStorage.removeItem('googleUserData');
      }
      
      await signUp(signupData);
      navigate('/signin', { state: { message: 'Account created successfully! Please verify your email.' } });
    } catch (err) {
      console.error('Signup error:', err);
      // Error is handled by the AuthContext and can be displayed
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render enhanced step indicator with progress
  const renderStepIndicator = () => {
    return (
      <>
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </>
    );
  };
  
  // Render form step 1 (Personal Info)
  const renderStep1 = () => {
    return (
      <div className={`step-form ${animation}`}>
        <h3 className="form-title">Tell us about yourself</h3>
        
        {!fromGoogle && (
          <>
            <GoogleSignup />
            <div className="or-divider">or sign up with email</div>
          </>
        )}
        
        <div className="form-group">
          <label htmlFor="firstname">First Name</label>
          <input
            type="text"
            id="firstname"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            className={formErrors.firstname ? 'error' : ''}
            placeholder="Enter your first name"
            disabled={fromGoogle} // Disable if from Google
          />
          {formErrors.firstname && <div className="error-message">{formErrors.firstname}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="lastname">Last Name</label>
          <input
            type="text"
            id="lastname"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            className={formErrors.lastname ? 'error' : ''}
            placeholder="Enter your last name"
            disabled={fromGoogle} // Disable if from Google
          />
          {formErrors.lastname && <div className="error-message">{formErrors.lastname}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={formErrors.email ? 'error' : ''}
            placeholder="name@company.com"
            disabled={fromGoogle} // Disable if from Google
          />
          {formErrors.email && <div className="error-message">{formErrors.email}</div>}
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="next-button"
            onClick={handleNextStep}
          >
            Continue
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    );
  };
  
  // Render form step 2 (Company Info)
  const renderStep2 = () => {
    return (
      <div className={`step-form ${animation}`}>
        <h3 className="form-title">Tell us about your company</h3>
        
        <div className="form-group">
          <label htmlFor="companyName">Company Name</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className={formErrors.companyName ? 'error' : ''}
            placeholder="Enter your company name"
          />
          {formErrors.companyName && <div className="error-message">{formErrors.companyName}</div>}
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="back-button"
            onClick={handlePrevStep}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <button 
            type="button" 
            className="next-button"
            onClick={handleNextStep}
          >
            Continue
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    );
  };
  
  // Render form step 3 (Password)
  const renderStep3 = () => {
    // For Google sign-ups, we'll skip password creation
    const buttonText = fromGoogle ? 'Complete Sign Up' : 'Create Account';
    const loadingText = fromGoogle ? 'Completing Sign Up...' : 'Creating Account...';

    return (
      <div className={`step-form ${animation}`}>
        <h3 className="form-title">
          {fromGoogle ? 'Complete your registration' : 'Set up your account security'}
        </h3>
        
        {!fromGoogle && (
          <>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={formErrors.password ? 'error' : ''}
                placeholder="Create a secure password"
              />
              {formErrors.password && <div className="error-message">{formErrors.password}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={formErrors.confirmPassword ? 'error' : ''}
                placeholder="Confirm your password"
              />
              {formErrors.confirmPassword && <div className="error-message">{formErrors.confirmPassword}</div>}
            </div>
          </>
        )}
        
        {fromGoogle && (
          <div className="google-signup-info">
            <p>You're signing up with Google using:</p>
            <p className="google-email">{formData.email}</p>
            <p className="info-message">
              Click the button below to complete your registration with TestiVid.
            </p>
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="button" 
            className="back-button"
            onClick={handlePrevStep}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <button 
            type="submit" 
            className={`submit-button ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting}
          >
            {!isSubmitting ? (
              <div className="button-content">
                {buttonText}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ) : (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>{loadingText}</span>
              </div>
            )}
          </button>
        </div>
      </div>
    );
  };
  
  // Render the current step
  const renderCurrentStep = () => {
    switch(currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create an Account</h2>
          <p>Step {currentStep} of {totalSteps}</p>
        </div>
        
        {renderStepIndicator()}
        
        {error && <div className="auth-error">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          {renderCurrentStep()}
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/signin">Sign In</Link></p>
          <Link to="/" className="back-link">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;