// backend/src/config/amadeus.js
const Amadeus = require('amadeus');
require('dotenv').config();

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
  hostname: 'test' // Use 'production' for production environment
});

// Test the connection
const testAmadeusConnection = async () => {
  try {
    const response = await amadeus.referenceData.locations.get({
      keyword: 'LON',
      subType: 'AIRPORT,CITY'
    });
    console.log('Amadeus API connected successfully');
    return true;
  } catch (error) {
    console.error('Amadeus API connection failed:', error);
    return false;
  }
};

module.exports = {
  amadeus,
  testAmadeusConnection
};