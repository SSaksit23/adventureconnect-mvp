// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// frontend/src/services/auth.js
import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// frontend/src/services/trips.js
import api from './api';

export const tripService = {
  // Public endpoints
  getAll: (params) => api.get('/trips', { params }),
  getById: (id) => api.get(`/trips/${id}`),
  search: (query) => api.get('/trips/search', { params: { q: query } }),
  
  // Provider endpoints
  create: (data) => api.post('/trips', data),
  update: (id, data) => api.put(`/trips/${id}`, data),
  delete: (id) => api.delete(`/trips/${id}`),
  getProviderTrips: () => api.get('/provider/trips'),
  
  // Booking endpoints
  createBooking: (data) => api.post('/bookings', data),
  getBookings: () => api.get('/bookings'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id) => api.post(`/bookings/${id}/cancel`),
  
  // Wishlist
  addToWishlist: (tripId) => api.post(`/trips/${tripId}/wishlist`),
  removeFromWishlist: (tripId) => api.delete(`/trips/${tripId}/wishlist`),
  getWishlist: () => api.get('/wishlist'),
  
  // Reviews
  createReview: (tripId, data) => api.post(`/trips/${tripId}/reviews`, data),
  getReviews: (tripId) => api.get(`/trips/${tripId}/reviews`),
};