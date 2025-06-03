// backend/src/models/Review.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tripId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'trips', // Assuming your trips table is named 'trips'
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users', // Assuming your users table is named 'users'
        key: 'id'
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT
    },
    reviewDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'reviews',
    timestamps: true,
    underscored: true
  });

  // Later, in your models/index.js, you'd associate it:
  // Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  // User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
  // Review.belongsTo(Trip, { foreignKey: 'tripId', as: 'trip' });
  // Trip.hasMany(Review, { foreignKey: 'tripId', as: 'reviews' });

  return Review;
};