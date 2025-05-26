import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { createQuiz } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAutoResize } from '../../hooks/useAutoResize';
import './QuizCreator.css';

const QuizCreator = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // Quiz metadata
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category: 'general',
    difficulty: 'mixed',
    isPublic: true,
    tags: []
  });
  
  // Questions state
  const [questions, setQuestions] = useState([{
    question: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    timeLimit: 30,
    points: 1000,
    difficulty: 'medium',
    questionType: 'multiple-choice'
  }]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [tagInput, setTagInput] = useState('');

  // Auto-resize hooks for textareas
  const descriptionResize = useAutoResize(quizData.description, 3, 8);
  
  // Create auto-resize hooks for each question (up to reasonable limit)
  const questionResizes = [
    useAutoResize(questions[0]?.question || '', 3, 8),
    useAutoResize(questions[1]?.question || '', 3, 8),
    useAutoResize(questions[2]?.question || '', 3, 8),
    useAutoResize(questions[3]?.question || '', 3, 8),
    useAutoResize(questions[4]?.question || '', 3, 8),
    useAutoResize(questions[5]?.question || '', 3, 8),
    useAutoResize(questions[6]?.question || '', 3, 8),
    useAutoResize(questions[7]?.question || '', 3, 8),
    useAutoResize(questions[8]?.question || '', 3, 8),
    useAutoResize(questions[9]?.question || '', 3, 8)
  ];

  const handleQuizDataChange = (field, value) => {
    setQuizData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex][field] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerToggle = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];
    
    // Uncheck all options first
    question.options.forEach(option => option.isCorrect = false);
    
    // Check the selected option
    question.options[optionIndex].isCorrect = true;
    
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].options.length < 6) {
      newQuestions[questionIndex].options.push({ text: '', isCorrect: false });
      setQuestions(newQuestions);
    }
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].options.length > 2) {
      newQuestions[questionIndex].options.splice(optionIndex, 1);
      setQuestions(newQuestions);
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      question: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      timeLimit: 30,
      points: 1000,
      difficulty: 'medium',
      questionType: 'multiple-choice'
    };
    setQuestions([...questions, newQuestion]);
    setActiveQuestion(questions.length);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
      if (activeQuestion >= newQuestions.length) {
        setActiveQuestion(newQuestions.length - 1);
      }
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !quizData.tags.includes(tagInput.trim()) && quizData.tags.length < 10) {
      handleQuizDataChange('tags', [...quizData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    handleQuizDataChange('tags', quizData.tags.filter(tag => tag !== tagToRemove));
  };

  const validateQuiz = () => {
    const errors = [];
    
    if (!quizData.title.trim()) {
      errors.push('Quiz title is required');
    }
    
    if (questions.length === 0) {
      errors.push('At least one question is required');
    }
    
    questions.forEach((question, index) => {
      if (!question.question.trim()) {
        errors.push(`Question ${index + 1} text is required`);
      }
      
      if (question.options.length < 2) {
        errors.push(`Question ${index + 1} must have at least 2 options`);
      }
      
      const hasCorrectAnswer = question.options.some(option => option.isCorrect);
      if (!hasCorrectAnswer) {
        errors.push(`Question ${index + 1} must have a correct answer selected`);
      }
      
      const hasEmptyOptions = question.options.some(option => !option.text.trim());
      if (hasEmptyOptions) {
        errors.push(`Question ${index + 1} has empty options`);
      }
    });
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateQuiz();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const quizPayload = {
        ...quizData,
        questions: questions
      };
      
      const response = await createQuiz(quizPayload);
      
      if (response.success) {
        navigate('/dashboard', { 
          state: { message: 'Quiz created successfully!' }
        });
      } else {
        setError(response.message || 'Failed to create quiz');
      }
    } catch (err) {
      console.error('Quiz creation error:', err);
      setError(err.response?.data?.message || 'Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="quiz-creator-container">
      <div className="quiz-creator-header">
        <h1 className="quiz-creator-title">Create Your Quiz</h1>
        <p className="quiz-creator-subtitle">Design an engaging quiz for your audience</p>
      </div>

      <form onSubmit={handleSubmit} className="quiz-form">
        {/* Quiz Metadata Section */}
        <div className="form-section">
          <h2 className="section-title">
            <span className="section-icon">📝</span>
            Quiz Details
          </h2>
          
          <div className="form-group">
            <label className="form-label">Quiz Title *</label>
            <input
              type="text"
              value={quizData.title}
              onChange={(e) => handleQuizDataChange('title', e.target.value)}
              placeholder="Enter an engaging quiz title..."
              className="form-input"
              maxLength={100}
              required
            />
            <small className="character-count">
              {quizData.title.length}/100 characters
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              ref={descriptionResize.textareaRef}
              value={quizData.description}
              onChange={(e) => handleQuizDataChange('description', e.target.value)}
              placeholder="Describe what your quiz is about..."
              className="form-input form-textarea"
              maxLength={500}
              rows={3}
            />
            <small className="character-count">
              {quizData.description.length}/500 characters
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                value={quizData.category}
                onChange={(e) => handleQuizDataChange('category', e.target.value)}
                className="form-input form-select"
                required
              >
                <option value="general">General Knowledge</option>
                <option value="science">Science</option>
                <option value="history">History</option>
                <option value="sports">Sports</option>
                <option value="entertainment">Entertainment</option>
                <option value="technology">Technology</option>
                <option value="art">Art</option>
                <option value="geography">Geography</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select
                value={quizData.difficulty}
                onChange={(e) => handleQuizDataChange('difficulty', e.target.value)}
                className="form-input form-select"
              >
                <option value="mixed">Mixed</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tags</label>
            <div className="tags-input-container">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tags to help others find your quiz..."
                className="form-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <button type="button" onClick={addTag} className="add-tag-btn">
                Add Tag
              </button>
            </div>
            {quizData.tags.length > 0 && (
              <div className="tags-list">
                {quizData.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="remove-tag-btn"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="quiz-settings">
            <div className="setting-item">
              <label className="setting-label">
                <span>Public Quiz</span>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={quizData.isPublic}
                    onChange={(e) => handleQuizDataChange('isPublic', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </div>
              </label>
              <small>Allow others to discover and play your quiz</small>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="form-section">
          <div className="questions-header">
            <h2 className="section-title">
              <span className="section-icon">❓</span>
              Questions ({questions.length})
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="add-question-button"
            >
              <span>+</span> Add Question
            </button>
          </div>

          <div className="questions-tabs">
            {questions.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveQuestion(index)}
                className={`question-tab ${activeQuestion === index ? 'active' : ''}`}
              >
                Q{index + 1}
              </button>
            ))}
          </div>

          {questions.map((question, questionIndex) => (
            <div
              key={questionIndex}
              className={`question-editor ${activeQuestion === questionIndex ? 'active' : 'hidden'}`}
            >
              <div className="question-header">
                <div className="question-number-badge">
                  Question {questionIndex + 1}
                </div>
                <div className="question-actions">
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(questionIndex)}
                      className="action-button delete-button"
                      title="Delete Question"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              <div className="question-form">
                <div className="question-text-group">
                  <label className="form-label">Question Text *</label>
                  <textarea
                    ref={questionResizes[questionIndex]?.textareaRef}
                    value={question.question}
                    onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                    placeholder="Enter your question here..."
                    className="question-text-input"
                    maxLength={500}
                    rows={3}
                    required
                  />
                  <small className="character-count">
                    {question.question.length}/500 characters
                  </small>
                </div>

                <div className="answers-section">
                  <div className="answers-header">
                    <h3 className="answers-title">Answer Options</h3>
                    {question.options.length < 6 && (
                      <button
                        type="button"
                        onClick={() => addOption(questionIndex)}
                        className="add-answer-button"
                      >
                        + Add Option
                      </button>
                    )}
                  </div>

                  <div className="answers-list">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className={`answer-item ${option.isCorrect ? 'correct' : ''}`}>
                        <div className={`answer-color ${['red', 'blue', 'yellow', 'green', 'purple', 'orange'][optionIndex] || 'gray'}`}>
                          {String.fromCharCode(65 + optionIndex)}
                        </div>
                        
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'text', e.target.value)}
                          placeholder={`Option ${optionIndex + 1}`}
                          className="answer-input"
                          maxLength={200}
                          required
                        />

                        <div className="answer-actions">
                          <label className="correct-toggle">
                            <input
                              type="checkbox"
                              checked={option.isCorrect}
                              onChange={() => handleCorrectAnswerToggle(questionIndex, optionIndex)}
                            />
                            <span className="correct-slider"></span>
                          </label>
                          
                          {question.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(questionIndex, optionIndex)}
                              className="remove-answer-button"
                              title="Remove Option"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="question-settings">
                  <div className="setting-group">
                    <label className="setting-label">Time Limit (seconds)</label>
                    <input
                      type="number"
                      value={question.timeLimit}
                      onChange={(e) => handleQuestionChange(questionIndex, 'timeLimit', parseInt(e.target.value))}
                      className="setting-input"
                      min={5}
                      max={120}
                    />
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">Points</label>
                    <input
                      type="number"
                      value={question.points}
                      onChange={(e) => handleQuestionChange(questionIndex, 'points', parseInt(e.target.value))}
                      className="setting-input"
                      min={100}
                      max={2000}
                      step={100}
                    />
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">Difficulty</label>
                    <select
                      value={question.difficulty}
                      onChange={(e) => handleQuestionChange(questionIndex, 'difficulty', e.target.value)}
                      className="setting-input"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="validation-errors">
            <h4>Please fix the following issues:</h4>
            <p>{error}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="quiz-creator-footer">
          <div className="footer-info">
            <span>{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="footer-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="save-draft-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="publish-button"
              disabled={loading}
            >
              {loading ? 'Creating Quiz...' : 'Create Quiz'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QuizCreator;