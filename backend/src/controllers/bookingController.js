// backend/src/controllers/bookingController.js
const { Booking, Trip, User, Provider } = require('../models');
const { sendEmail } = require('../config/email');

const bookingController = {
  // Create new booking
  createBooking: async (req, res, next) => {
    try {
      const {
        tripId,
        customization,
        travelerInfo,
        specialRequests,
        totalPrice,
        paymentMethod
      } = req.body;

      // Verify trip exists and is active
      const trip = await Trip.findOne({
        where: { id: tripId, status: 'active' },
        include: [{ model: Provider, as: 'provider' }]
      });

      if (!trip) {
        return res.status(404).json({ message: 'Trip not found or unavailable' });
      }

      // Calculate commission
      const commissionRate = trip.provider.commissionRate || 15;
      const commissionAmount = (totalPrice * commissionRate) / 100;

      // Create booking
      const booking = await Booking.create({
        tripId,
        userId: req.user.id,
        customization,
        travelerInfo,
        specialRequests,
        totalPrice,
        commissionAmount,
        paymentMethod,
        paymentStatus: 'pending', // In real app, process payment first
        bookingStatus: 'confirmed' // Simplified for MVP
      });

      // Send confirmation email
      await sendEmail({
        to: req.user.email,
        subject: `Booking Confirmation - ${booking.bookingNumber}`,
        html: `
          <h2>Booking Confirmed!</h2>
          <p>Your booking for "${trip.title}" has been confirmed.</p>
          <p>Booking Number: <strong>${booking.bookingNumber}</strong></p>
          <p>Total Price: $${totalPrice}</p>
        `
      });

      res.status(201).json(booking);
    } catch (error) {
      next(error);
    }
  },

  // Get user's bookings
  getUserBookings: async (req, res, next) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const where = { userId: req.user.id };
      
      if (status) {
        where.bookingStatus = status;
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Booking.findAndCountAll({
        where,
        include: [{
          model: Trip,
          as: 'trip',
          include: [{
            model: Provider,
            as: 'provider',
            attributes: ['id', 'name']
          }]
        }],
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        bookings: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      });
    } catch (error) {
      next(error);
    }
  },

  // Get single booking
  getBookingById: async (req, res, next) => {
    try {
      const booking = await Booking.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id
        },
        include: [{
          model: Trip,
          as: 'trip',
          include: [{
            model: Provider,
            as: 'provider'
          }]
        }]
      });

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      res.json(booking);
    } catch (error) {
      next(error);
    }
  },

  // Cancel booking
  cancelBooking: async (req, res, next) => {
    try {
      const booking = await Booking.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
          bookingStatus: ['pending', 'confirmed']
        }
      });

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found or cannot be cancelled' });
      }

      // Check cancellation policy (48 hours before trip)
      const tripDate = new Date(booking.customization.dates);
      const now = new Date();
      const hoursUntilTrip = (tripDate - now) / (1000 * 60 * 60);

      if (hoursUntilTrip < 48) {
        return res.status(400).json({ 
          message: 'Cannot cancel within 48 hours of trip' 
        });
      }

      await booking.update({
        bookingStatus: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: req.body.reason
      });

      res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = bookingController;

// backend/src/controllers/providerController.js
const { Provider, Trip, Booking, User } = require('../models');
const { Op } = require('sequelize');

const providerController = {
  // Get provider profile
  getProviderProfile: async (req, res, next) => {
    try {
      const provider = await Provider.findByPk(req.params.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        }]
      });

      if (!provider) {
        return res.status(404).json({ message: 'Provider not found' });
      }

      res.json(provider);
    } catch (error) {
      next(error);
    }
  },

  // Get provider's trips
  getProviderTrips: async (req, res, next) => {
    try {
      const trips = await Trip.findAll({
        where: {
          providerId: req.params.id,
          status: 'active'
        },
        order: [['createdAt', 'DESC']]
      });

      res.json(trips);
    } catch (error) {
      next(error);
    }
  },

  // Get provider stats (for dashboard)
  getProviderStats: async (req, res, next) => {
    try {
      const provider = await Provider.findOne({
        where: { userId: req.user.id }
      });

      if (!provider) {
        return res.status(404).json({ message: 'Provider profile not found' });
      }

      // Get trip stats
      const totalTrips = await Trip.count({
        where: { providerId: provider.id }
      });

      // Get booking stats
      const bookingStats = await Booking.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalBookings'],
          [sequelize.fn('SUM', sequelize.col('total_price')), 'totalRevenue'],
          [sequelize.fn('COUNT', sequelize.literal(`CASE WHEN booking_status = 'confirmed' THEN 1 END`)), 'activeBookings']
        ],
        include: [{
          model: Trip,
          as: 'trip',
          where: { providerId: provider.id },
          attributes: []
        }],
        raw: true
      });

      // Get average rating
      const ratingStats = await Trip.findOne({
        attributes: [
          [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']
        ],
        where: {
          providerId: provider.id,
          rating: { [Op.gt]: 0 }
        },
        raw: true
      });

      res.json({
        totalTrips,
        activeBookings: parseInt(bookingStats[0]?.activeBookings || 0),
        totalRevenue: parseFloat(bookingStats[0]?.totalRevenue || 0),
        avgRating: parseFloat(ratingStats?.avgRating || 0)
      });
    } catch (error) {
      next(error);
    }
  },

  // Get provider's own trips
  getOwnTrips: async (req, res, next) => {
    try {
      const provider = await Provider.findOne({
        where: { userId: req.user.id }
      });

      const trips = await Trip.findAll({
        where: { providerId: provider.id },
        order: [['createdAt', 'DESC']]
      });

      res.json(trips);
    } catch (error) {
      next(error);
    }
  },

  // Get provider's bookings
  getProviderBookings: async (req, res, next) => {
    try {
      const provider = await Provider.findOne({
        where: { userId: req.user.id }
      });

      const bookings = await Booking.findAll({
        include: [{
          model: Trip,
          as: 'trip',
          where: { providerId: provider.id }
        }, {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        }],
        order: [['createdAt', 'DESC']]
      });

      res.json(bookings);
    } catch (error) {
      next(error);
    }
  },

  // Update provider profile
  updateProviderProfile: async (req, res, next) => {
    try {
      const provider = await Provider.findOne({
        where: { userId: req.user.id }
      });

      if (!provider) {
        return res.status(404).json({ message: 'Provider profile not found' });
      }

      await provider.update(req.body);
      res.json(provider);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = providerController;