import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../../context/GameContext';
import useGame from '../../hooks/useGame';
import Question from './Question';
import Leaderboard from './Leaderboard';
import Results from './Results';
import './GamePlay.css';

const GamePlay = ({ gameId }) => {
  const navigate = useNavigate();
  const { gameState } = useContext(GameContext);
  const { 
    loading, 
    advanceToNextQuestion, 
    showQuestionResults, 
    submitPlayerAnswer,
    currentQuestion,
    gameOver,
    score,
    leaderboard,
    results
  } = useGame(gameId);

  const [currentView, setCurrentView] = useState('question'); // 'question', 'results', 'leaderboard', 'final-results'
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timer, setTimer] = useState(null);

  // Handle question timing
  useEffect(() => {
    if (currentQuestion && gameState.status === 'active') {
      const questionTimeLimit = currentQuestion.timeLimit || 30;
      setTimeRemaining(questionTimeLimit);
      setHasAnswered(false);
      setCurrentView('question');

      // Start countdown timer
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setTimer(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [currentQuestion, gameState.status]);

  // Handle game state changes
  useEffect(() => {
    if (gameState.status === 'finished') {
      setCurrentView('final-results');
    }
  }, [gameState.status]);

  // Handle question results
  useEffect(() => {
    if (gameState.questionStats && currentView !== 'final-results') {
      setCurrentView('results');
    }
  }, [gameState.questionStats, currentView]);

  // Handle answer submission
  const handleAnswerSelect = useCallback((optionIndex) => {
    if (hasAnswered || timeRemaining <= 0 || gameState.isHost) return;

    const timeToAnswer = (currentQuestion.timeLimit || 30) - timeRemaining;
    submitPlayerAnswer(optionIndex, timeToAnswer * 1000); // Convert to milliseconds
    setHasAnswered(true);
  }, [hasAnswered, timeRemaining, gameState.isHost, currentQuestion, submitPlayerAnswer]);

  // Host controls
  const handleNextQuestion = useCallback(() => {
    if (!gameState.isHost) return;
    advanceToNextQuestion();
    setCurrentView('question');
  }, [gameState.isHost, advanceToNextQuestion]);

  const handleShowResults = useCallback(() => {
    if (!gameState.isHost) return;
    showQuestionResults();
  }, [gameState.isHost, showQuestionResults]);

  const handleEndGame = useCallback(() => {
    // Navigate back to my quizzes
    navigate('/my-quizzes');
  }, [navigate]);

  if (loading) {
    return (
      <div className="game-play loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  const renderGameStatus = () => (
    <div className="game-status">
      <div className="game-info">
        <span className="game-pin">PIN: {gameState.gamePin}</span>
        <span className="question-progress">
          Question {(gameState.currentQuestionIndex || 0) + 1} of {gameState.totalQuestions || 0}
        </span>
        {!gameState.isHost && (
          <span className="player-score">Score: {score}</span>
        )}
      </div>
      {gameState.status === 'paused' && (
        <div className="game-paused">
          <h3>⏸️ Game Paused</h3>
          <p>Please wait for the host to resume the game</p>
        </div>
      )}
    </div>
  );

  const renderHostControls = () => {
    if (!gameState.isHost) return null;

    return (
      <div className="host-controls">
        {currentView === 'question' && (
          <button 
            className="btn btn-primary"
            onClick={handleShowResults}
            disabled={timeRemaining > 0}
          >
            Show Results
          </button>
        )}
        {currentView === 'results' && (
          <button 
            className="btn btn-primary"
            onClick={handleNextQuestion}
          >
            {gameState.currentQuestionIndex + 1 >= gameState.totalQuestions ? 'Show Final Results' : 'Next Question'}
          </button>
        )}
        {currentView === 'final-results' && (
          <button 
            className="btn btn-secondary"
            onClick={handleEndGame}
          >
            End Game
          </button>
        )}
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'question':
        if (!currentQuestion) {
          return (
            <div className="no-question">
              <h3>Waiting for question...</h3>
            </div>
          );
        }
        return (
          <Question 
            question={currentQuestion}
            timeRemaining={timeRemaining}
            hasAnswered={hasAnswered}
            isHost={gameState.isHost}
            onAnswerSelect={handleAnswerSelect}
            gamePin={gameState.gamePin}
          />
        );
      
      case 'results':
        return (
          <div className="question-results-view">
            {gameState.questionStats && (
              <div className="question-results">
                <h3>Question Results</h3>
                <div className="correct-answer">
                  <p>Correct Answer: Option {gameState.questionStats.correctOptionIndex + 1}</p>
                </div>
                <div className="answer-stats">
                  {gameState.questionStats.optionStats?.map((option, index) => (
                    <div 
                      key={index} 
                      className={`option-stat ${option.isCorrect ? 'correct' : ''}`}
                    >
                      <span className="option-text">{option.text}</span>
                      <span className="option-count">{option.count} players</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Leaderboard players={leaderboard} />
          </div>
        );
      
      case 'final-results':
        return (
          <Results 
            results={results}
            gamePin={gameState.gamePin}
            isHost={gameState.isHost}
            onEndGame={handleEndGame}
          />
        );
      
      default:
        return <div>Loading...</div>;
    }
  };

  return (
    <div className="game-play">
      {renderGameStatus()}
      <div className="game-content">
        {renderCurrentView()}
      </div>
      {renderHostControls()}
    </div>
  );
};

export default GamePlay;