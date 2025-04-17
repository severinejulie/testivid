import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import Questions from './Questions/Questions';
import Requests from './Requests/Requests';
import Testimonials from './Testimonials/Testimonials';
import TestimonialDetail from './TestimonialDetail/TestimonialDetail';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

// Dashboard Home Component
const DashboardHome = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    questions: 0,
    testimonials: 0,
    completed: 0,
    requested: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/testimonials/stats', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          params: {
            company_id: currentUser.company_id
          }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };

    if (currentUser?.company_id) {
      fetchStats();
    }
  }, [currentUser?.company_id]);

  return (
    <div className="dashboard-content">
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard. This is where you'll see an overview of your data.</p>

      <div className="dashboard-placeholder">
        <div className="placeholder-title">Your Dashboard Content</div>
        <div className="placeholder-text">
          This is an empty dashboard ready for your content.
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Questions</h3>
          <div className="stat-value">{stats.questions}</div>
        </div>

        <div className="stat-card">
          <h3>Total Testimonials</h3>
          <div className="stat-value">{stats.testimonials}</div>
        </div>

        <div className="stat-card">
          <h3>Pending Testimonials</h3>
          <div className="stat-value">{stats.requested}</div>
        </div>

        <div className="stat-card">
          <h3>Testimonials Completed</h3>
          <div className="stat-value">{stats.completed}</div>
        </div>
      </div>
    </div>
  );
};

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
          <Route index element={<DashboardHome />} />
          <Route path="questions" element={<Questions title="Questions" />} />
          <Route path="testimonials" element={<Testimonials title="Testimonials" />} />
          <Route path="testimonials/:id" element={<TestimonialDetail title="TestimonialDetail" />} />
          <Route path="requests" element={<Requests title="Requests" />} />
          <Route path="settings" element={<EmptyPage title="Settings" />} />
          <Route path="*" element={<EmptyPage title="Page Not Found" />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
