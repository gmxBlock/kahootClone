import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';

// Create socket connection
const socket = io(SOCKET_URL || 'http://localhost:3000', {
  transports: ['websocket', 'polling'],
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 10000,
});

// Connection management
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// Event management
export const onEvent = (event, callback) => {
  socket.on(event, callback);
};

export const offEvent = (event, callback) => {
  if (callback) {
    socket.off(event, callback);
  } else {
    socket.off(event);
  }
};

export const emitEvent = (event, data) => {
  if (socket.connected) {
    socket.emit(event, data);
    return true;
  } else {
    console.warn('⚠️ Socket not connected, cannot emit:', event);
    return false;
  }
};

// Game hosting specific functions
export const joinAsHost = (gamePin, userId) => {
  return emitEvent('join-as-host', { gamePin, userId });
};

export const startGame = (gamePin) => {
  return emitEvent('start-game', { gamePin });
};

export const nextQuestion = (gamePin) => {
  return emitEvent('next-question', { gamePin });
};

export const showResults = (gamePin) => {
  return emitEvent('show-results', { gamePin });
};

export const pauseGame = (gamePin) => {
  return emitEvent('pause-game', { gamePin });
};

export const resumeGame = (gamePin) => {
  return emitEvent('resume-game', { gamePin });
};

export const endGame = (gamePin) => {
  return emitEvent('end-game', { gamePin });
};

// Player specific functions
export const joinAsPlayer = (gamePin, nickname, userId = null) => {
  return emitEvent('join-game', { gamePin, nickname, userId });
};

export const submitAnswer = (gamePin, questionIndex, selectedOption, timeToAnswer) => {
  return emitEvent('submit-answer', { 
    gamePin, 
    questionIndex, 
    selectedOption, 
    timeToAnswer 
  });
};

// Utility functions
export const isConnected = () => {
  return socket.connected;
};

export const getSocketId = () => {
  return socket.id;
};

// Socket event listeners setup
socket.on('connect', () => {
  console.log('🔌 Connected to socket server');
});

socket.on('disconnect', () => {
  console.log('🔌 Disconnected from socket server');
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error);
});

export default socket;