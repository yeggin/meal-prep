// api/client.js
import axios from 'axios';

const API_URL = 'https://mealprepfinal-h4hjb2bnagcqh4fb.centralus-01.azurewebsites.net/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token in every request
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If token exists, add it to request headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
    
    // Log detailed error information for debugging
    if (error.response && error.response.data) {
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;