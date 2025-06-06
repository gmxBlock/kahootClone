import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Use the configured API base URL from environment variables
const API_URL = API_BASE_URL;

// Helper function to handle authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Quiz API functions
export const fetchQuizzes = async () => {
  const response = await axios.get(`${API_URL}/quiz`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const fetchQuizById = async (quizId) => {
  const response = await axios.get(`${API_URL}/quiz/${quizId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const createQuiz = async (quizData) => {
  const response = await axios.post(`${API_URL}/quiz`, quizData, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const updateQuiz = async (quizId, quizData) => {
  const response = await axios.put(`${API_URL}/quiz/${quizId}`, quizData, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const deleteQuiz = async (quizId) => {
  const response = await axios.delete(`${API_URL}/quiz/${quizId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const fetchMyQuizzes = async (page = 1, limit = 10) => {
  const response = await axios.get(`${API_URL}/quiz/my-quizzes`, {
    params: { page, limit },
    headers: getAuthHeaders()
  });
  return response.data;
};

// Profile API functions
export const getUserProfile = async () => {
  const response = await axios.get(`${API_URL}/user/profile`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await axios.put(`${API_URL}/user/profile`, profileData, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const getUserDashboard = async () => {
  const response = await axios.get(`${API_URL}/user/dashboard`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const getUserGameHistory = async (page = 1, limit = 10, role = 'all') => {
  const response = await axios.get(`${API_URL}/user/games`, {
    params: { page, limit, role },
    headers: getAuthHeaders()
  });
  return response.data;
};

export const getUserStats = async () => {
  const response = await axios.get(`${API_URL}/user/stats`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Game API functions
export const createGame = async (quizId) => {
  const response = await axios.post(`${API_URL}/game/create`, { quizId }, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const joinGame = async (gamePin, username) => {
  const response = await axios.post(`${API_URL}/game/join`, { gamePin, username }, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const getGameStatus = async (gamePin) => {
  const response = await axios.get(`${API_URL}/game/${gamePin}/status`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const getGameDetails = async (gamePin) => {
  const response = await axios.get(`${API_URL}/game/${gamePin}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const getGameForHost = async (gamePin) => {
  const response = await axios.get(`${API_URL}/game/${gamePin}/host`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const updateGameSettings = async (gamePin, settings) => {
  const response = await axios.put(`${API_URL}/game/${gamePin}/settings`, settings, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const endGame = async (gamePin) => {
  const response = await axios.delete(`${API_URL}/game/${gamePin}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const getGameResults = async (gamePin) => {
  const response = await axios.get(`${API_URL}/game/${gamePin}/results`, {
    headers: getAuthHeaders()
  });
  return response.data;
};