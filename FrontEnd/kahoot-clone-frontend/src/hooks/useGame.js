import { useState, useEffect, useContext, useCallback } from 'react';
import { GameContext } from '../context/GameContext';
import { submitAnswer, nextQuestion, showResults } from '../services/socket';

const useGame = (gamePin) => {
  const { 
    gameState, 
    updateGameState, 
    updateCurrentQuestion,
    updateLeaderboard,
    updateQuestionResults,
    updateFinalResults
  } = useContext(GameContext);
  const [loading, setLoading] = useState(true);

  // Set up socket listeners for game events
  useEffect(() => {
    if (!gamePin) return;

    const { onEvent, offEvent } = require('../services/socket');

    // Game started - first question
    const handleGameStarted = (data) => {
      console.log('Game started:', data);
      updateGameState({ 
        status: 'active',
        totalQuestions: data.totalQuestions 
      });
      
      if (data.questionData) {
        updateCurrentQuestion(data.questionData, data.questionData.questionIndex);
      }
    };

    // Next question received
    const handleNextQuestion = (data) => {
      console.log('Next question:', data);
      if (data.questionData) {
        updateCurrentQuestion(data.questionData, data.questionData.questionIndex);
      }
    };

    // Question timeout
    const handleQuestionTimeout = (data) => {
      console.log('Question timeout:', data);
      updateGameState({ timeRemaining: 0 });
    };

    // Answer submitted confirmation
    const handleAnswerSubmitted = (data) => {
      console.log('Answer submitted:', data);
      updateGameState({ 
        score: data.currentScore 
      });
    };

    // Question results
    const handleQuestionResults = (data) => {
      console.log('Question results:', data);
      updateQuestionResults(data);
      if (data.leaderboard) {
        updateLeaderboard(data.leaderboard);
      }
    };

    // Game ended
    const handleGameEnded = (data) => {
      console.log('Game ended:', data);
      updateFinalResults(data);
    };

    // Game paused/resumed
    const handleGamePaused = () => {
      updateGameState({ status: 'paused' });
    };

    const handleGameResumed = () => {
      updateGameState({ status: 'active' });
    };

    // Set up event listeners
    onEvent('game-started', handleGameStarted);
    onEvent('next-question', handleNextQuestion);
    onEvent('question-timeout', handleQuestionTimeout);
    onEvent('answer-submitted', handleAnswerSubmitted);
    onEvent('question-results', handleQuestionResults);
    onEvent('game-ended', handleGameEnded);
    onEvent('game-paused', handleGamePaused);
    onEvent('game-resumed', handleGameResumed);

    // Cleanup
    return () => {
      offEvent('game-started', handleGameStarted);
      offEvent('next-question', handleNextQuestion);
      offEvent('question-timeout', handleQuestionTimeout);
      offEvent('answer-submitted', handleAnswerSubmitted);
      offEvent('question-results', handleQuestionResults);
      offEvent('game-ended', handleGameEnded);
      offEvent('game-paused', handleGamePaused);
      offEvent('game-resumed', handleGameResumed);
    };
  }, [gamePin, updateGameState, updateCurrentQuestion, updateLeaderboard, updateQuestionResults, updateFinalResults]);

  useEffect(() => {
    if (gameState.gamePin) {
      setLoading(false);
    }
  }, [gameState.gamePin]);

  // Host functions
  const advanceToNextQuestion = useCallback(() => {
    if (gameState.isHost && gamePin) {
      nextQuestion(gamePin);
    }
  }, [gameState.isHost, gamePin]);

  const showQuestionResults = useCallback(() => {
    if (gameState.isHost && gamePin && gameState.currentQuestionIndex >= 0) {
      showResults(gamePin, gameState.currentQuestionIndex);
    }
  }, [gameState.isHost, gamePin, gameState.currentQuestionIndex]);

  // Player functions
  const submitPlayerAnswer = useCallback((selectedOption, timeToAnswer) => {
    if (!gameState.isHost && gamePin && gameState.currentQuestionIndex >= 0) {
      submitAnswer(gamePin, gameState.currentQuestionIndex, selectedOption, timeToAnswer);
    }
  }, [gameState.isHost, gamePin, gameState.currentQuestionIndex]);

  return {
    gameState,
    loading,
    // Host functions
    advanceToNextQuestion,
    showQuestionResults,
    // Player functions
    submitPlayerAnswer,
    // Computed properties for backward compatibility
    currentQuestion: gameState.questionData,
    nextQuestion: advanceToNextQuestion,
    gameOver: gameState.status === 'finished',
    score: gameState.score,
    leaderboard: gameState.leaderboard,
    results: gameState.results
  };
};

export default useGame;