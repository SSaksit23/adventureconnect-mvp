// backend/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');
const bookingRoutes = require('./routes/bookings');
const providerRoutes = require('./routes/providers');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/providers', providerRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling
app.use(errorHandler);

module.exports = app;

// backend/src/server.js
const app = require('./app');
const { sequelize } = require('./config/database');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized.');

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();

// backend/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Provider } = require('../models');

const authController = {
  // Register new user
  register: async (req, res, next) => {
    try {
      const { email, password, firstName, lastName, userType } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        userType
      });

      // If provider, create provider profile
      if (userType === 'provider') {
        await Provider.create({
          userId: user.id,
          name: `${firstName} ${lastName}`,
          email
        });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, userType: user.userType },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Return user without password
      const userResponse = user.toJSON();
      delete userResponse.password;

      res.status(201).json({
        token,
        user: userResponse
      });
    } catch (error) {
      next(error);
    }
  },

  // Login user
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, userType: user.userType },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Return user without password
      const userResponse = user.toJSON();
      delete userResponse.password;

      res.json({
        token,
        user: userResponse
      });
    } catch (error) {
      next(error);
    }
  },

  // Get current user
  getMe: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;

// backend/src/controllers/tripController.js
const { Trip, Provider, User } = require('../models');
const { Op } = require('sequelize');

const tripController = {
  // Get all trips with filters
  getAllTrips: async (req, res, next) => {
    try {
      const {
        activityType,
        location,
        minPrice,
        maxPrice,
        page = 1,
        limit = 12
      } = req.query;

      const where = {};
      
      if (activityType) where.activityType = activityType;
      if (location) where.location = { [Op.iLike]: `%${location}%` };
      if (minPrice || maxPrice) {
        where.basePrice = {};
        if (minPrice) where.basePrice[Op.gte] = minPrice;
        if (maxPrice) where.basePrice[Op.lte] = maxPrice;
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Trip.findAndCountAll({
        where,
        include: [{
          model: Provider,
          as: 'provider',
          attributes: ['id', 'name', 'avatar']
        }],
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        trips: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      });
    } catch (error) {
      next(error);
    }
  },

  // Get single trip
  getTripById: async (req, res, next) => {
    try {
      const trip = await Trip.findByPk(req.params.id, {
        include: [{
          model: Provider,
          as: 'provider',
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        }]
      });

      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }

      res.json(trip);
    } catch (error) {
      next(error);
    }
  },

  // Create new trip (Provider only)
  createTrip: async (req, res, next) => {
    try {
      const provider = await Provider.findOne({
        where: { userId: req.user.id }
      });

      if (!provider) {
        return res.status(403).json({ message: 'Provider profile not found' });
      }

      const tripData = {
        ...req.body,
        providerId: provider.id,
        status: 'pending' // Admin review required
      };

      const trip = await Trip.create(tripData);
      res.status(201).json(trip);
    } catch (error) {
      next(error);
    }
  },

  // Update trip (Provider only)
  updateTrip: async (req, res, next) => {
    try {
      const provider = await Provider.findOne({
        where: { userId: req.user.id }
      });

      const trip = await Trip.findOne({
        where: {
          id: req.params.id,
          providerId: provider.id
        }
      });

      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }

      await trip.update(req.body);
      res.json(trip);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = tripController;

// backend/src/models/index.js
const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = config.sequelize;

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

// backend/src/models/Trip.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Trip = sequelize.define('Trip', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tripType: {
      type: DataTypes.ENUM('service_component', 'example_itinerary'),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    activityType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false
    },
    maxGroupSize: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    included: {
      type: DataTypes.TEXT
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    customizableComponents: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    availability: {
      type: DataTypes.STRING,
      defaultValue: 'daily'
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'inactive'),
      defaultValue: 'pending'
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 0
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  });

  return Trip;
};

// backend/package.json
{
  "name": "adventureconnect-backend",
  "version": "1.0.0",
  "description": "AdventureConnect MVP Backend",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.0.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "sequelize": "^6.31.0",
    "pg": "^8.10.0",
    "redis": "^4.6.5",
    "multer": "^1.4.5-lts.1",
    "amadeus": "^8.0.0",
    "stripe": "^12.0.0",
    "nodemailer": "^6.9.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "jest": "^29.5.0",
    "supertest": "^6.3.3"
  }
}