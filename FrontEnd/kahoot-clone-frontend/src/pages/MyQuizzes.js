import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyQuizzes, deleteQuiz, createGame } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './MyQuizzes.css';

const MyQuizzes = () => {
  const navigate = useNavigate();
  
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const loadMyQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchMyQuizzes(currentPage, 12);
      
      if (response.success) {
        setQuizzes(response.data.quizzes || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setError('Failed to load your quizzes');
      }
    } catch (err) {
      console.error('Error loading quizzes:', err);
      setError('Failed to load your quizzes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadMyQuizzes();
  }, [loadMyQuizzes]);

  const handleDeleteQuiz = async () => {
    if (!selectedQuiz) return;
    
    try {
      setActionLoading('delete');
      const response = await deleteQuiz(selectedQuiz._id);
      
      if (response.success) {
        setQuizzes(quizzes.filter(quiz => quiz._id !== selectedQuiz._id));
        setShowDeleteModal(false);
        setSelectedQuiz(null);
      } else {
        setError('Failed to delete quiz');
      }
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setError('Failed to delete quiz. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartGame = async (quizId) => {
    try {
      setActionLoading(quizId);
      const response = await createGame(quizId);
      
      if (response.success) {
        navigate(`/game-lobby`, { 
          state: { 
            gamePin: response.data.gamePin,
            isHost: true,
            quiz: quizzes.find(q => q._id === quizId)
          }
        });
      } else {
        setError('Failed to start game');
      }
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditQuiz = (quizId) => {
    navigate(`/quiz-creator/${quizId}`);
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#51cf66';
      case 'medium': return '#feca57';
      case 'hard': return '#ff6b6b';
      default: return '#667eea';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="my-quizzes-container">
      <div className="my-quizzes-header">
        <div className="header-content">
          <h1 className="page-title">My Quizzes</h1>
          <p className="page-subtitle">Manage your created quizzes</p>
        </div>
        
        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search your quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <button
            onClick={() => navigate('/quiz-creator')}
            className="create-quiz-btn"
          >
            <span className="btn-icon">+</span>
            Create New Quiz
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      <div className="quizzes-stats">
        <div className="stat-card">
          <div className="stat-number">{quizzes.length}</div>
          <div className="stat-label">Total Quizzes</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{quizzes.filter(q => q.isPublic).length}</div>
          <div className="stat-label">Public Quizzes</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {quizzes.reduce((total, quiz) => total + (quiz.questions?.length || 0), 0)}
          </div>
          <div className="stat-label">Total Questions</div>
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No quizzes found</h3>
          <p>
            {quizzes.length === 0 
              ? "You haven't created any quizzes yet. Start by creating your first quiz!"
              : "No quizzes match your search criteria."
            }
          </p>
          {quizzes.length === 0 && (
            <button
              onClick={() => navigate('/quiz-creator')}
              className="create-first-quiz-btn"
            >
              Create Your First Quiz
            </button>
          )}
        </div>
      ) : (
        <div className="quizzes-grid">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz._id} className="quiz-card">
              <div className="quiz-card-header">
                <div className="quiz-title">{quiz.title}</div>
                <div className="quiz-category">{quiz.category}</div>
              </div>
              
              <div className="quiz-card-body">
                <p className="quiz-description">
                  {quiz.description || 'No description provided'}
                </p>
                
                <div className="quiz-meta">
                  <div className="quiz-stats">
                    <span className="stat">
                      {quiz.questions?.length || 0} questions
                    </span>
                    <span className="stat">
                      {quiz.playCount || 0} plays
                    </span>
                  </div>
                  
                  <div className="quiz-info">
                    <span 
                      className="difficulty-badge"
                      style={{ backgroundColor: getDifficultyColor(quiz.difficulty) }}
                    >
                      {quiz.difficulty || 'Mixed'}
                    </span>
                    <span className="visibility-badge">
                      {quiz.isPublic ? '🌐 Public' : '🔒 Private'}
                    </span>
                  </div>
                </div>
                
                <div className="quiz-dates">
                  <span className="created-date">
                    Created: {formatDate(quiz.createdAt)}
                  </span>
                  {quiz.updatedAt && quiz.updatedAt !== quiz.createdAt && (
                    <span className="updated-date">
                      Updated: {formatDate(quiz.updatedAt)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="quiz-card-actions">
                <button
                  onClick={() => handleStartGame(quiz._id)}
                  className="action-btn play-btn"
                  disabled={actionLoading === quiz._id}
                >
                  Start
                </button>
                
                <button
                  onClick={() => handleEditQuiz(quiz._id)}
                  className="action-btn edit-btn"
                >
                  Edit
                </button>
                
                <button
                  onClick={() => {
                    setSelectedQuiz(quiz);
                    setShowDeleteModal(true);
                  }}
                  className="action-btn delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Previous
          </button>
          
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Delete Quiz</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p>
                Are you sure you want to delete "<strong>{selectedQuiz?.title}</strong>"?
              </p>
              <p className="modal-warning">
                This action cannot be undone. All game history associated with this quiz will also be lost.
              </p>
            </div>
            
            <div className="modal-actions">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="modal-btn cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteQuiz}
                className="modal-btn delete-btn"
                disabled={actionLoading === 'delete'}
              >
                {actionLoading === 'delete' ? 'Deleting...' : 'Delete Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyQuizzes;
