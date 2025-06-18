import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Use the configured API base URL from environment variables
const API_URL = API_BASE_URL;

console.log('🌐 API Service initialized with URL:', API_URL);

// Create axios instance with default config
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for debugging and auth
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasAuth: !!token,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Helper function to handle authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('API: Getting auth headers, token exists:', !!token);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Quiz API functions
export const fetchQuizzes = async () => {
  const response = await apiClient.get(`${API_URL}/quiz`);
  return response.data;
};

export const fetchQuizById = async (quizId) => {
  const response = await apiClient.get(`${API_URL}/quiz/${quizId}`);
  return response.data;
};

export const createQuiz = async (quizData) => {
  const response = await apiClient.post(`${API_URL}/quiz`, quizData);
  return response.data;
};

export const updateQuiz = async (quizId, quizData) => {
  const response = await apiClient.put(`${API_URL}/quiz/${quizId}`, quizData);
  return response.data;
};

export const deleteQuiz = async (quizId) => {
  const response = await apiClient.delete(`${API_URL}/quiz/${quizId}`);
  return response.data;
};

export const fetchMyQuizzes = async (page = 1, limit = 10) => {
  const response = await apiClient.get(`${API_URL}/quiz/my-quizzes`, {
    params: { page, limit }
  });
  return response.data;
};

// Profile API functions
export const getUserProfile = async () => {
  const response = await apiClient.get(`${API_URL}/user/profile`);
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await apiClient.put(`${API_URL}/user/profile`, profileData);
  return response.data;
};

export const getUserDashboard = async () => {
  console.log('API: Fetching user dashboard from:', `${API_URL}/user/dashboard`);
  const response = await apiClient.get(`${API_URL}/user/dashboard`);
  console.log('API: Dashboard response received:', response.data);
  return response.data;
};

export const getUserGameHistory = async (page = 1, limit = 10, role = 'all') => {
  const response = await apiClient.get(`${API_URL}/user/games`, {
    params: { page, limit, role }
  });
  return response.data;
};

export const getUserStats = async () => {
  const response = await apiClient.get(`${API_URL}/user/stats`);
  return response.data;
};

// Game API functions
export const createGame = async (quizId) => {
  const response = await apiClient.post(`${API_URL}/game/create`, { quizId });
  return response.data;
};

export const joinGame = async (gamePin, username) => {
  const response = await apiClient.post(`${API_URL}/game/join`, { gamePin, username });
  return response.data;
};

export const getGameStatus = async (gamePin) => {
  const response = await apiClient.get(`${API_URL}/game/${gamePin}/status`);
  return response.data;
};

export const getGameDetails = async (gamePin) => {
  const response = await apiClient.get(`${API_URL}/game/${gamePin}`);
  return response.data;
};

export const getGameForHost = async (gamePin) => {
  const response = await apiClient.get(`${API_URL}/game/${gamePin}/host`);
  return response.data;
};

export const updateGameSettings = async (gamePin, settings) => {
  const response = await apiClient.put(`${API_URL}/game/${gamePin}/settings`, settings);
  return response.data;
};

export const endGame = async (gamePin) => {
  const response = await apiClient.delete(`${API_URL}/game/${gamePin}`);
  return response.data;
};

export const getGameResults = async (gamePin) => {
  const response = await apiClient.get(`${API_URL}/game/${gamePin}/results`);
  return response.data;
};