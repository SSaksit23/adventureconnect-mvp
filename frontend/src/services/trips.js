import api from './api';

export const tripService = {
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
