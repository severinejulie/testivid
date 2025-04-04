// Updated TestimonialSubmit.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './TestimonialSubmit.css';
import Webcam from 'react-webcam';
import { Camera, Video, RefreshCw, ArrowRight } from 'lucide-react';

const TestimonialSubmit = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [testimonial, setTestimonial] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  
  // Video recording states
  const [step, setStep] = useState('info'); // 'info', 'recording', 'complete'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const [finalVideos, setFinalVideos] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerTitle, setCustomerTitle] = useState('');
  
  // Recording specific states
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [videoURL, setVideoURL] = useState('');
  const [bgColor, setBgColor] = useState("#000000");

  // Fetch testimonial data
  useEffect(() => {
    const fetchTestimonial = async () => {
      try {
        const response = await api.get(`api/public/testimonial/validate/${token}`);
        setTestimonial(response.data.testimonial);
        setQuestions(response.data.questions);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching testimonial:', err);
        setError(err.response?.data?.error || 'Failed to load testimonial. Please check your link and try again.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchTestimonial();
    }
  }, [token]);

  // Start the countdown before recording
  const startCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          handleStartRecording();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  // Start recording from webcam
  const handleStartRecording = () => {
    setRecordedChunks([]); // Reset previous recordings
    setIsRecording(true);
  
    const stream = webcamRef.current?.video?.srcObject;
    if (!stream) return;
  
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm',
    });
  
    let localChunks = [];
  
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        localChunks.push(event.data);
      }
    };
  
    recorder.onstop = () => {
      const blob = new Blob(localChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);

      setRecordedChunks(localChunks);
      setVideoURL(url);
      setShowPreview(true);
    };
  
    mediaRecorderRef.current = recorder;
    recorder.start();
  
    // Stop recording after 5 minutes
    setTimeout(() => {
      if (recorder.state === 'recording') {
        recorder.stop();
        setIsRecording(false);
      }
    }, 5 * 60 * 1000);
  };

  // Stop the recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Accept the recording and move to next question
  // Accept the recording and move to next question
const handleAccept = async () => {
  console.log(`------ DEBUG: handleAccept for question ${currentQuestionIndex + 1}/${questions.length} ------`);
  console.log(`DEBUG: Current recordings length before adding: ${recordings.length}`);
  
  if (recordedChunks.length > 0) {
    console.log(`DEBUG: Have recorded chunks: ${recordedChunks.length}`);
    
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    console.log(`DEBUG: Created blob of size: ${blob.size} bytes`);
    
    // Add to recordings array
    const newRecordings = [
      ...recordings,
      { 
        questionId: questions[currentQuestionIndex].id, 
        blob,
        bgColor
      }
    ];
    
    console.log(`DEBUG: New recordings length: ${newRecordings.length}`);
    console.log(`DEBUG: Question IDs in new recordings: ${newRecordings.map(r => r.questionId).join(', ')}`);
    
    // Update recordings state
    setRecordings(newRecordings);
    
    // Reset recording states
    setShowPreview(false);
    setVideoURL('');
    setRecordedChunks([]);
    
    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      console.log(`DEBUG: Moving to next question (${currentQuestionIndex + 2}/${questions.length})`);
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      console.log(`DEBUG: This was the last question. Moving to complete step.`);
      // Instead of calling handleSubmitAllVideos directly,
      // wait for state to update, then move to complete step
      setStep('complete');
      
      // Wait for the next render cycle to ensure recordings are updated
      console.log(`DEBUG: Scheduling submission with ${newRecordings.length} recordings`);
      setTimeout(() => {
        console.log(`DEBUG: Inside setTimeout - about to call handleSubmitAllVideos with ${newRecordings.length} recordings`);
        handleSubmitAllVideos(newRecordings); // Pass the latest recordings directly
      }, 0);
    }
  } else {
    console.error(`DEBUG: No recorded chunks available!`);
  }
};

  // Retake the recording
  const handleRetake = () => {
    setShowPreview(false);
    setVideoURL('');
    setRecordedChunks([]);
    URL.revokeObjectURL(videoURL); // Clean up the URL
  };

  // Move from info step to recording step
  const startRecordingProcess = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Please enter your name before proceeding');
      return;
    }
    setStep('recording');
    setError(null);
  };

  // Enhanced function with detailed logging
