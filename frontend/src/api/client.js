import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://mealprepfinal-h4hjb2bnagcqh4fb.centralus-01.azurewebsites.net/api' || 'http://localhost:8080/api',
    // headers: {
    //     'Content-Type': 'multipart/form-data',
    // },
});

// Add a request interceptor to include the token in the headers`
apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

// Add a response interceptor to handle errors globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

export default apiClient;