import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import './Questions.css';
import { useAuth } from '../../../context/AuthContext';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser} = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);


  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/questions/list?company_id=${currentUser.company_id}&_=${Date.now()}`);
      setQuestions(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  

  // Load questions on component mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  // Handle form submission to add a new question
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newQuestion.trim()) return;
    
    try {
      if (editingQuestion) {
        // Update existing question
        await api.post(`/api/questions/edit`, { 
          id: editingQuestion.id,
          company_id: currentUser.company_id,
          text: newQuestion
        });
        
        setQuestions(questions.map(q => 
          q.id === editingQuestion.id ? { ...q, text: newQuestion } : q
        ));
        setEditingQuestion(null);
      } else {
        // Add new question
        const response = await api.post('/api/questions/add', { 
          company_id: currentUser.company_id,
          text: newQuestion 
        });
        
        setQuestions([...questions, response.data]);
      }
      
      setNewQuestion('');
      setError(null);
    } catch (err) {
      console.error('Error saving question:', err);
      setError('Failed to save question. Please try again.');
    }
  };

  // Start editing a question
  const handleEdit = (question) => {
    setEditingQuestion(question);
    setNewQuestion(question.text);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setNewQuestion('');
  };

  const confirmDelete = (questionId) => {
    setQuestionToDelete(questionId);
    setShowModal(true);
  };
  
  const handleDeleteConfirmed = async () => {
    if (!questionToDelete) return;
  
    try {
      await api.post(`/api/questions/delete`, {
        id: questionToDelete,
        company_id: currentUser.company_id
      });
      setQuestions(questions.filter(q => q.id !== questionToDelete));
      setError(null);
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Failed to delete question. Please try again.');
    } finally {
      setShowModal(false);
      setQuestionToDelete(null);
    }
  };
  
  const cancelDelete = () => {
    setShowModal(false);
    setQuestionToDelete(null);
  };
  

  return (
    <div className="dashboard-content questions-page">
      <h1>Questions Manager</h1>
      <p className="section-description">
        Create and manage questions for your video testimonials. 
        Well-crafted questions lead to more compelling testimonials.
      </p>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="questions-container">
        <section className="question-form-section">
          <h2>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
          
          <form onSubmit={handleSubmit} className="question-form">
            <div className="form-group">
              <label htmlFor="questionText">Question Text</label>
              <textarea
                id="questionText"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Enter your question here..."
                rows="3"
                required
              />
              <p className="form-hint">
                Good questions are specific, open-ended, and focused on the customer's experience.
              </p>
            </div>
            
            <div className="form-actions">
              {editingQuestion && (
                <button 
                  type="button" 
                  className="cancel-button" 
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
              
              <button type="submit" className="save-button">
                {editingQuestion ? 'Update Question' : 'Save Question'}
              </button>
            </div>
          </form>
        </section>
        
        <section className="questions-list-section">
          <h2>Existing Questions</h2>
          
          {loading ? (
            <div className="loading">Loading questions...</div>
          ) : questions.length === 0 ? (
            <div className="no-questions">
              <p>No questions added yet. Create your first question</p>
            </div>
          ) : (
            <div className="questions-table-container">
              <table className="questions-table">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th className="actions-column">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map(question => (
                    <tr key={question.id}>
                      <td>{question.text}</td>
                      <td className="actions-cell">
                        <button 
                          className="edit-button" 
                          onClick={() => handleEdit(question)}
                          aria-label="Edit question"
                        >
                          ✏️
                        </button>
                        <button 
                          className="delete-button" 
                          onClick={() => confirmDelete(question.id)}
                          aria-label="Delete question"
                        >
                          🗑️
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
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this question?</p>
            <div className="modal-actions">
              <button onClick={handleDeleteConfirmed} className="confirm-button">Yes, delete</button>
              <button onClick={cancelDelete} className="cancel-button">Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Questions;