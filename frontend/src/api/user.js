// api/user.js
import apiClient from './client';
import { jwtDecode } from 'jwt-decode'; // Updated import statement

// Get the current user ID from JWT token
export const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    
    // Decode the JWT token to get the user ID
    const decoded = jwtDecode(token);
    return decoded.sub || decoded.user_id || decoded.id;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
};

// Get the current user profile
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/users/me');
    return response.data;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Sign in with email and password
export const signIn = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

// Sign up with email and password
export const signUp = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/register', { email, password });
    return response.data;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

// Sign out
export const signOut = () => {
  localStorage.removeItem('token');
  return true;
};