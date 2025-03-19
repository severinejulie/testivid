import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import './Questions.css';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch questions from the backend
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // This endpoint would need to be implemented on your backend
      const response = await api.get('/api/questions');
      setQuestions(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions. Please try again later.');
      
      // For demo purposes, if the API endpoint doesn't exist yet
      // Uncomment to use sample data
      
      setQuestions([
        { id: 1, text: 'What problem did our product help you solve?' },
        { id: 2, text: 'How has our service improved your business?' },
        { id: 3, text: 'What specific feature do you find most valuable?' },
        { id: 4, text: 'Would you recommend our product to others? Why?' }
      ]);
      setError(null);
      
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
        await api.put(`/api/questions/${editingQuestion.id}`, { 
          text: newQuestion 
        });
        
        setQuestions(questions.map(q => 
          q.id === editingQuestion.id ? { ...q, text: newQuestion } : q
        ));
        setEditingQuestion(null);
      } else {
        // Add new question
        const response = await api.post('/api/questions', { 
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

  // Delete a question
  const handleDelete = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }
    
    try {
      await api.delete(`/api/questions/${questionId}`);
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Failed to delete question. Please try again.');
    }
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
              <p>No questions added yet. Create your first question above!</p>
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
                          onClick={() => handleDelete(question.id)}
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
    </div>
  );
};

export default Questions;