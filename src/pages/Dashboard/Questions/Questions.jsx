import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import './Questions.css';
import { useAuth } from '../../../context/AuthContext';
import { GripVertical } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash,
  faEdit
} from '@fortawesome/free-solid-svg-icons';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable table row component
const SortableTableRow = ({ question, onEdit, onDelete, isDraggable }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 'auto',
    position: isDragging ? 'relative' : 'static',
    background: isDragging ? '#f0f7ff' : 'white',
  };

  return (
    <tr ref={setNodeRef} style={style}>
      {isDraggable && (
        <td className="drag-handle-cell">
          <div className="drag-handle" {...attributes} {...listeners}>
            <GripVertical size={16} />
          </div>
        </td>
      )}
      <td>{question.text}</td>
      <td className="actions-cell">
        <button 
          className="edit-button" 
          onClick={() => onEdit(question)}
          aria-label="Edit question"
        >
        <FontAwesomeIcon icon={faEdit} className="nav-icon" />
        </button>
        <button 
          className="delete-button" 
          onClick={() => onDelete(question.id)}
          aria-label="Delete question"
        >
        <FontAwesomeIcon icon={faTrash} className="nav-icon" />
        </button>
      </td>
    </tr>
  );
};

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Minimum drag distance for activation (5px)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/questions/list?company_id=${currentUser.company_id}&_=${Date.now()}`);
      // Sort questions by order_position
      const sortedQuestions = response.data.sort((a, b) => a.order_position - b.order_position);
      setQuestions(sortedQuestions);
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
          text: newQuestion,
          order_position: questions.length + 1 // Set the order_position to the end of the list
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
      
      // After deleting, we need to update the order_position of remaining questions
      const remainingQuestions = questions.filter(q => q.id !== questionToDelete);
      const updatedQuestions = remainingQuestions.map((question, index) => ({
        ...question,
        order_position: index + 1
      }));
      
      // Update positions in the database
      await Promise.all(updatedQuestions.map(question => 
        api.post('/api/questions/update-position', {
          id: question.id,
          company_id: currentUser.company_id,
          order_position: question.order_position
        })
      ));
      
      setQuestions(updatedQuestions);
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
  
  // Handle drag end event from DndKit
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }
    
    // Find the indices of the dragged item and the drop target
    const oldIndex = questions.findIndex(q => q.id.toString() === active.id);
    const newIndex = questions.findIndex(q => q.id.toString() === over.id);
    
    // Reorder the questions array
    const updatedQuestions = arrayMove(questions, oldIndex, newIndex);
    
    // Update the order_position for each question
    const reorderedQuestions = updatedQuestions.map((question, index) => ({
      ...question,
      order_position: index + 1
    }));
    
    // Update the state immediately for responsive UI
    setQuestions(reorderedQuestions);
    
    try {
      // Save the new order to the database
      await Promise.all(reorderedQuestions.map(question => 
        api.post('/api/questions/update-position', {
          id: question.id,
          company_id: currentUser.company_id,
          order_position: question.order_position
        })
      ));
    } catch (err) {
      console.error('Error updating question positions:', err);
      setError('Failed to save the new question order. Please try again.');
      // If the API call fails, revert to the previous state
      fetchQuestions();
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
              <p>No questions added yet. Create your first question</p>
            </div>
          ) : (
            <div className="questions-table-container">
              {/* Move DndContext outside of the table structure */}
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <table className="questions-table">
                  <thead>
                    <tr>
                      {questions.length > 1 && <th className="drag-column"></th>}
                      <th>Question</th>
                      <th className="actions-column">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* SortableContext doesn't render a DOM element, so it's safe inside tbody */}
                    <SortableContext 
                      items={questions.map(q => q.id.toString())}
                      strategy={verticalListSortingStrategy}
                    >
                      {questions.map((question) => (
                        <SortableTableRow
                          key={question.id}
                          question={question}
                          onEdit={handleEdit}
                          onDelete={confirmDelete}
                          isDraggable={questions.length > 1}
                        />
                      ))}
                    </SortableContext>
                  </tbody>
                </table>
                
                {/* Accessibility description for screen readers - moved outside table */}
                <div className="sr-only" id="drag-instruction" aria-hidden="true">
                  Use keyboard arrow keys to move questions up and down after selecting the drag handle.
                </div>
              </DndContext>
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