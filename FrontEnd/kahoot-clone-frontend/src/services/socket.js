import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';

// Create socket connection
const socket = io(SOCKET_URL || 'http://localhost:3000', {
  transports: ['websocket', 'polling'],
  autoConnect: true, // Enable auto-connection
  reconnection: true,
  reconnectionDelay: 2000, // Increase delay to avoid rate limiting
  reconnectionAttempts: 3, // Reduce attempts to avoid rate limiting
  timeout: 15000, // Increase timeout
  forceNew: false
});

// Add connection event listeners for debugging
socket.on('connect', () => {
  console.log('✅ Socket connected successfully!', {
    socketId: socket.id,
    url: SOCKET_URL || 'http://localhost:3000'
  });
  connectionAttempts = 0; // Reset connection attempts on successful connection
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
    url: SOCKET_URL || 'http://localhost:3000',
    attempts: connectionAttempts
  });
  
  // Provide helpful error messages
  if (error.message.includes('xhr poll error') || error.message.includes('websocket error')) {
    console.error('💡 Suggestion: Check if your server is running and accessible at:', SOCKET_URL || 'http://localhost:3000');
  }
  
  // Handle specific error types that might indicate rate limiting
  if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
    console.error('⚠️ Rate limiting detected. Increasing delay between connection attempts.');
    connectionAttempts = maxConnectionAttempts; // Stop further attempts
  }
});

// Connection management with better error handling
let connectionAttempts = 0;
const maxConnectionAttempts = 3;
let lastConnectionAttempt = 0;
const minTimeBetweenAttempts = 5000; // 5 seconds

export const connectSocket = () => {
  const now = Date.now();
  
  console.log('🔌 Attempting to connect socket...', {
    currentState: socket.connected,
    socketId: socket.id,
    url: SOCKET_URL || 'http://localhost:3000',
    attempts: connectionAttempts,
    timeSinceLastAttempt: now - lastConnectionAttempt
  });

  // Prevent rapid reconnection attempts that trigger rate limiting
  if (connectionAttempts >= maxConnectionAttempts) {
    console.warn('⚠️ Maximum connection attempts reached. Please check server connectivity.');
    return socket;
  }

  if (now - lastConnectionAttempt < minTimeBetweenAttempts) {
    console.warn('⚠️ Waiting before next connection attempt to avoid rate limiting...');
    return socket;
  }

  if (!socket.connected) {
    lastConnectionAttempt = now;
    connectionAttempts++;
    socket.connect();
    console.log('🔄 Socket connection initiated (attempt', connectionAttempts, ')');
  } else {
    console.log('✅ Socket already connected');
    connectionAttempts = 0; // Reset on successful connection
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
    
    // Attempt to reconnect if we haven't hit the limit
    if (connectionAttempts < maxConnectionAttempts) {
      console.log('🔄 Attempting to reconnect socket before emitting...');
      connectSocket();
      
      // Wait a moment and try again
      setTimeout(() => {
        if (socket.connected) {
          console.log(`🔄 Retrying emit after reconnection: ${event}`);
          socket.emit(event, data);
        } else {
          console.error(`❌ Still not connected after reconnection attempt for: ${event}`);
        }
      }, 1000);
    }
    
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

// Utility functions for debugging and manual control
export const resetConnectionAttempts = () => {
  connectionAttempts = 0;
  lastConnectionAttempt = 0;
  console.log('🔄 Connection attempts reset');
};

export const getConnectionStatus = () => {
  return {
    connected: socket.connected,
    socketId: socket.id,
    attempts: connectionAttempts,
    maxAttempts: maxConnectionAttempts,
    lastAttempt: lastConnectionAttempt,
    url: SOCKET_URL || 'http://localhost:3000'
  };
};

export const forceReconnect = () => {
  console.log('🔌 Force reconnecting socket...');
  resetConnectionAttempts();
  if (socket.connected) {
    socket.disconnect();
  }
  return connectSocket();
};

// Make debugging functions available globally
if (typeof window !== 'undefined') {
  window.socketDebug = {
    status: getConnectionStatus,
    reset: resetConnectionAttempts,
    reconnect: forceReconnect,
    connect: connectSocket,
    disconnect: disconnectSocket
  };
  console.log('💡 Socket debug tools available: window.socketDebug');
}

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