import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import './Requests.css';
import { useAuth } from '../../../context/AuthContext';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [expiresDays, setExpiresDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  
  // Modal states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderRequestId, setReminderRequestId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const token = localStorage.getItem('token');

  // Fetch testimonial requests
  const fetchRequests = async () => {
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
  
      setRequests(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching testimonial requests:', err);
      setError('Failed to load testimonial requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available questions
  const fetchQuestions = async () => {
    try {
      const response = await api.get(`/api/questions/list?company_id=${currentUser.company_id}&_=${Date.now()}`);
      console.log(response);
      setQuestions(response.data);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions. Please try again later.');
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchRequests();
    fetchQuestions();
  }, []);

  // Handle form submission to send testimonial request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (!customerEmail.trim() || !customerName.trim() || selectedQuestions.length === 0) {
      setError('Please fill all required fields and select at least one question.');
      return;
    }
    
    setShowRequestModal(true);
  };

  // Send the testimonial request after confirmation
  const sendTestimonialRequest = async () => {
    setIsSending(true);
    try {
      await api.post('/api/testimonials/request', {
        customer_email: customerEmail,
        customer_name: customerName,
        question_ids: selectedQuestions,
        expires_days: expiresDays
      });
      
      // Reset form fields
      setCustomerEmail('');
      setCustomerName('');
      setSelectedQuestions([]);
      setExpiresDays(30);
      
      // Close modal and refresh requests
      setShowRequestModal(false);
      fetchRequests();
      setError(null);
    } catch (err) {
      console.error('Error sending testimonial request:', err);
      setError('Failed to send testimonial request. Please try again.');
      setShowRequestModal(false);
    } finally {
        setIsSending(false);
    }
  };

  // Handle question selection
  const handleQuestionSelect = (questionId) => {
    setSelectedQuestions(prevSelected => {
      if (prevSelected.includes(questionId)) {
        return prevSelected.filter(id => id !== questionId);
      } else {
        return [...prevSelected, questionId];
      }
    });
  };

  // Open reminder confirmation modal
  const confirmSendReminder = (requestId) => {
    setReminderRequestId(requestId);
    setShowReminderModal(true);
  };

  // Send reminder after confirmation
  const sendReminder = async () => {
    if (!reminderRequestId) return;

    try {
      await api.post(`/api/testimonials/request/${reminderRequestId}/remind`, {
        company_id: currentUser.company_id
      });
      
      // Update the requests list to reflect the new reminder date
      const updatedRequests = requests.map(req => {
        if (req.id === reminderRequestId) {
          return { ...req, last_reminder_sent: new Date().toISOString() };
        }
        return req;
      });
      
      setRequests(updatedRequests);
      setError(null);
    } catch (err) {
      console.error('Error sending reminder:', err);
      setError('Failed to send reminder. Please try again.');
    } finally {
      setShowReminderModal(false);
      setReminderRequestId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
  
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="dashboard-content requests-page">
      <h1>Testimonial Requests</h1>
      <p className="section-description">
        Send testimonial requests to your customers and manage existing requests.
      </p>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="requests-container">
        <section className="request-form-section">
          <h2>New Testimonial Request</h2>
          
          <form onSubmit={handleSubmitRequest} className="request-form">
            <div className="form-group">
              <label htmlFor="customerName">Customer Name</label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="customerEmail">Customer Email</label>
              <input
                type="email"
                id="customerEmail"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Enter customer email"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="expiryDays">Expires After (Days)</label>
              <input
                type="number"
                id="expiryDays"
                value={expiresDays}
                onChange={(e) => setExpiresDays(parseInt(e.target.value))}
                min="1"
                max="365"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Select Questions</label>
              <div className="questions-selection">
                {questions.length === 0 ? (
                  <p className="no-questions-notice">No questions available. Please create questions first.</p>
                ) : (
                  questions.map(question => (
                    <div key={question.id} className="question-checkbox">
                      <input
                        type="checkbox"
                        id={`question-${question.id}`}
                        checked={selectedQuestions.includes(question.id)}
                        onChange={() => handleQuestionSelect(question.id)}
                      />
                      <label htmlFor={`question-${question.id}`} title={question.text}>{question.text}</label>
                    </div>
                  ))
                )}
              </div>
              <p className="form-hint">
                Select one or more questions to include in the testimonial request.
              </p>
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="save-button"
                disabled={questions.length === 0}
              >
                Send Request
              </button>
            </div>
          </form>
        </section>
        
        <section className="requests-list-section">
          <h2>Sent Requests</h2>
          
          {loading ? (
            <div className="loading">Loading testimonial requests...</div>
          ) : requests.length === 0 ? (
            <div className="no-requests">
              <p>No testimonial requests sent yet.</p>
            </div>
          ) : (
            <div className="requests-table-container">
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>Date Sent</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Last Reminder</th>
                    <th className="actions-column">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(request => (
                    <tr key={request.id}>
                      <td>{formatDate(request.created_at)}</td>
                      <td>{request.customer_email}</td>
                      <td>
                        <span className={`status-badge status-${request.status.toLowerCase()}`}>
                          {request.status}
                        </span>
                      </td>
                      <td>{formatDate(request.last_reminder_sent)}</td>
                      <td className="actions-cell">
                        <button 
                          className="remind-button" 
                          onClick={() => confirmSendReminder(request.id)}
                          aria-label="Send reminder"
                          disabled={request.status === 'COMPLETED'}
                        >
                          Send Reminder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Confirmation Modal for Sending Request */}
      {showRequestModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Request</h3>
            <p>Send testimonial request to {customerName} ({customerEmail})?</p>
            <div className="modal-actions">
            <button 
                onClick={sendTestimonialRequest} 
                className="confirm-button"
                disabled={isSending}
                >
                {isSending ? (
                    'Sending...'
                ) : (
                    'Yes, send request'
                )}
                </button>
              <button onClick={() => setShowRequestModal(false)} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Sending Reminder */}
      {showReminderModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Reminder</h3>
            <p>Are you sure you want to send a reminder for this testimonial request?</p>
            <div className="modal-actions">
              <button onClick={sendReminder} className="confirm-button">
                Yes, send reminder
              </button>
              <button onClick={() => setShowReminderModal(false)} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;