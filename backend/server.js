// backend/server.js
const app = require('./src/app');
const { pool, initializeDatabase } = require('./src/config/database');
const { testAmadeusConnection } = require('./src/config/amadeus');

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    console.log('✅ Database connected successfully');
    
    // Initialize database tables
    await initializeDatabase();
    console.log('✅ Database tables initialized');
    
    // Test Amadeus connection
    const amadeusConnected = await testAmadeusConnection();
    if (amadeusConnected) {
      console.log('✅ Amadeus API connected successfully');
    } else {
      console.warn('⚠️  Amadeus API connection failed - some features may not work');
    }
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV}`);
      console.log(`   API URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});

// Start the server
startServer();