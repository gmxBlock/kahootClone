import { useState, useEffect, useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { socket } from '../services/socket';

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
  };
};

export default useGame;