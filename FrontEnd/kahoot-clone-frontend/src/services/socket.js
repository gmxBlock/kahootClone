import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';

// Enhanced socket configuration with environment detection
const getSocketConfig = () => {
  const isHTTPS = window.location.protocol === 'https:';
  const baseURL = SOCKET_URL || 'http://localhost:3000';
  
  return {
    url: baseURL,
    options: {
      transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
      upgrade: true, // Allow transport upgrades
      autoConnect: false, // Manual connection control
      reconnection: true,
      reconnectionDelay: 1000, // Start with 1 second
      reconnectionDelayMax: 10000, // Max 10 seconds
      reconnectionAttempts: 5, // Reasonable attempts
      timeout: 20000, // 20 second timeout
      forceNew: false,
      // Mixed content handling
      secure: isHTTPS,
      rejectUnauthorized: false, // For development with self-signed certificates
      // Additional options for robustness
      rememberUpgrade: true,
      pingTimeout: 60000,
      pingInterval: 25000,
      // Authentication support (for JWT tokens)
      auth: null // Will be set dynamically when needed
    }
  };
};

const config = getSocketConfig();
console.log('🔧 Socket configuration:', config);

// Create socket connection with enhanced configuration
const socket = io(config.url, config.options);

// Connection state tracking
let connectionAttempts = 0;
const maxConnectionAttempts = 3;
let lastConnectionAttempt = 0;
const minTimeBetweenAttempts = 5000; // 5 seconds
let lastConnectionError = null;
let connectionState = 'disconnected'; // disconnected, connecting, connected, error
let authToken = null; // For JWT authentication

// Authentication support
export const setAuthToken = (token) => {
  authToken = token;
  if (socket.auth) {
    socket.auth.token = token;
  } else {
    socket.auth = { token };
  }
  console.log('🔐 Auth token set for Socket.IO');
};

export const clearAuthToken = () => {
  authToken = null;
  if (socket.auth) {
    delete socket.auth.token;
  }
  console.log('🔐 Auth token cleared from Socket.IO');
};

// Graceful degradation - HTTP polling fallback
const fallbackToHttp = async (endpoint, data) => {
  try {
    const API_BASE_URL = SOCKET_URL?.replace('ws:', 'http:').replace('wss:', 'https:') || 'http://localhost:3000';
    const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ HTTP fallback failed:', error);
    throw error;
  }
};

// Enhanced connection event listeners with detailed logging
socket.on('connect', () => {
  connectionState = 'connected';
  connectionAttempts = 0;
  lastConnectionError = null;
  
  console.log('✅ Socket connected successfully!', {
    socketId: socket.id,
    url: config.url,
    transport: socket.io.engine.transport.name,
    timestamp: new Date().toISOString(),
    attempts: connectionAttempts,
    hasAuth: !!authToken
  });
  
  // Log transport upgrade
  socket.io.engine.on('upgrade', () => {
    console.log('🔄 Transport upgraded to:', socket.io.engine.transport.name);
  });
});

socket.on('disconnect', (reason) => {
  connectionState = 'disconnected';
  console.log('❌ Socket disconnected:', {
    reason,
    timestamp: new Date().toISOString(),
    wasConnected: socket.connected
  });
});

socket.on('connect_error', (error) => {
  connectionState = 'error';
  connectionAttempts++;
  lastConnectionError = error;
  
  console.error('🚨 Socket connection error:', {
    message: error.message,
    description: error.description,
    context: error.context,
    type: error.type,
    url: config.url,
    attempts: connectionAttempts,
    timestamp: new Date().toISOString(),
    transport: socket.io.engine?.transport?.name || 'unknown'
  });
  
  // Provide helpful error diagnosis
  if (error.message.includes('CORS')) {
    console.error('💡 CORS Error Help: Check if server allows your domain in CORS origins');
  } else if (error.message.includes('timeout')) {
    console.error('💡 Timeout Error Help: Server might be down or unreachable');
  } else if (error.message.includes('refused')) {
    console.error('💡 Connection Refused Help: Check if server is running on the correct port');
  } else if (error.message.includes('Mixed Content')) {
    console.error('💡 Mixed Content Help: Use HTTPS for both client and server');
  } else if (error.message.includes('Authentication')) {
    console.error('💡 Auth Error Help: Check if authentication token is valid');
  }
  
  if (error.message.includes('xhr poll error') || error.message.includes('websocket error')) {
    console.error('💡 Suggestion: Check if your server is running and accessible at:', SOCKET_URL || 'http://localhost:3000');
  }
  
  // Handle specific error types that might indicate rate limiting
  if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
    console.error('⚠️ Rate limiting detected. Increasing delay between connection attempts.');
    connectionAttempts = maxConnectionAttempts; // Stop further attempts
  }
});

// Error event handler
socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

// Connection management with better error handling
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

// Enhanced emit with fallback support
export const emitEvent = async (event, data, useHttpFallback = false) => {
  console.log(`📡 Attempting to emit event: ${event}`, {
    data,
    socketConnected: socket.connected,
    socketId: socket.id,
    timestamp: new Date().toISOString(),
    fallbackEnabled: useHttpFallback
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
    
    // Try HTTP fallback if enabled
    if (useHttpFallback) {
      try {
        console.log(`🔄 Attempting HTTP fallback for: ${event}`);
        const result = await fallbackToHttp(event, data);
        console.log(`✅ HTTP fallback successful for: ${event}`, result);
        return result;
      } catch (error) {
        console.error(`❌ HTTP fallback failed for: ${event}`, error);
      }
    }
    
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

// Game hosting specific functions with fallback support
export const joinAsHost = async (gamePin, userId, useHttpFallback = true) => {
  console.log('👑 Joining as host:', { gamePin, userId });
  const result = await emitEvent('join-as-host', { gamePin, userId }, useHttpFallback);
  console.log('Join as host result:', result);
  return result;
};

export const startGame = async (gamePin, useHttpFallback = true) => {
  console.log('🚀 Starting game:', { gamePin });
  const result = await emitEvent('start-game', { gamePin }, useHttpFallback);
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

export const getConnectionState = () => {
  return connectionState;
};

export const getLastConnectionError = () => {
  return lastConnectionError;
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
    url: SOCKET_URL || 'http://localhost:3000',
    state: connectionState,
    lastError: lastConnectionError,
    hasAuth: !!authToken
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

// Environment-specific configuration
export const configureForEnvironment = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isProduction) {
    console.log('🏭 Production environment detected');
    // Production settings - more conservative
    socket.io.opts.reconnectionAttempts = 3;
    socket.io.opts.timeout = 30000;
  } else if (isDevelopment) {
    console.log('🔧 Development environment detected');
    // Development settings - more aggressive for debugging
    socket.io.opts.reconnectionAttempts = 10;
    socket.io.opts.timeout = 10000;
  }
  
  console.log('⚙️ Environment configuration applied:', {
    env: process.env.NODE_ENV,
    reconnectionAttempts: socket.io.opts.reconnectionAttempts,
    timeout: socket.io.opts.timeout
  });
};

// Initialize environment configuration
configureForEnvironment();

// Make debugging functions available globally
if (typeof window !== 'undefined') {
  window.socketDebug = {
    status: getConnectionStatus,
    reset: resetConnectionAttempts,
    reconnect: forceReconnect,
    connect: connectSocket,
    disconnect: disconnectSocket,
    setAuth: setAuthToken,
    clearAuth: clearAuthToken,
    configure: configureForEnvironment
  };
  console.log('💡 Socket debug tools available: window.socketDebug');
}

export default socket;