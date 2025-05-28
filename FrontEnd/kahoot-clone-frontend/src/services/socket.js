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

// Add connection event listeners for debugging
socket.on('connect', () => {
  console.log('✅ Socket connected successfully!', {
    socketId: socket.id,
    url: SOCKET_URL || 'http://localhost:3000'
  });
});

socket.on('disconnect', (reason) => {
  console.log('❌ Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('🚨 Socket connection error:', {
    message: error.message,
    description: error.description,
    context: error.context,
    type: error.type,
    url: SOCKET_URL || 'http://localhost:3000'
  });
  
  // Provide helpful error messages
  if (error.message.includes('xhr poll error') || error.message.includes('websocket error')) {
    console.error('💡 Suggestion: Check if your server is running and accessible at:', SOCKET_URL || 'http://localhost:3000');
  }
});

// Connection management
export const connectSocket = () => {
  console.log('🔌 Attempting to connect socket...', {
    currentState: socket.connected,
    socketId: socket.id,
    url: SOCKET_URL || 'http://localhost:3000'
  });

  if (!socket.connected) {
    socket.connect();
    console.log('🔄 Socket connection initiated');
  } else {
    console.log('✅ Socket already connected');
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
  console.log(`📡 Attempting to emit event: ${event}`, {
    data,
    socketConnected: socket.connected,
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });

  if (socket.connected) {
    socket.emit(event, data);
    console.log(`✅ Event emitted successfully: ${event}`);
    return true;
  } else {
    console.warn(`⚠️ Socket not connected, cannot emit: ${event}`, {
      socketState: socket.connected,
      socketId: socket.id,
      event,
      data
    });
    return false;
  }
};

// Game hosting specific functions
export const joinAsHost = (gamePin, userId) => {
  console.log('👑 Joining as host:', { gamePin, userId });
  const result = emitEvent('join-as-host', { gamePin, userId });
  console.log('Join as host result:', result);
  return result;
};

export const startGame = (gamePin) => {
  console.log('🚀 Starting game:', { gamePin });
  const result = emitEvent('start-game', { gamePin });
  console.log('Start game emission result:', result);
  return result;
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