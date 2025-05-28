import React, { createContext, useState, useContext, useCallback } from 'react';
import { connectSocket, disconnectSocket, onEvent, offEvent } from '../services/socket';

export const GameContext = createContext();

const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({
    gamePin: null,
    players: [],
    quiz: null,
    currentQuestion: null,
    currentQuestionIndex: -1,
    totalQuestions: 0,
    score: 0,
    status: 'waiting', // waiting, active, paused, finished
    isHost: false,
    timeRemaining: 0,
    leaderboard: [],
    results: null,
    playerNickname: null,
    questionData: null,
    questionStats: null,
    isConnected: false
  });

  const updateGameState = useCallback((updates) => {
    setGameState(prevState => ({
      ...prevState,
      ...updates
    }));
  }, []);

  const resetGameState = useCallback(() => {
    setGameState({
      gamePin: null,
      players: [],
      quiz: null,
      currentQuestion: null,
      currentQuestionIndex: -1,
      totalQuestions: 0,
      score: 0,
      status: 'waiting',
      isHost: false,
      timeRemaining: 0,
      leaderboard: [],
      results: null,
      playerNickname: null,
      questionData: null,
      questionStats: null,
      isConnected: false
    });
  }, []);

  // Initialize game session
  const initializeGame = useCallback((gamePin, isHost, playerNickname = null) => {
    updateGameState({
      gamePin,
      isHost,
      playerNickname,
      isConnected: true
    });
  }, [updateGameState]);

  // Update current question
  const updateCurrentQuestion = useCallback((questionData, questionIndex) => {
    updateGameState({
      currentQuestion: questionData,
      currentQuestionIndex: questionIndex,
      questionData,
      timeRemaining: questionData.timeLimit || 30
    });
  }, [updateGameState]);

  // Update leaderboard
  const updateLeaderboard = useCallback((leaderboard) => {
    updateGameState({ leaderboard });
  }, [updateGameState]);

  // Update question results
  const updateQuestionResults = useCallback((results) => {
    updateGameState({ questionStats: results });
  }, [updateGameState]);

  // Update final results
  const updateFinalResults = useCallback((results) => {
    updateGameState({ 
      results,
      status: 'finished'
    });
  }, [updateGameState]);

  // Connect to socket and set up listeners
  const connectToGame = useCallback(() => {
    connectSocket();
    updateGameState({ isConnected: true });
  }, [updateGameState]);

  // Disconnect from socket
  const disconnectFromGame = useCallback(() => {
    disconnectSocket();
    updateGameState({ isConnected: false });
  }, [updateGameState]);

  const value = {
    gameState,
    setGameState,
    updateGameState,
    resetGameState,
    initializeGame,
    updateCurrentQuestion,
    updateLeaderboard,
    updateQuestionResults,
    updateFinalResults,
    connectToGame,
    disconnectFromGame
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;