import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/auth';

// Set up axios interceptor to include auth token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Registration failed' };
  }
};

export const login = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Login failed' };
  }
};

export const logout = async () => {
  try {
    localStorage.removeItem('token');
    await axios.post(`${API_URL}/logout`);
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Logout failed' };
  }
};

export const getUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    const response = await axios.get(`${API_URL}/me`);
    return response.data.user;
  } catch (error) {
    localStorage.removeItem('token');
    return null;
  }
};

// Export with alternative names for compatibility
export const registerUser = register;
export const loginUser = login;
export const logoutUser = logout;