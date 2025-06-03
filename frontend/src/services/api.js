// frontend/src/services/api.js
// import axios from 'axios';

// The REACT_APP_API_URL should be set in your .env file for the frontend
// e.g., REACT_APP_API_URL=http://localhost:5000/api
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Assuming you store the JWT in localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response interceptor (e.g., for handling 401 errors globally)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Example: Handle unauthorized errors, maybe redirect to login
      console.error("Unauthorized, logging out or redirecting...");
      localStorage.removeItem('token');
      // Potentially redirect: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;