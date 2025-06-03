// backend/src/controllers/providerController.js
const { pool } = require('../config/database');

// Update provider profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      businessName,
      bio,
      expertise,
      location,
      languages,
      yearsExperience
    } = req.body;

    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (businessName !== undefined) {
      updates.push(`business_name = $${paramCount++}`);
      values.push(businessName);
    }
    if (bio !== undefined) {
      updates.push(`bio = $${paramCount++}`);
      values.push(bio);
    }
    if (expertise !== undefined) {
      updates.push(`expertise = $${paramCount++}`);
      values.push(expertise);
    }
    if (location !== undefined) {
      updates.push(`location = $${paramCount++}`);
      values.push(location);
    }
    if (languages !== undefined) {
      updates.push(`languages = $${paramCount++}`);
      values.push(languages);
    }
    if (yearsExperience !== undefined) {
      updates.push(`years_experience = $${paramCount++}`);
      values.push(yearsExperience);
    }
    if (profileImage) {
      updates.push(`profile_image = $${paramCount++}`);
      values.push(profileImage);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE provider_profiles 
      SET ${updates.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      profile: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Get provider profile
const getProviderProfile = async (req, res) => {
  try {
    const providerId = req.params.id;

    const query = `
      SELECT u.id, u.first_name, u.last_name, u.email,
             p.business_name, p.bio, p.expertise, p.location, 
             p.languages, p.years_experience, p.profile_image, 
             p.is_approved, p.created_at
      FROM users u
      JOIN provider_profiles p ON u.id = p.user_id
      WHERE u.id = $1 AND u.user_type = 'provider'
    `;

    const result = await pool.query(query, [providerId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Get provider's trips count
    const tripsResult = await pool.query(
      'SELECT COUNT(*) FROM trips WHERE provider_id = $1 AND status = $2',
      [providerId, 'published']
    );

    const provider = result.rows[0];
    provider.total_trips = parseInt(tripsResult.rows[0].count);

    res.json({ provider });
  } catch (error) {
    console.error('Get provider profile error:', error);
    res.status(500).json({ error: 'Failed to get provider profile' });
  }
};

// List all approved providers
const listProviders = async (req, res) => {
  try {
    const { location, expertise, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT u.id, u.first_name, u.last_name,
             p.business_name, p.bio, p.expertise, p.location, 
             p.languages, p.years_experience, p.profile_image
      FROM users u
      JOIN provider_profiles p ON u.id = p.user_id
      WHERE u.user_type = 'provider' AND p.is_approved = true
    `;

    const values = [];
    let paramCount = 1;

    if (location) {
      query += ` AND p.location ILIKE $${paramCount++}`;
      values.push(`%${location}%`);
    }

    if (expertise) {
      query += ` AND $${paramCount++} = ANY(p.expertise)`;
      values.push(expertise);
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    res.json({
      providers: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('List providers error:', error);
    res.status(500).json({ error: 'Failed to list providers' });
  }
};

module.exports = {
  updateProfile,
  getProviderProfile,
  listProviders
};