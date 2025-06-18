// Environment-based configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Use proxy in development to avoid CORS and mixed content issues
export const API_BASE_URL = isDevelopment 
  ? '/api' // Use proxy in development
  : process.env.REACT_APP_API_BASE_URL || 'https://165.22.18.156:3000/api';

export const SOCKET_URL = isDevelopment
  ? window.location.origin // Use same origin in development
  : process.env.REACT_APP_SOCKET_URL || 'https://165.22.18.156:3000';

export const QUIZ_ENDPOINT = `${API_BASE_URL}/quiz`;
export const AUTH_ENDPOINT = `${API_BASE_URL}/auth`;
export const USER_ENDPOINT = `${API_BASE_URL}/user`;
export const GAME_ENDPOINT = `${API_BASE_URL}/game`;

export const MAX_QUIZ_QUESTIONS = 10;
export const MAX_QUIZ_TITLE_LENGTH = 100;