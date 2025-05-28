import React from 'react';
import './Question.css';

const Question = ({ 
  question, 
  timeRemaining, 
  hasAnswered, 
  isHost, 
  onAnswerSelect,
  gamePin 
}) => {
  const formatTime = (seconds) => {
    return seconds.toString().padStart(2, '0');
  };

  const getTimerColor = () => {
    if (timeRemaining > 10) return '#4CAF50'; // Green
    if (timeRemaining > 5) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <div className="question-container">
      <div className="question-header">
        <div className="timer-container">
          <div 
            className="timer-circle"
            style={{ 
              borderColor: getTimerColor(),
              '--progress': `${(timeRemaining / (question.timeLimit || 30)) * 100}%`
            }}
          >
            <span className="timer-text">{formatTime(timeRemaining)}</span>
          </div>
        </div>
        <div className="question-info">
          <h2 className="question-text">{question.question}</h2>
          <div className="question-points">
            {question.points || 1000} points
          </div>
        </div>
      </div>

      <div className="options-grid">
        {question.options?.map((option, index) => (
          <button 
            key={index}
            className={`option-button ${hasAnswered ? 'disabled' : ''} ${isHost ? 'host-view' : ''}`}
            onClick={() => !isHost && !hasAnswered && timeRemaining > 0 && onAnswerSelect(index)}
            disabled={hasAnswered || timeRemaining <= 0 || isHost}
            style={{
              backgroundColor: hasAnswered ? '#666' : `var(--option-${index + 1})`
            }}
          >
            <div className="option-content">
              <div className="option-letter">
                {String.fromCharCode(65 + index)}
              </div>
              <div className="option-text">
                {option.text}
              </div>
            </div>
          </button>
        ))}
      </div>

      {hasAnswered && !isHost && (
        <div className="answer-submitted">
          <p>✓ Answer submitted! Waiting for results...</p>
        </div>
      )}

      {isHost && (
        <div className="host-info">
          <p>Host view - Players are answering</p>
          <div className="game-pin-display">PIN: {gamePin}</div>
        </div>
      )}

      {timeRemaining <= 0 && (
        <div className="time-up">
          <p>⏰ Time's up!</p>
        </div>
      )}
    </div>
  );
};

export default Question;