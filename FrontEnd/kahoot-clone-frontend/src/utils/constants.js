// Environment-based configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Use HTTPS for all connections
export const API_BASE_URL = isDevelopment 
  ? '/api' // Use proxy in development
  : process.env.REACT_APP_API_BASE_URL || 'https://165.22.18.156:3000/api';

export const SOCKET_URL = isDevelopment
  ? window.location.origin // Use same origin in development
  : process.env.REACT_APP_SOCKET_URL || 'https://165.22.18.156:3000';

// Debug logging
console.log('🔧 Constants Configuration:', {
  isDevelopment,
  isLocalhost,
  NODE_ENV: process.env.NODE_ENV,
  hostname: window.location.hostname,
  origin: window.location.origin,
  protocol: window.location.protocol,
  API_BASE_URL,
  SOCKET_URL,
  env_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
  env_SOCKET_URL: process.env.REACT_APP_SOCKET_URL
});

// Warn if HTTP is being used (we now prefer HTTPS)
if (isDevelopment && window.location.protocol === 'http:') {
  console.warn('⚠️ HTTP detected. For production, HTTPS is recommended.');
} else if (window.location.protocol === 'https:') {
  console.log('✅ HTTPS connection detected - secure connection established.');
}

export const QUIZ_ENDPOINT = `${API_BASE_URL}/quiz`;
export const AUTH_ENDPOINT = `${API_BASE_URL}/auth`;
export const USER_ENDPOINT = `${API_BASE_URL}/user`;
export const GAME_ENDPOINT = `${API_BASE_URL}/game`;

export const MAX_QUIZ_QUESTIONS = 10;
export const MAX_QUIZ_TITLE_LENGTH = 100;