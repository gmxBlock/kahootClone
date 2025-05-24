import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const GameContext = createContext();

const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({
    players: [],
    questions: [],
    currentQuestionIndex: 0,
    score: {},
  });

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('gameUpdate', (data) => {
      setGameState((prevState) => ({
        ...prevState,
        ...data,
      }));
    });

    return () => newSocket.close();
  }, [setSocket]);

  const startGame = (questions) => {
    setGameState({
      players: [],
      questions,
      currentQuestionIndex: 0,
      score: {},
    });
    socket.emit('startGame', questions);
  };

  const answerQuestion = (answer) => {
    socket.emit('answerQuestion', answer);
  };

  return (
    <GameContext.Provider value={{ gameState, setGameState, startGame, answerQuestion }}>
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;