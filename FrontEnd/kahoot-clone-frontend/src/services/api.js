import axios from 'axios';

// Use relative URLs since we have setupProxy.js configured
const API_URL = '/api';

export const fetchQuizzes = async () => {
  const response = await axios.get(`${API_URL}/quiz`);
  return response.data;
};

export const fetchQuizById = async (quizId) => {
  const response = await axios.get(`${API_URL}/quiz/${quizId}`);
  return response.data;
};

export const createQuiz = async (quizData) => {
  const response = await axios.post(`${API_URL}/quiz`, quizData);
  return response.data;
};

export const updateQuiz = async (quizId, quizData) => {
  const response = await axios.put(`${API_URL}/quiz/${quizId}`, quizData);
  return response.data;
};

export const deleteQuiz = async (quizId) => {
  const response = await axios.delete(`${API_URL}/quiz/${quizId}`);
  return response.data;
};

export const getUserProfile = async (userId) => {
  const response = await axios.get(`${API_URL}/user/profile`);
  return response.data;
};