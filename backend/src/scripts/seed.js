// backend/src/scripts/seed.js
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
require('dotenv').config();

const seedDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Starting database seed...');
    
    await client.query('BEGIN');

    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create providers
    const provider1Result = await client.query(
      `INSERT INTO users (email, password, first_name, last_name, user_type, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id`,
      ['alex@adventureconnect.com', hashedPassword, 'Alex', 'Chen', 'provider', true]
    );
    
    const provider2Result = await client.query(
      `INSERT INTO users (email, password, first_name, last_name, user_type, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id`,
      ['sofia@adventureconnect.com', hashedPassword, 'Sofia', 'Rodriguez', 'provider', true]
    );

    const provider1Id = provider1Result.rows[0].id;
    const provider2Id = provider2Result.rows[0].id;

    // Create provider profiles
    await client.query(
      `INSERT INTO provider_profiles 
       (user_id, business_name, bio, expertise, location, languages, years_experience, is_approved) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        provider1Id,
        'Wanderlust Adventures',
        'Experienced travel blogger and photographer specializing in Southeast Asian cultural experiences. I create unique, immersive trips that go beyond typical tourist trails.',
        ['Cultural Tours', 'Photography', 'Adventure Travel'],
        'Chiang Mai, Thailand',
        ['English', 'Thai', 'Mandarin'],
        8,
        true
      ]
    );

    await client.query(
      `INSERT INTO provider_profiles 
       (user_id, business_name, bio, expertise, location, languages, years_experience, is_approved) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        provider2Id,
        'Andes Explorers',
        'Professional mountain guide with expertise in high-altitude trekking and cultural immersion in Peru and Bolivia. Safety-focused adventures with local community connections.',
        ['Hiking', 'Cultural Tours', 'Wildlife'],
        'Cusco, Peru',
        ['English', 'Spanish', 'Quechua'],
        12,
        true
      ]
    );

    // Create travelers
    const traveler1Result = await client.query(
      `INSERT INTO users (email, password, first_name, last_name, user_type, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id`,
      ['sarah@example.com', hashedPassword, 'Sarah', 'Miller', 'traveler', true]
    );

    const traveler2Result = await client.query(
      `INSERT INTO users (email, password, first_name, last_name, user_type, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id`,
      ['john@example.com', hashedPassword, 'John', 'Smith', 'traveler', true]
    );

    // Create trips
    const trip1Result = await client.query(
      `INSERT INTO trips 
       (provider_id, title, description, destination, duration_days, max_participants, 
        price_per_person, included_items, excluded_items, activity_type, difficulty_level, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING id`,
      [
        provider1Id,
        'Northern Thailand Hill Tribe Cultural Immersion',
        `Experience the authentic culture of Northern Thailand's hill tribes on this 7-day adventure. 
        
        Journey through remote villages, participate in traditional ceremonies, learn ancient crafts, and trek through stunning mountain landscapes. This trip offers a rare opportunity to connect with local communities while exploring one of Thailand's most beautiful regions.
        
        Perfect for travelers seeking meaningful cultural exchanges and moderate physical activity.`,
        'Chiang Mai, Thailand',
        7,
        12,
        899.00,
        [
          'All meals (traditional Thai and hill tribe cuisine)',
          'Accommodation in village homestays and eco-lodges',
          'Local expert guide and translator',
          'All transportation during the trip',
          'Cultural activities and workshops',
          'Trekking equipment',
          'Donation to community projects'
        ],
        [
          'International flights',
          'Travel insurance',
          'Personal expenses',
          'Alcoholic beverages',
          'Tips for guides'
        ],
        'Cultural',
        'Moderate',
        'published'
      ]
    );

    const trip2Result = await client.query(
      `INSERT INTO trips 
       (provider_id, title, description, destination, duration_days, max_participants, 
        price_per_person, included_items, excluded_items, activity_type, difficulty_level, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING id`,
      [
        provider2Id,
        'Sacred Valley & Machu Picchu Photography Expedition',
        `Capture the magic of Peru's Sacred Valley and Machu Picchu on this 10-day photography-focused expedition.
        
        Led by professional photographer and cultural guide, this trip combines world-class photography opportunities with deep cultural immersion. Wake up for sunrise shoots at Machu Picchu, explore hidden Inca sites, and document daily life in traditional Andean communities.
        
        Suitable for photographers of all levels who can handle moderate altitude and walking.`,
        'Cusco, Peru',
        10,
        8,
        1599.00,
        [
          'Professional photography guidance',
          'All accommodations (boutique hotels and lodges)',
          'Breakfast and lunch daily',
          'Private transportation',
          'Machu Picchu entrance and train tickets',
          'All site entrance fees',
          'Photography workshops and critiques',
          'Local cultural experiences'
        ],
        [
          'International flights',
          'Dinner meals',
          'Photography equipment',
          'Travel insurance',
          'Personal expenses',
          'Tips'
        ],
        'Photography',
        'Moderate',
        'published'
      ]
    );

    const trip1Id = trip1Result.rows[0].id;
    const trip2Id = trip2Result.rows[0].id;

    // Add trip dates
    const today = new Date();
    const futureDate1 = new Date(today);
    futureDate1.setMonth(today.getMonth() + 2);
    
    const futureDate2 = new Date(today);
    futureDate2.setMonth(today.getMonth() + 3);

    await client.query(
      `INSERT INTO trip_dates (trip_id, start_date, end_date, available_spots, status) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        trip1Id,
        futureDate1.toISOString().split('T')[0],
        new Date(futureDate1.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        12,
        'available'
      ]
    );

    await client.query(
      `INSERT INTO trip_dates (trip_id, start_date, end_date, available_spots, status) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        trip1Id,
        futureDate2.toISOString().split('T')[0],
        new Date(futureDate2.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        12,
        'available'
      ]
    );

    await client.query(
      `INSERT INTO trip_dates (trip_id, start_date, end_date, available_spots, status) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        trip2Id,
        futureDate1.toISOString().split('T')[0],
        new Date(futureDate1.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        8,
        'available'
      ]
    );

    await client.query('COMMIT');
    
    console.log('✅ Database seeded successfully!');
    console.log('\nTest accounts created:');
    console.log('Providers:');
    console.log('  - alex@adventureconnect.com / password123');
    console.log('  - sofia@adventureconnect.com / password123');
    console.log('Travelers:');
    console.log('  - sarah@example.com / password123');
    console.log('  - john@example.com / password123');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('\nSeed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed error:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;