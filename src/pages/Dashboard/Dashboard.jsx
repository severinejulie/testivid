import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Dashboard.css';

// Dashboard Home Component
const DashboardHome = () => (
  <div className="dashboard-content">
    <h1>Dashboard</h1>
    <p>Welcome to your dashboard. This is where you'll see an overview of your data.</p>
    
    <div className="dashboard-placeholder">
      <div className="placeholder-title">Your Dashboard Content</div>
      <div className="placeholder-text">
        This is an empty dashboard ready for your content. You can customize this area with charts, 
        tables, and other components based on your application's requirements.
      </div>
    </div>
    
    <div className="dashboard-stats">
      <div className="stat-card">
        <h3>Total Users</h3>
        <div className="stat-value">0</div>
      </div>
      
      <div className="stat-card">
        <h3>Projects</h3>
        <div className="stat-value">0</div>
      </div>
      
      <div className="stat-card">
        <h3>Tasks</h3>
        <div className="stat-value">0</div>
      </div>
      
      <div className="stat-card">
        <h3>Completed</h3>
        <div className="stat-value">0</div>
      </div>
    </div>
  </div>
);

// Empty page component for other dashboard routes
const EmptyPage = ({ title }) => (
  <div className="dashboard-content">
    <h1>{title}</h1>
    <p>This page is currently under construction.</p>
    
    <div className="dashboard-placeholder">
      <div className="placeholder-title">{title} Content</div>
      <div className="placeholder-text">
        This is a placeholder for the {title.toLowerCase()} content. This section will be implemented in future updates.
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Header />
      <Sidebar />
      
      <main className="dashboard-main">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/analytics" element={<EmptyPage title="Analytics" />} />
          <Route path="/projects" element={<EmptyPage title="Projects" />} />
          <Route path="/calendar" element={<EmptyPage title="Calendar" />} />
          <Route path="/messages" element={<EmptyPage title="Messages" />} />
          <Route path="/settings" element={<EmptyPage title="Settings" />} />
          <Route path="*" element={<EmptyPage title="Page Not Found" />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;