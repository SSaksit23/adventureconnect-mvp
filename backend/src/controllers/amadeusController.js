// backend/src/controllers/amadeusController.js
const { amadeus } = require('../config/amadeus');

// Search for flights
const searchFlights = async (req, res) => {
  try {
    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      adults = 1,
      travelClass = 'ECONOMY',
      nonStop = false,
      currencyCode = 'USD',
      max = 10
    } = req.query;

    // Validate required parameters
    if (!originLocationCode || !destinationLocationCode || !departureDate || !adults) {
      return res.status(400).json({
        error: 'Missing required parameters: originLocationCode, destinationLocationCode, departureDate, adults'
      });
    }

    // Build search parameters
    const searchParams = {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults: parseInt(adults),
      travelClass,
      nonStop: nonStop === 'true',
      currencyCode,
      max: parseInt(max)
    };

    // Add return date for round trip
    if (returnDate) {
      searchParams.returnDate = returnDate;
    }

    // Search flights
    const response = await amadeus.shopping.flightOffersSearch.get(searchParams);

    // Format response
    const flights = response.data.map(offer => ({
      id: offer.id,
      type: offer.type,
      source: offer.source,
      instantTicketingRequired: offer.instantTicketingRequired,
      nonHomogeneous: offer.nonHomogeneous,
      oneWay: offer.oneWay,
      lastTicketingDate: offer.lastTicketingDate,
      numberOfBookableSeats: offer.numberOfBookableSeats,
      itineraries: offer.itineraries,
      price: {
        currency: offer.price.currency,
        total: offer.price.total,
        base: offer.price.base,
        fees: offer.price.fees,
        grandTotal: offer.price.grandTotal
      },
      pricingOptions: offer.pricingOptions,
      validatingAirlineCodes: offer.validatingAirlineCodes,
      travelerPricings: offer.travelerPricings
    }));

    res.json({
      count: flights.length,
      flights
    });
  } catch (error) {
    console.error('Flight search error:', error);
    
    if (error.response && error.response.statusCode === 400) {
      return res.status(400).json({
        error: 'Invalid search parameters',
        details: error.response.result
      });
    }
    
    res.status(500).json({ error: 'Failed to search flights' });
  }
};

// Search for hotels
const searchHotels = async (req, res) => {
  try {
    const {
      cityCode,
      latitude,
      longitude,
      checkInDate,
      checkOutDate,
      adults = 1,
      roomQuantity = 1,
      radius = 5,
      radiusUnit = 'KM',
      hotelName,
      ratings,
      amenities,
      priceRange,
      currency = 'USD'
    } = req.query;

    // Validate required parameters
    if ((!cityCode && (!latitude || !longitude)) || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        error: 'Missing required parameters: cityCode OR (latitude, longitude), checkInDate, checkOutDate'
      });
    }

    // Build search parameters
    const searchParams = {
      checkInDate,
      checkOutDate,
      adults: parseInt(adults),
      roomQuantity: parseInt(roomQuantity),
      radius: parseInt(radius),
      radiusUnit,
      currency
    };

    // Add location parameters
    if (cityCode) {
      searchParams.cityCode = cityCode;
    } else {
      searchParams.latitude = parseFloat(latitude);
      searchParams.longitude = parseFloat(longitude);
    }

    // Add optional filters
    if (hotelName) searchParams.hotelName = hotelName;
    if (ratings) searchParams.ratings = ratings.split(',').map(r => parseInt(r));
    if (amenities) searchParams.amenities = amenities.split(',');
    if (priceRange) searchParams.priceRange = priceRange;

    // Search hotels
    const response = await amadeus.shopping.hotelOffers.get(searchParams);

    // Format response
    const hotels = response.data.map(offer => ({
      type: offer.type,
      hotel: {
        hotelId: offer.hotel.hotelId,
        chainCode: offer.hotel.chainCode,
        brandCode: offer.hotel.brandCode,
        dupeId: offer.hotel.dupeId,
        name: offer.hotel.name,
        rating: offer.hotel.rating,
        cityCode: offer.hotel.cityCode,
        latitude: offer.hotel.latitude,
        longitude: offer.hotel.longitude,
        address: offer.hotel.address,
        distance: offer.hotel.distance,
        amenities: offer.hotel.amenities,
        media: offer.hotel.media
      },
      available: offer.available,
      offers: offer.offers.map(o => ({
        id: o.id,
        checkInDate: o.checkInDate,
        checkOutDate: o.checkOutDate,
        room: o.room,
        guests: o.guests,
        price: o.price,
        policies: o.policies
      }))
    }));

    res.json({
      count: hotels.length,
      hotels
    });
  } catch (error) {
    console.error('Hotel search error:', error);
    
    if (error.response && error.response.statusCode === 400) {
      return res.status(400).json({
        error: 'Invalid search parameters',
        details: error.response.result
      });
    }
    
    res.status(500).json({ error: 'Failed to search hotels' });
  }
};

// Get hotel details
const getHotelDetails = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { checkInDate, checkOutDate, adults = 1, roomQuantity = 1 } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        error: 'Missing required parameters: checkInDate, checkOutDate'
      });
    }

    // Get hotel offers by hotel ID
    const response = await amadeus.shopping.hotelOffersByHotel.get({
      hotelId,
      checkInDate,
      checkOutDate,
      adults: parseInt(adults),
      roomQuantity: parseInt(roomQuantity)
    });

    if (!response.data) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    res.json({
      hotel: response.data
    });
  } catch (error) {
    console.error('Get hotel details error:', error);
    res.status(500).json({ error: 'Failed to get hotel details' });
  }
};

// Confirm flight price
const confirmFlightPrice = async (req, res) => {
  try {
    const { flightOffer } = req.body;

    if (!flightOffer) {
      return res.status(400).json({ error: 'Flight offer data is required' });
    }

    // Confirm the price
    const response = await amadeus.shopping.flightOffers.pricing.post(
      JSON.stringify({
        data: {
          type: 'flight-offers-pricing',
          flightOffers: [flightOffer]
        }
      })
    );

    res.json({
      confirmedPrice: response.data
    });
  } catch (error) {
    console.error('Flight price confirmation error:', error);
    res.status(500).json({ error: 'Failed to confirm flight price' });
  }
};

// Search locations (airports, cities)
const searchLocations = async (req, res) => {
  try {
    const { keyword, subType = 'CITY,AIRPORT' } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const response = await amadeus.referenceData.locations.get({
      keyword,
      subType
    });

    const locations = response.data.map(loc => ({
      type: loc.type,
      subType: loc.subType,
      name: loc.name,
      detailedName: loc.detailedName,
      id: loc.id,
      iataCode: loc.iataCode,
      address: loc.address,
      geoCode: loc.geoCode
    }));

    res.json({
      count: locations.length,
      locations
    });
  } catch (error) {
    console.error('Location search error:', error);
    res.status(500).json({ error: 'Failed to search locations' });
  }
};

module.exports = {
  searchFlights,
  searchHotels,
  getHotelDetails,
  confirmFlightPrice,
  searchLocations
};