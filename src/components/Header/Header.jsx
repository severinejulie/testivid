import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  useEffect(() => {
    console.log('Auth state in Header:', { 
      currentUser, 
      isAuthenticated,
      storedToken: localStorage.getItem('token'),
      storedUser: localStorage.getItem('user')
    });
    
    if (isAuthenticated && !currentUser) {
      try {
        const userDataString = localStorage.getItem('user');
        if (userDataString) {
          console.log('Found user data in localStorage:', userDataString);
        } else {
          console.log('No user data in localStorage, but authenticated');
        }
      } catch (err) {
        console.error('Error checking localStorage for user data:', err);
      }
    }
  }, [currentUser, isAuthenticated]);
  console.log(currentUser)
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const getUserDisplayInfo = () => {
    if (currentUser && currentUser.name) {
      return {
        initial: currentUser.name.charAt(0).toUpperCase(),
        name: currentUser.name
      };
    }
    
    try {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        if (userData && userData.name) {
          return {
            initial: userData.name.charAt(0).toUpperCase(),
            name: userData.name
          };
        }
      }
    } catch (err) {
      console.error('Error parsing user data for display:', err);
    }
    
    return {
      initial: 'U',
      name: 'User'
    };
  };
  
  const userInfo = getUserDisplayInfo();
  
  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="logo">
          <h1>TestiVid</h1>
        </div>
        
        <div className="header-right">
          <div className="user-profile" onClick={toggleDropdown}>
            <div className="user-avatar">
              {userInfo.initial}
            </div>
            <span className="user-name">{userInfo.name}</span>
            <span className="dropdown-arrow">▼</span>
            
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-item">
                  <span>Profile</span>
                </div>
                <div className="dropdown-item">
                  <span>Settings</span>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item" onClick={handleSignOut}>
                  <span>Sign Out</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;