// backend/src/middleware/auth.js
const passport = require('passport');

const auth = {
  // Require authentication
  required: passport.authenticate('jwt', { session: false }),

  // Require provider role
  requireProvider: [
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
      if (req.user.userType !== 'provider') {
        return res.status(403).json({ 
          message: 'Access denied. Provider account required.' 
        });
      }
      next();
    }
  ],

  // Require traveler role
  requireTraveler: [
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
      if (req.user.userType !== 'traveler') {
        return res.status(403).json({ 
          message: 'Access denied. Traveler account required.' 
        });
      }
      next();
    }
  ],

  // Optional authentication (doesn't fail if not authenticated)
  optional: (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (user) {
        req.user = user;
      }
      next();
    })(req, res, next);
  }
};

module.exports = auth;

// backend/src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Sequelize bad request
  if (err.name === 'SequelizeValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Sequelize duplicate key
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

// backend/src/middleware/upload.js
const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: fileFilter
});

module.exports = upload;