const handleSubmitAllVideos = async (recordingsToSubmit = null) => {
  // Use passed recordings or fall back to state
  const videosToSubmit = recordingsToSubmit || recordings;
  
  console.log(`------ DEBUG: Starting submission process ------`);
  console.log(`DEBUG: Total questions: ${questions.length}`);
  console.log(`DEBUG: Recordings array length: ${recordings.length}`);
  console.log(`DEBUG: VideosToSubmit length: ${videosToSubmit.length}`);
  
  if (videosToSubmit.length === 0) {
    console.error('DEBUG: No recordings to submit!');
    setError('No recordings to submit.');
    return;
  }
  
  // Debug info for each recording
  videosToSubmit.forEach((rec, idx) => {
    console.log(`DEBUG: Recording ${idx + 1} - Question ID: ${rec.questionId}, Has blob: ${!!rec.blob}`);
  });
  
  setIsProcessing(true);
  
  try {
    const formData = new FormData();
    
    // Log before adding to FormData
    console.log(`DEBUG: Building FormData with ${videosToSubmit.length} videos`);
    
    // Append videos with consistent field names
    videosToSubmit.forEach((recording, index) => {
      if (!recording.blob) {
        console.error(`DEBUG: Missing blob for recording ${index}`);
        return;
      }
      
      // Make sure each file has a unique name
      const filename = `video${index}.webm`;
      formData.append("videos", recording.blob, filename);
      formData.append(`questionIds[${index}]`, recording.questionId);
      formData.append(`bgColors[${index}]`, recording.bgColor || "#000000");
      
      console.log(`DEBUG: Added to FormData - ${filename} with question ID ${recording.questionId}`);
    });
    
    // Other single values
    formData.append("name", customerName);
    formData.append("title", customerTitle);
    formData.append("testimonialId", testimonial.id);
    formData.append("token", token);

    // Log what's in the FormData (limited info since we can't directly inspect FormData)
    console.log(`DEBUG: FormData prepared with testimonial ID: ${testimonial.id}`);
    console.log(`DEBUG: Submitting to API...`);
    
    // Set the correct headers for FormData
    const response = await api.post("api/public/testimonial/save", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log(`DEBUG: API response received:`, response.data);
    setFinalVideos(response.data.videoUrls);
    setSuccess(true);
    
  } catch (err) {
    console.error('Error submitting videos:', err);
    console.error('DEBUG: API error details:', err.response?.data);
    setError(err.response?.data?.error || 'Failed to submit testimonial videos. Please try again.');
  } finally {
    setIsProcessing(false);
    console.log(`------ DEBUG: Submission process completed ------`);
  }
};

  // Clean up video URLs when component unmounts
  useEffect(() => {
    return () => {
      if (videoURL) {
        URL.revokeObjectURL(videoURL);
      }
    };
  }, [videoURL]);

  if (loading) {
    return (
      <div className="testimonial-submit-container">
        <div className="testimonial-loading">
          <div className="loading-spinner"></div>
          <p>Loading testimonial request...</p>
        </div>
      </div>
    );
  }

  if (error && !testimonial) {
    return (
      <div className="testimonial-submit-container">
        <div className="testimonial-error">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="testimonial-submit-container">
        <div className="testimonial-success">
          <h2>Thank You!</h2>
          <p>Your video testimonial has been submitted successfully.</p>
          <p>We appreciate you taking the time to share your feedback.</p>
          
          {finalVideos.length > 0 && (
            <div className="final-video-container">
              <h3>Your Testimonial Videos</h3>
              
              {finalVideos.map((videoUrl, index) => (
                <video key={index} controls className="final-video">
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  

  return (
    <div className="testimonial-submit-container">
      <div className="testimonial-header">
        {testimonial?.company?.logo_url && (
          <img 
            src={testimonial.company.logo_url} 
            alt={`${testimonial.company.name} logo`} 
            className="company-logo"
          />
        )}
        <h1>Welcome to Testivid</h1>
        <p className="company-request">
          {testimonial?.company?.name} would like your video testimonial
        </p>
      </div>

      {error && (
        <div className="testimonial-alert error">
          <p>{error}</p>
        </div>
      )}

      <div className="testimonial-progress">
        <div className={`progress-step ${step === 'info' ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Information</span>
        </div>
        <div className="progress-connector"></div>
        <div className={`progress-step ${step === 'recording' ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Recording {step === 'recording' ? `(${currentQuestionIndex + 1}/${questions.length})` : ''}</span>
        </div>
        <div className="progress-connector"></div>
        <div className={`progress-step ${step === 'complete' ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Complete</span>
        </div>
      </div>

      <div className="testimonial-form-container">
        {step === 'info' && (
          <>
            <div className="info-header">
              <h2>Customer Information</h2>
              <p>Please provide your information before we start recording.</p>
            </div>
            
            <form onSubmit={startRecordingProcess} className="info-form">
              <div className="form-group">
                <label htmlFor="customerName">Your Name</label>
                <input
                  type="text"
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="customerTitle">Your Title/Position (Optional)</label>
                <input
                  type="text"
                  id="customerTitle"
                  value={customerTitle}
                  onChange={(e) => setCustomerTitle(e.target.value)}
                  placeholder="e.g. Marketing Director at Company XYZ"
                />
              </div>
              
              <div className="questions-preview">
                <h3>Questions you'll be asked:</h3>
                <ul className="questions-list">
                  {questions.map((question, index) => (
                    <li key={question.id}>
                      <span className="question-number">{index + 1}.</span> {question.text}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  Start Recording
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'recording' && questions.length > 0 && (
          <div className="recording-container">
            <h2 className="recording-question">
              Question {currentQuestionIndex + 1}: {questions[currentQuestionIndex].text}
            </h2>
            
            <div className="video-container">
              {!showPreview ? (
                <div className="webcam-container">
                  <Webcam
                    ref={webcamRef}
                    audio={true}
                    muted={true}
                    className="webcam-video"
                  />
                  {countdown !== null && (
                    <div className="countdown-overlay">
                      <span className="countdown-number">{countdown}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="preview-container">
                  <video
                    src={videoURL}
                    controls
                    autoPlay
                    className="preview-video"
                  />
                </div>
              )}
            </div>
            
            <div className="recording-controls">
              {!isRecording && !showPreview && (
                <button
                  onClick={startCountdown}
                  className="record-button"
                >
                  <Camera size={20} className="button-icon" />
                  Start Recording
                </button>
              )}
              
              {isRecording && (
                <button
                  onClick={handleStopRecording}
                  className="stop-button"
                >
                  Stop Recording
                </button>
              )}
              
              {showPreview && (
                <div className="preview-controls">
                  {/* <div className="color-selector">
                    <label htmlFor="bgColor">Background Color for Question:</label>
                    <input
                      type="color"
                      id="bgColor"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                    />
                  </div> */}
                  
                  <div className="preview-buttons">
                    <button
                      onClick={handleRetake}
                      className="retake-button"
                    >
                      <RefreshCw size={20} className="button-icon" />
                      Retake
                    </button>
                    
                    <button
                      onClick={handleAccept}
                      className="accept-button"
                    >
                      {currentQuestionIndex < questions.length - 1 ? 'Save & Next Question' : 'Complete Testimonial'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {step === 'complete' && (
          <div className="complete-container">
            {isProcessing ? (
              <div className="processing-indicator">
                <div className="processing-spinner"></div>
                <p>Processing your video testimonial...</p>
                <p className="processing-info">This may take a few moments. Please don't close this page.</p>
              </div>
            ) : (
              <div className="submission-complete">
                <Video size={48} className="complete-icon" />
                <h2>Processing Complete!</h2>
                <p>Your video testimonial is ready.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialSubmit;