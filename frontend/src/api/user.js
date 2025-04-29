// api/user.js
import apiClient from './client';

export const getCurrentUserId = () => {
  return localStorage.getItem('userId');
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    
    // Save auth data in localStorage
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    
    if (response.data.user && response.data.user.id) {
      localStorage.setItem('userId', response.data.user.id);
    }
    
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logout = () => {
  // Clear auth data from localStorage
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  
  // You can also make a logout API call if your backend requires it
  // return apiClient.post('/auth/logout');
};

export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/user/profile');
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};