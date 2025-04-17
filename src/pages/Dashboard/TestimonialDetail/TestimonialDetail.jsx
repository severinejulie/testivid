import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../services/api';
import './TestimonialDetail.css';
import { ArrowLeft, Play, Download, Film, Video, Wand2 } from 'lucide-react';
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
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [introGenerating, setIntroGenerating] = useState(false);
  const [showIntroConfirmation, setShowIntroConfirmation] = useState(false);
  const [showDownloadConfirmation, setShowDownloadConfirmation] = useState(false);
  const [introSuccess, setIntroSuccess] = useState(false);
  const [videoKey, setVideoKey] = useState(Date.now()); // Add a key to force video reload
  
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
      setVideoKey(Date.now()); // Force video reload
    } catch (err) {
      console.error('Error merging videos:', err);
      setError('Failed to merge videos. Please try again.');
    } finally {
      setMergeLoading(false);
    }
  };

  const handleSelectResponse = (response) => {
    setSelectedResponse(response);
  };

  const handleConfirmIntroGenerate = () => {
    if (selectedResponse) {
      setShowIntroConfirmation(true);
    }
  };

  const handleConfirmDownload = () => {
    if (selectedResponse) {
      setShowDownloadConfirmation(true);
    }
  };

  const handleDownloadVideo = () => {
    setShowDownloadConfirmation(false);
    
    // Create an anchor element and trigger the download
    if (selectedResponse && selectedResponse.video_url) {
      const link = document.createElement('a');
      link.href = selectedResponse.video_url;
      link.download = `testimonial_response_${selectedResponse.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleGenerateIntroVideo = async () => {
    setShowIntroConfirmation(false);
    setIntroGenerating(true);
    
    try {
      const response = await api.post(`api/testimonials/response/${selectedResponse.id}/generate-intro`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: { company_id: currentUser.company_id }
      });
      
      const newVideoUrl = response.data.video_url;
      
      // Update testimonial responses
      const updatedResponses = testimonial.testimonial_responses.map(resp => {
        if (resp.id === selectedResponse.id) {
          return { 
            ...resp, 
            video_url: newVideoUrl,
            intro_generated: true
          };
        }
        return resp;
      });
      
      setTestimonial({
        ...testimonial,
        testimonial_responses: updatedResponses
      });
      
      // Also update selected response
      setSelectedResponse(prev => ({
        ...prev,
        video_url: newVideoUrl,
        intro_generated: true
      }));
      
      // Force video reload by updating the key
      setVideoKey(Date.now());
      
      setIntroSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setIntroSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error generating intro video:', err);
      setError('Failed to generate intro video. Please try again.');
    } finally {
      setIntroGenerating(false);
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

      {introSuccess && (
        <div className="testimonial-alert success">
          <p>Video with question intro successfully generated!</p>
        </div>
      )}

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
            {testimonial.testimonial_responses
            .map((response) => (
              <div 
                key={response.id} 
                className={`response-card ${selectedResponse?.id === response.id ? 'selected' : ''}`}
                onClick={() => handleSelectResponse(response)}
              >
                <div className="response-question">
                  <p>{response.question?.text || 'Question not available'}</p>
                </div>
                
                {(response.intro_video_url || response.video_url) ? (
                  <div className="response-video">
                    <video
                      controls
                      key={`${response.id}-${videoKey}`}
                    >
                      <source
                        src={`${(response.intro_video_url || response.video_url)}?t=${videoKey}`}
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <div className="no-video">
                    <Play size={32} />
                    <p>No video available for this response</p>
                  </div>
                )}

                
                {selectedResponse?.id === response.id && response.video_url && (
                  <div className="response-actions">
                    {!response.intro_generated && (
                      <button 
                        className="intro-button"
                        onClick={handleConfirmIntroGenerate}
                        disabled={introGenerating}
                      >
                        <Wand2 size={16} />
                        Generate Video with Question Intro
                      </button>
                    )}
                    <button 
                      className="download-button"
                      onClick={handleConfirmDownload}
                    >
                      <Download size={16} />
                      Download Video
                    </button>
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
                <video 
                  controls 
                  className="main-video"
                  key={`merged-${videoKey}`} // Add key to force video reload
                >
                  <source 
                    src={`${mergedVideoUrl || testimonial.video_url}?t=${videoKey}`} // Add cache-busting query parameter
                    type="video/mp4" 
                  />
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

      {/* Merge Confirmation Modal */}
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

      {/* Intro Generation Confirmation Modal */}
      {showIntroConfirmation && selectedResponse && (
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <h3>Add Question Intro to Video</h3>
            <p>This will generate a new video with the question text shown as an intro before the testimonial response.</p>
            <p><strong>Question:</strong> {selectedResponse.question?.text || 'Question not available'}</p>
            <div className="confirmation-buttons">
              <button 
                onClick={handleGenerateIntroVideo} 
                className="confirm-button"
                disabled={introGenerating}
              >
                {introGenerating ? 'Processing...' : 'Generate Video'}
              </button>
              <button 
                onClick={() => setShowIntroConfirmation(false)} 
                className="cancel-button"
                disabled={introGenerating}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Confirmation Modal */}
      {showDownloadConfirmation && selectedResponse && (
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <h3>Download Video</h3>
            <p>Are you sure you want to download this video response?</p>
            <div className="confirmation-buttons">
              <button 
                onClick={handleDownloadVideo} 
                className="confirm-button"
              >
                Download
              </button>
              <button 
                onClick={() => setShowDownloadConfirmation(false)} 
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialDetail;