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

// Store user data in localStorage
const setUserData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Clear user data from localStorage
const clearUserData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('rememberMe');
};

// Get stored user data
const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if user chose "Remember Me"
const shouldRememberUser = () => {
  return localStorage.getItem('rememberMe') === 'true';
};

export const registerUser = async (userData) => {
  try {
    console.log('Making registration request to:', `${API_URL}/register`);
    console.log('With data:', { ...userData, password: '***hidden***' });
    
    const response = await axios.post(`${API_URL}/register`, userData);
    
    console.log('Registration response:', response.data);
    
    if (response.data.token && response.data.user) {
      setUserData(response.data.token, response.data.user);
      localStorage.setItem('rememberMe', 'true'); // Auto-remember on registration
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error details:', error);
    
    if (error.response) {
      // Server responded with error status
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      throw error.response.data;
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
      throw { message: 'Server is not responding. Please try again later.' };
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
      throw { message: 'Registration failed: ' + error.message };
    }
  }
};

export const loginUser = async (credentials, rememberMe = false) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    
    if (response.data.token && response.data.user) {
      setUserData(response.data.token, response.data.user);
      localStorage.setItem('rememberMe', rememberMe.toString());
    }
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Login failed' };
  }
};

export const logoutUser = async () => {
  try {
    const shouldClearData = !shouldRememberUser();
    
    // Always clear sensitive data
    clearUserData();
    
    // Optionally call logout endpoint
    await axios.post(`${API_URL}/logout`);
  } catch (error) {
    // Even if logout request fails, clear local data
    clearUserData();
    throw error.response ? error.response.data : { message: 'Logout failed' };
  }
};

export const getUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    // First try to get from localStorage
    const storedUser = getStoredUser();
    if (storedUser) {
      // Verify token is still valid by making a request
      try {
        const response = await axios.get(`${API_URL}/me`);
        // Update stored user data if successful
        setUserData(token, response.data.user);
        return response.data.user;
      } catch (error) {
        // Token might be expired, clear data
        clearUserData();
        return null;
      }
    }

    return null;
  } catch (error) {
    clearUserData();
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = getStoredUser();
  return !!(token && user);
};

// Get stored token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Legacy support - keeping old function names
export const register = registerUser;
export const login = loginUser;
export const logout = logoutUser;