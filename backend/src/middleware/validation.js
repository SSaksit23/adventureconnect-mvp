// backend/src/middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

// Validation middleware to check results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

// Common validation rules
const commonValidations = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
    
  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
    
  requiredString: (field) => 
    body(field)
      .trim()
      .notEmpty()
      .withMessage(`${field} is required`),
      
  optionalString: (field) => 
    body(field)
      .optional()
      .trim(),
      
  positiveNumber: (field) => 
    body(field)
      .isFloat({ min: 0 })
      .withMessage(`${field} must be a positive number`),
      
  positiveInteger: (field) => 
    body(field)
      .isInt({ min: 1 })
      .withMessage(`${field} must be a positive integer`),
      
  dateString: (field) => 
    body(field)
      .isISO8601()
      .toDate()
      .withMessage(`${field} must be a valid date`),
      
  idParam: param('id')
    .isInt()
    .withMessage('Invalid ID parameter'),
};

// Trip validation rules
const tripValidations = {
  create: [
    commonValidations.requiredString('title'),
    commonValidations.requiredString('description'),
    commonValidations.requiredString('destination'),
    commonValidations.positiveInteger('durationDays'),
    commonValidations.positiveInteger('maxParticipants'),
    commonValidations.positiveNumber('pricePerPerson'),
    body('activityType')
      .optional()
      .isIn(['Adventure', 'Cultural', 'Culinary', 'Wildlife', 'Wellness', 'Photography', 'Hiking', 'Water Sports'])
      .withMessage('Invalid activity type'),
    body('difficultyLevel')
      .optional()
      .isIn(['Easy', 'Moderate', 'Challenging', 'Expert'])
      .withMessage('Invalid difficulty level'),
  ],
  
  update: [
    commonValidations.idParam,
    commonValidations.optionalString('title'),
    commonValidations.optionalString('description'),
    commonValidations.optionalString('destination'),
    body('durationDays').optional().isInt({ min: 1 }),
    body('maxParticipants').optional().isInt({ min: 1 }),
    body('pricePerPerson').optional().isFloat({ min: 0 }),
    body('status')
      .optional()
      .isIn(['draft', 'published', 'paused'])
      .withMessage('Invalid status'),
  ],
};

// Booking validation rules
const bookingValidations = {
  create: [
    body('tripId').isInt().withMessage('Invalid trip ID'),
    body('tripDateId').isInt().withMessage('Invalid trip date ID'),
    commonValidations.positiveInteger('numParticipants'),
    commonValidations.optionalString('message'),
    commonValidations.optionalString('specialRequirements'),
  ],
  
  updateStatus: [
    commonValidations.idParam,
    body('status')
      .isIn(['pending', 'confirmed', 'cancelled'])
      .withMessage('Invalid status'),
    commonValidations.optionalString('providerResponse'),
  ],
};

module.exports = {
  validate,
  commonValidations,
  tripValidations,
  bookingValidations,
};

// backend/src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
  });

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      error: 'File too large',
      message: 'Maximum file size is 5MB' 
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ 
      error: 'Unexpected file',
      message: 'Invalid file field name' 
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      error: 'Invalid token',
      message: 'Authentication failed' 
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      error: 'Token expired',
      message: 'Please login again' 
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: err.details || err.message 
    });
  }

  // Database errors
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({ 
      error: 'Duplicate entry',
      message: 'This resource already exists' 
    });
  }

  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({ 
      error: 'Invalid reference',
      message: 'Referenced resource does not exist' 
    });
  }

  // Default error response
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : message,
    ...(process.env.NODE_ENV === 'development' && { 
      details: err.message,
      stack: err.stack 
    })
  });
};

// Not found handler
const notFound = (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: `Route ${req.method} ${req.url} not found` 
  });
};

module.exports = {
  errorHandler,
  notFound,
};

// backend/src/utils/apiResponse.js
class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res, message = 'Error', statusCode = 400, details = null) {
    return res.status(statusCode).json({
      success: false,
      error: message,
      ...(details && { details }),
    });
  }

  static created(res, data, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  static updated(res, data, message = 'Resource updated successfully') {
    return this.success(res, data, message, 200);
  }

  static deleted(res, message = 'Resource deleted successfully') {
    return this.success(res, null, message, 200);
  }

  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  static unauthorized(res, message = 'Unauthorized access') {
    return this.error(res, message, 401);
  }

  static forbidden(res, message = 'Access forbidden') {
    return this.error(res, message, 403);
  }

  static validationError(res, errors) {
    return this.error(res, 'Validation failed', 400, errors);
  }
}

module.exports = ApiResponse;