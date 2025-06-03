// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', auth.required, authController.getMe);
router.put('/profile', auth.required, authController.updateProfile);
router.put('/password', auth.required, authController.changePassword);

module.exports = router;

// backend/src/routes/trips.js
const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', tripController.getAllTrips);
router.get('/search', tripController.searchTrips);
router.get('/:id', tripController.getTripById);

// Provider routes
router.post('/', auth.requireProvider, upload.array('images', 10), tripController.createTrip);
router.put('/:id', auth.requireProvider, upload.array('images', 10), tripController.updateTrip);
router.delete('/:id', auth.requireProvider, tripController.deleteTrip);

// Wishlist routes (authenticated users)
router.post('/:id/wishlist', auth.required, tripController.addToWishlist);
router.delete('/:id/wishlist', auth.required, tripController.removeFromWishlist);

// Review routes
router.get('/:id/reviews', tripController.getReviews);
router.post('/:id/reviews', auth.required, tripController.createReview);

module.exports = router;

// backend/src/routes/bookings.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');

// All booking routes require authentication
router.use(auth.required);

// Traveler routes
router.post('/', bookingController.createBooking);
router.get('/', bookingController.getUserBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/:id/cancel', bookingController.cancelBooking);

module.exports = router;

// backend/src/routes/providers.js
const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const auth = require('../middleware/auth');

// Public routes
router.get('/:id', providerController.getProviderProfile);
router.get('/:id/trips', providerController.getProviderTrips);

// Provider-only routes
router.use(auth.requireProvider);
router.get('/stats', providerController.getProviderStats);
router.get('/trips', providerController.getOwnTrips);
router.get('/bookings', providerController.getProviderBookings);
router.put('/profile', providerController.updateProviderProfile);

module.exports = router;