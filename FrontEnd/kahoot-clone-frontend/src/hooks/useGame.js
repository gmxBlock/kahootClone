import { useState, useEffect, useContext } from 'react';
import { GameContext } from '../context/GameContext';
import socket from '../services/socket';

const useGame = () => {
  const { gameState, setGameState } = useContext(GameContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleGameUpdate = (updatedGame) => {
      setGameState(updatedGame);
    };

    socket.on('gameUpdate', handleGameUpdate);

    return () => {
      socket.off('gameUpdate', handleGameUpdate);
    };
  }, [setGameState]);

  const startGame = () => {
    socket.emit('startGame');
  };

  const submitAnswer = (answer) => {
    socket.emit('submitAnswer', answer);
  };

  const endGame = () => {
    socket.emit('endGame');
  };

  useEffect(() => {
    if (gameState) {
      setLoading(false);
    }
  }, [gameState]);

  return {
    gameState,
    loading,
    startGame,
    submitAnswer,
    endGame,
    // Properties expected by GamePlay component
    currentQuestion: gameState?.questions?.[gameState?.currentQuestionIndex] || null,
    nextQuestion: () => {
      if (gameState?.questions && gameState?.currentQuestionIndex < gameState.questions.length - 1) {
        setGameState(prev => ({
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1
        }));
      }
    },
    gameOver: gameState?.currentQuestionIndex >= (gameState?.questions?.length - 1) || false,
    score: gameState?.score || 0,
  };
};

export default useGame;