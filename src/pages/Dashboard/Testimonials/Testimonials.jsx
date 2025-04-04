import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import './Testimonials.css';
import { Eye, Plus, RotateCcw } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const token = localStorage.getItem('token');

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/testimonials/requests', {
        headers: {
            Authorization: `Bearer ${token}`
        },
        params: { 
            company_id: currentUser.company_id 
        }
      }); 
      setTestimonials(response.data); 
      setError(null);
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      setError('Failed to load testimonials. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTestimonials();
  }, []);
  

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-badge pending';
      case 'completed':
        return 'status-badge completed';
      case 'expired':
        return 'status-badge expired';
      default:
        return 'status-badge';
    }
  };

  return (
    <div className="testimonials-container">
      <div className="testimonials-header">
        <h1>Customer Testimonials</h1>
        <div className="header-actions">
          <button 
            className="refresh-button"
            onClick={fetchTestimonials}
            disabled={loading}
          >
            <RotateCcw size={16} />
            Refresh
          </button>
          <Link to="/dashboard/requests" className="create-button">
            <Plus size={16} />
            Request New Testimonial
          </Link>
        </div>
      </div>

      {error && (
        <div className="testimonials-alert error">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="testimonials-loading">
          <div className="loading-spinner"></div>
          <p>Loading testimonials...</p>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="testimonials-empty">
          <h2>No testimonials yet</h2>
          <p>Start by requesting testimonials from your customers.</p>
          <Link to="/dashboard/requests" className="create-button">
            <Plus size={16} />
            Request New Testimonial
          </Link>
        </div>
      ) : (
        <div className="testimonials-table-container">
          <table className="testimonials-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Expires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((testimonial) => (
                <tr key={testimonial.id}>
                  <td>{testimonial.customer_name || '—'}</td>
                  <td>{testimonial.customer_email}</td>
                  <td>
                    <span className={getStatusBadgeClass(testimonial.status)}>
                      {testimonial.status}
                    </span>
                  </td>
                  <td>{new Date(testimonial.created_at).toLocaleDateString()}</td>
                  <td>{new Date(testimonial.expires_at).toLocaleDateString()}</td>
                  <td>
                    {testimonial.status === 'completed' ? (
                      <Link 
                        to={`/dashboard/testimonials/${testimonial.id}`} 
                        className="action-button view"
                        title="View Testimonial"
                      >
                        <Eye size={16} />
                        View
                      </Link>
                    ) : (
                      <button 
                        className="action-button disabled"
                        disabled
                        title="Pending testimonial"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Testimonials;