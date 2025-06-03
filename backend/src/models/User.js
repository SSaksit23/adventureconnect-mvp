// backend/src/models/User.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userType: {
      type: DataTypes.ENUM('traveler', 'provider'),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING
    },
    avatar: {
      type: DataTypes.STRING
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true
  });

  return User;
};

// backend/src/models/Provider.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Provider = sequelize.define('Provider', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    businessName: {
      type: DataTypes.STRING
    },
    bio: {
      type: DataTypes.TEXT
    },
    expertiseAreas: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    experienceYears: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalTrips: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationDate: {
      type: DataTypes.DATE
    },
    payoutInfo: {
      type: DataTypes.JSON
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 15.00
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
    },
    avatar: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'providers',
    timestamps: true,
    underscored: true
  });

  return Provider;
};

// backend/src/models/Booking.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tripId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'trips',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    bookingNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    customization: {
      type: DataTypes.JSON,
      allowNull: false
    },
    travelerInfo: {
      type: DataTypes.JSON,
      allowNull: false
    },
    specialRequests: {
      type: DataTypes.TEXT
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    commissionAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    paymentMethod: {
      type: DataTypes.STRING(50)
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending'
    },
    paymentId: {
      type: DataTypes.STRING
    },
    bookingStatus: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      defaultValue: 'pending'
    },
    cancelledAt: {
      type: DataTypes.DATE
    },
    cancellationReason: {
      type: DataTypes.TEXT
    },
    completedAt: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'bookings',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (booking) => {
        // Generate booking number
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        booking.bookingNumber = `AC${year}${month}${random}`;
      }
    }
  });

  return Booking;
};