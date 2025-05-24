export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';

export const QUIZ_ENDPOINT = `${API_BASE_URL}/quiz`;
export const AUTH_ENDPOINT = `${API_BASE_URL}/auth`;
export const USER_ENDPOINT = `${API_BASE_URL}/user`;
export const GAME_ENDPOINT = `${API_BASE_URL}/game`;

export const MAX_QUIZ_QUESTIONS = 10;
export const MAX_QUIZ_TITLE_LENGTH = 100;