const { Op } = require('sequelize');
// backend/src/controllers/tripController.js
const { pool } = require('../config/database');

// Create new trip
const createTrip = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const providerId = req.user.id;
    const {
      title,
      description,
      destination,
      durationDays,
      maxParticipants,
      pricePerPerson,
      includedItems,
      excludedItems,
      itinerary,
      activityType,
      difficultyLevel,
      tripDates
    } = req.body;

    // Handle uploaded images
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    await client.query('BEGIN');

    // Create trip
    const tripResult = await client.query(
      `INSERT INTO trips (
        provider_id, title, description, destination, duration_days,
        max_participants, price_per_person, included_items, excluded_items,
        itinerary, images, activity_type, difficulty_level, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        providerId, title, description, destination, durationDays,
        maxParticipants, pricePerPerson, includedItems || [], excludedItems || [],
        itinerary || {}, images, activityType, difficultyLevel, 'draft'
      ]
    );

    const trip = tripResult.rows[0];

    // Add trip dates if provided
    if (tripDates && tripDates.length > 0) {
      for (const date of tripDates) {
        await client.query(
          `INSERT INTO trip_dates (trip_id, start_date, end_date, available_spots)
           VALUES ($1, $2, $3, $4)`,
          [trip.id, date.startDate, date.endDate, maxParticipants]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Trip created successfully',
      trip
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create trip error:', error);
    res.status(500).json({ error: 'Failed to create trip' });
  } finally {
    client.release();
  }
};

// Update trip
const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user.id;

    // Check if trip belongs to provider
    const ownerCheck = await pool.query(
      'SELECT id FROM trips WHERE id = $1 AND provider_id = $2',
      [id, providerId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized to update this trip' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'title', 'description', 'destination', 'duration_days',
      'max_participants', 'price_per_person', 'included_items',
      'excluded_items', 'itinerary', 'activity_type', 'difficulty_level', 'status'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        const dbField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
        updates.push(`${dbField} = $${paramCount++}`);
        values.push(req.body[field]);
      }
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      updates.push(`images = images || $${paramCount++}`);
      values.push(newImages);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE trips 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.json({
      message: 'Trip updated successfully',
      trip: result.rows[0]
    });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ error: 'Failed to update trip' });
  }
};

// Get single trip
const getTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const tripQuery = `
      SELECT t.*, 
             u.first_name as provider_first_name, 
             u.last_name as provider_last_name,
             p.business_name, p.profile_image as provider_image,
             p.bio as provider_bio, p.years_experience
      FROM trips t
      JOIN users u ON t.provider_id = u.id
      JOIN provider_profiles p ON u.id = p.user_id
      WHERE t.id = $1
    `;

    const tripResult = await pool.query(tripQuery, [id]);

    if (tripResult.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Get trip dates
    const datesResult = await pool.query(
      'SELECT * FROM trip_dates WHERE trip_id = $1 ORDER BY start_date',
      [id]
    );

    const trip = tripResult.rows[0];
    trip.dates = datesResult.rows;

    res.json({ trip });
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ error: 'Failed to get trip' });
  }
};

// List trips with filters
const listTrips = async (req, res) => {
  try {
    const {
      destination,
      activityType,
      minPrice,
      maxPrice,
      startDate,
      endDate,
      providerId,
      status = 'published',
      limit = 20,
      offset = 0
    } = req.query;

    let query = `
      SELECT t.*, 
             u.first_name as provider_first_name, 
             u.last_name as provider_last_name,
             p.business_name, p.profile_image as provider_image
      FROM trips t
      JOIN users u ON t.provider_id = u.id
      JOIN provider_profiles p ON u.id = p.user_id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 1;

    // Add filters
    if (status) {
      query += ` AND t.status = $${paramCount++}`;
      values.push(status);
    }

    if (destination) {
      query += ` AND t.destination ILIKE $${paramCount++}`;
      values.push(`%${destination}%`);
    }

    if (activityType) {
      query += ` AND t.activity_type = $${paramCount++}`;
      values.push(activityType);
    }

    if (minPrice) {
      query += ` AND t.price_per_person >= $${paramCount++}`;
      values.push(minPrice);
    }

    if (maxPrice) {
      query += ` AND t.price_per_person <= $${paramCount++}`;
      values.push(maxPrice);
    }

    if (providerId) {
      query += ` AND t.provider_id = $${paramCount++}`;
      values.push(providerId);
    }

    // Date filtering requires joining with trip_dates
    if (startDate || endDate) {
      query += ` AND EXISTS (
        SELECT 1 FROM trip_dates td 
        WHERE td.trip_id = t.id 
        AND td.status = 'available'
      `;
      
      if (startDate) {
        query += ` AND td.start_date >= $${paramCount++}`;
        values.push(startDate);
      }
      
      if (endDate) {
        query += ` AND td.end_date <= $${paramCount++}`;
        values.push(endDate);
      }
      
      query += `)`;
    }

    // Count total results
    const countQuery = query.replace('SELECT t.*, u.first_name as provider_first_name, u.last_name as provider_last_name, p.business_name, p.profile_image as provider_image', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, values);
    const totalCount = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY t.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    res.json({
      trips: result.rows,
      total: totalCount,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('List trips error:', error);
    res.status(500).json({ error: 'Failed to list trips' });
  }
};

// Get provider's trips
const getProviderTrips = async (req, res) => {
  try {
    const providerId = req.user.id;

    const result = await pool.query(
      `SELECT t.*, 
        (SELECT COUNT(*) FROM bookings WHERE trip_id = t.id) as booking_count
       FROM trips t
       WHERE t.provider_id = $1
       ORDER BY t.created_at DESC`,
      [providerId]
    );

    res.json({ trips: result.rows });
  } catch (error) {
    console.error('Get provider trips error:', error);
    res.status(500).json({ error: 'Failed to get provider trips' });
  }
};

// Add trip dates
const addTripDates = async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user.id;
    const { dates } = req.body;

    // Check ownership
    const ownerCheck = await pool.query(
      'SELECT max_participants FROM trips WHERE id = $1 AND provider_id = $2',
      [id, providerId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const maxParticipants = ownerCheck.rows[0].max_participants;
    const addedDates = [];

    for (const date of dates) {
      const result = await pool.query(
        `INSERT INTO trip_dates (trip_id, start_date, end_date, available_spots)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [id, date.startDate, date.endDate, maxParticipants]
      );
      addedDates.push(result.rows[0]);
    }

    res.json({
      message: 'Dates added successfully',
      dates: addedDates
    });
  } catch (error) {
    console.error('Add trip dates error:', error);
    res.status(500).json({ error: 'Failed to add trip dates' });
  }
};

module.exports = {
  createTrip,
  updateTrip,
  getTrip,
  listTrips,
  getProviderTrips,
  addTripDates
};