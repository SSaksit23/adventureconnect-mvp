#!/bin/bash
# fix-imports.sh - Fixes common import issues and splits combined files

echo "🔧 Fixing imports and splitting combined files..."

# Fix backend model imports
if [ -f "backend/src/models/index.js" ]; then
    # Check if it needs the proper imports
    if ! grep -q "const User = require" backend/src/models/index.js; then
        cat > backend/src/models/index.js << 'EOF'
const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');

// Import models
const User = require('./User')(sequelize);
const Provider = require('./Provider')(sequelize);
const Trip = require('./Trip')(sequelize);
const Booking = require('./Booking')(sequelize);

// Define associations
User.hasOne(Provider, { foreignKey: 'userId', as: 'providerProfile' });
Provider.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Provider.hasMany(Trip, { foreignKey: 'providerId', as: 'trips' });
Trip.belongsTo(Provider, { foreignKey: 'providerId', as: 'provider' });

User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Trip.hasMany(Booking, { foreignKey: 'tripId', as: 'bookings' });
Booking.belongsTo(Trip, { foreignKey: 'tripId', as: 'trip' });

module.exports = {
  sequelize,
  User,
  Provider,
  Trip,
  Booking
};
EOF
        echo "✅ Fixed backend/src/models/index.js"
    fi
fi

# Create errorHandler if missing
if [ ! -f "backend/src/middleware/errorHandler.js" ]; then
    cat > backend/src/middleware/errorHandler.js << 'EOF'
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(err);

  // Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };
EOF
    echo "✅ Created backend/src/middleware/errorHandler.js"
fi

# Fix trip controller imports
if [ -f "backend/src/controllers/tripController.js" ]; then
    # Add missing sequelize import
    if ! grep -q "const { Op } = require('sequelize')" backend/src/controllers/tripController.js; then
        sed -i '1i const { Op } = require('\''sequelize'\'');' backend/src/controllers/tripController.js
    fi
fi

# Create missing route files if they contain combined code
for route in auth trips bookings providers; do
    if [ ! -f "backend/src/routes/${route}.js" ] && [ -f "backend-routes.js" ]; then
        # Extract route from combined file
        sed -n "/\/\/ backend\/src\/routes\/${route}.js/,/module.exports/p" backend-routes.js > "backend/src/routes/${route}.js"
        echo "✅ Created backend/src/routes/${route}.js"
    fi
done

# Fix provider controller sequelize reference
if [ -f "backend/src/controllers/providerController.js" ]; then
    if grep -q "sequelize.fn" backend/src/controllers/providerController.js && ! grep -q "const { sequelize }" backend/src/controllers/providerController.js; then
        sed -i '1s/^/const { sequelize } = require('\''..\/models'\'');\n/' backend/src/controllers/providerController.js
        echo "✅ Fixed sequelize import in providerController.js"
    fi
fi

# Create email config if missing
if [ ! -f "backend/src/config/email.js" ]; then
    cat > backend/src/config/email.js << 'EOF'
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (options) => {
  const mailOptions = {
    from: `"AdventureConnect" <${process.env.EMAIL_FROM || 'noreply@adventureconnect.com'}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    // Don't throw in development if email is not configured
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
};

module.exports = { sendEmail };
EOF
    echo "✅ Created backend/src/config/email.js"
fi

# Split services file if combined
if [ -f "frontend/src/services/api.js" ] && grep -q "authService" frontend/src/services/api.js; then
    # Extract just the api.js part
    sed -n '1,/export default api;/p' frontend/src/services/api.js > temp_api.js
    mv temp_api.js frontend/src/services/api.js
    
    # Create auth.js service
    cat > frontend/src/services/auth.js << 'EOF'
import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};
EOF
    
    # Create trips.js service
    cat > frontend/src/services/trips.js << 'EOF'
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
EOF
    echo "✅ Split frontend services files"
fi

echo ""
echo "✅ Import fixes complete!"
echo ""
echo "Next steps:"
echo "1. Run ./validate-setup.sh to check if everything is correct"
echo "2. Install dependencies if needed"
echo "3. Start the application"