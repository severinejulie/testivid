import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../services/api';
import './TestimonialDetail.css';
import { ArrowLeft, Play, Download, Film } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const TestimonialDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [testimonial, setTestimonial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mergeLoading, setMergeLoading] = useState(false);
  const [mergeSuccess, setMergeSuccess] = useState(false);
  const [mergedVideoUrl, setMergedVideoUrl] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchTestimonialDetail = async () => {
      setLoading(true);
      try {
        const response = await api.get(`api/testimonials/request/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: { company_id: currentUser.company_id }
        });
        setTestimonial(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching testimonial details:', err);
        setError('Failed to load testimonial. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTestimonialDetail();
    }
  }, [id]);

  const handleConfirmMerge = () => {
    setShowConfirmation(true);
  };

  const handleMergeVideos = async () => {
    setShowConfirmation(false);
    setMergeLoading(true);
    try {
      const response = await api.post(`api/testimonials/${id}/merge`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: { company_id: currentUser.company_id }
      });
      setMergedVideoUrl(response.data.mergedVideoUrl);
      setMergeSuccess(true);
    } catch (err) {
      console.error('Error merging videos:', err);
      setError('Failed to merge videos. Please try again.');
    } finally {
      setMergeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="testimonial-detail-container">
        <div className="testimonial-loading">
          <div className="loading-spinner"></div>
          <p>Loading testimonial...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="testimonial-detail-container">
        <div className="testimonial-detail-header">
          <Link to="/dashboard/testimonials" className="back-button">
            <ArrowLeft size={16} />
            Back to Testimonials
          </Link>
        </div>
        <div className="testimonial-alert error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!testimonial) {
    return (
      <div className="testimonial-detail-container">
        <div className="testimonial-detail-header">
          <Link to="/dashboard/testimonials" className="back-button">
            <ArrowLeft size={16} />
            Back to Testimonials
          </Link>
        </div>
        <div className="testimonial-not-found">
          <h2>Testimonial Not Found</h2>
          <p>The testimonial you are looking for does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="testimonial-detail-container">
      <div className="testimonial-detail-header">
        <Link to="/dashboard/testimonials" className="back-button">
          <ArrowLeft size={16} />
          Back to Testimonials
        </Link>
        <h1>Testimonial from {testimonial.customer_name || testimonial.customer_email}</h1>
      </div>

      <div className="testimonial-meta">
        <div className="meta-item">
          <span className="meta-label">Status:</span>
          <span className={`status-badge ${testimonial.status}`}>
            {testimonial.status}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Email:</span>
          <span>{testimonial.customer_email}</span>
        </div>
        {testimonial.customer_title && (
          <div className="meta-item">
            <span className="meta-label">Title:</span>
            <span>{testimonial.customer_title}</span>
          </div>
        )}
        <div className="meta-item">
          <span className="meta-label">Submitted:</span>
          <span>{new Date(testimonial.updated_at).toLocaleString()}</span>
        </div>
      </div>

      <div className="testimonial-responses-container">
        <h2>Video Responses</h2>
        
        {testimonial.testimonial_responses.length === 0 ? (
          <div className="no-responses">
            <p>No video responses available for this testimonial.</p>
          </div>
        ) : (
          <div className="responses-grid">
            {testimonial.testimonial_responses.map((response) => (
              <div key={response.id} className="response-card">
                <div className="response-question">
                  <h3>Question:</h3>
                  <p>{response.question?.text || 'Question not available'}</p>
                </div>
                
                {response.video_url ? (
                  <div className="response-video">
                    <video controls>
                      <source src={response.video_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <div className="no-video">
                    <Play size={32} />
                    <p>No video available for this response</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {testimonial.testimonial_responses.length > 0 && (
        <div className="testimonial-actions">
          {(testimonial.video_url || mergedVideoUrl) ? (
            <div className="merged-video-container">
              <h2>Merged Testimonial Video</h2>
              <div className="merged-video">
                <video controls className="main-video">
                  <source src={mergedVideoUrl || testimonial.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <a 
                href={mergedVideoUrl || testimonial.video_url} 
                download="merged_testimonial.mp4"
                className="download-button"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download size={16} />
                Download Video
              </a>
            </div>
          ) : (
            <button 
              className="merge-button"
              onClick={handleConfirmMerge}
              disabled={mergeLoading}
            >
              {mergeLoading ? (
                <>
                  <div className="button-spinner"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Film size={16} />
                  Merge All Videos
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <h3>Confirm Merge</h3>
            <p>Are you sure you want to merge all videos into one testimonial?</p>
            <div className="confirmation-buttons">
              <button onClick={handleMergeVideos} className="confirm-button">Yes, Merge</button>
              <button onClick={() => setShowConfirmation(false)} className="cancel-button">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialDetail;
