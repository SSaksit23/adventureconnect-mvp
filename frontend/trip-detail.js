// frontend/src/pages/TripDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPinIcon, 
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [customization, setCustomization] = useState({
    travelers: 1,
    dates: '',
    includeAccommodation: false,
    accommodationType: '',
    additionalActivities: false
  });

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    try {
      const response = await api.get(`/trips/${id}`);
      setTrip(response.data);
    } catch (error) {
      console.error('Error fetching trip details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsWishlisted(!isWishlisted);
    // API call to update wishlist
  };

  const handleStartCustomization = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/trips/${id}` } } });
      return;
    }
    setShowCustomization(true);
  };

  const calculateTotalPrice = () => {
    let total = trip.basePrice * customization.travelers;
    
    // Add accommodation cost if selected
    if (customization.includeAccommodation) {
      const accommodationPrices = {
        budget: 30,
        standard: 60,
        luxury: 150
      };
      total += (accommodationPrices[customization.accommodationType] || 0) * customization.travelers;
    }
    
    // Add activities cost if selected
    if (customization.additionalActivities) {
      total += 50 * customization.travelers; // Example additional activity cost
    }
    
    return total;
  };

  const handleBooking = async () => {
    const bookingData = {
      tripId: trip.id,
      customization,
      totalPrice: calculateTotalPrice()
    };
    
    // Navigate to booking/payment page
    navigate('/booking/request', { state: { bookingData } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Trip not found</h2>
          <button onClick={() => navigate('/trips')} className="mt-4 text-primary-600 hover:text-primary-500">
            Back to trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="bg-white">
        <div className="container-custom py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="aspect-w-16 aspect-h-9">
              {trip.images && trip.images.length > 0 ? (
                <img
                  src={trip.images[activeImage]}
                  alt={trip.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                  <MapPinIcon className="h-24 w-24 text-white opacity-50" />
                </div>
              )}
            </div>
            {trip.images && trip.images.length > 1 && (
              <div className="grid grid-cols-2 gap-4">
                {trip.images.slice(1, 5).map((image, idx) => (
                  <img
                    key={idx}
                    src={image}
                    alt={`${trip.title} ${idx + 2}`}
                    className="w-full h-44 object-cover rounded-lg cursor-pointer hover:opacity-90"
                    onClick={() => setActiveImage(idx + 1)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  {trip.activityType}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleWishlist}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    {isWishlisted ? (
                      <HeartIconSolid className="h-6 w-6 text-red-500" />
                    ) : (
                      <HeartIcon className="h-6 w-6 text-gray-600" />
                    )}
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ShareIcon className="h-6 w-6 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{trip.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-1" />
                  {trip.location}
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 mr-1" />
                  {trip.duration}
                </div>
                <div className="flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-1" />
                  Max {trip.maxGroupSize} people
                </div>
              </div>

              {trip.rating && (
                <div className="mt-3 flex items-center">
                  {[...Array(5)].map((_, i) => (
                    i < Math.floor(trip.rating) ? (
                      <StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />
                    ) : (
                      <StarIcon key={i} className="h-5 w-5 text-gray-300" />
                    )
                  ))}
                  <span className="ml-2 text-gray-600">
                    {trip.rating} ({trip.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">About This Experience</h2>
              <p className="text-gray-700 whitespace-pre-line">{trip.description}</p>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">What's Included</h2>
              {trip.included ? (
                <ul className="space-y-2">
                  {trip.included.split('\n').map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">Details will be provided upon booking.</p>
              )}
            </div>

            {/* Provider Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Meet Your Host</h2>
              <div className="flex items-start space-x-4">
                <img
                  src={trip.provider?.avatar || `https://ui-avatars.com/api/?name=${trip.provider?.name}`}
                  alt={trip.provider?.name}
                  className="h-16 w-16 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{trip.provider?.name}</h3>
                  <p className="text-gray-600 mt-1">{trip.provider?.bio}</p>
                  <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                    <span>{trip.provider?.experienceYears} years hosting</span>
                    <span>{trip.provider?.totalTrips} trips</span>
                    {trip.provider?.verified && (
                      <span className="flex items-center text-green-600">
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              {!showCustomization ? (
                <>
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-gray-900">
                      ${trip.basePrice}
                    </div>
                    <div className="text-gray-600">per person</div>
                  </div>

                  {trip.customizableComponents && (
                    <div className="mb-6 p-4 bg-primary-50 rounded-lg">
                      <p className="text-sm text-primary-700 font-medium">
                        ✨ This trip can be customized!
                      </p>
                      <p className="text-sm text-primary-600 mt-1">
                        Add accommodation, activities, and more
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleStartCustomization}
                    className="w-full btn-primary"
                  >
                    {trip.customizableComponents ? 'Customize & Book' : 'Book Now'}
                  </button>

                  <button className="w-full btn-secondary mt-3">
                    <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                    Message Host
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Customize Your Trip</h3>
                  
                  {/* Number of Travelers */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Travelers
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={trip.maxGroupSize}
                      value={customization.travelers}
                      onChange={(e) => setCustomization({...customization, travelers: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  {/* Travel Dates */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Travel Dates
                    </label>
                    <input
                      type="date"
                      value={customization.dates}
                      onChange={(e) => setCustomization({...customization, dates: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  {/* Accommodation Option */}
                  {trip.customizableComponents?.accommodation && (
                    <div>
                      <label className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={customization.includeAccommodation}
                          onChange={(e) => setCustomization({...customization, includeAccommodation: e.target.checked})}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          Include Accommodation
                        </span>
                      </label>
                      
                      {customization.includeAccommodation && (
                        <select
                          value={customization.accommodationType}
                          onChange={(e) => setCustomization({...customization, accommodationType: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select type</option>
                          <option value="budget">Budget ($30/night)</option>
                          <option value="standard">Standard ($60/night)</option>
                          <option value="luxury">Luxury ($150/night)</option>
                        </select>
                      )}
                    </div>
                  )}

                  {/* Additional Activities */}
                  {trip.customizableComponents?.activities && (
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={customization.additionalActivities}
                          onChange={(e) => setCustomization({...customization, additionalActivities: e.target.checked})}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          Add Extra Activities (+$50/person)
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Price Summary */}
                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Base trip ({customization.travelers} × ${trip.basePrice})</span>
                        <span>${trip.basePrice * customization.travelers}</span>
                      </div>
                      {customization.includeAccommodation && customization.accommodationType && (
                        <div className="flex justify-between text-sm">
                          <span>Accommodation</span>
                          <span>
                            ${customization.accommodationType === 'budget' ? 30 : 
                              customization.accommodationType === 'standard' ? 60 : 150} × {customization.travelers}
                          </span>
                        </div>
                      )}
                      {customization.additionalActivities && (
                        <div className="flex justify-between text-sm">
                          <span>Extra Activities</span>
                          <span>$50 × {customization.travelers}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                        <span>Total</span>
                        <span>${calculateTotalPrice()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleBooking}
                    className="w-full btn-primary"
                    disabled={!customization.dates}
                  >
                    Continue to Booking
                  </button>
                  
                  <button
                    onClick={() => setShowCustomization(false)}
                    className="w-full text-sm text-gray-600 hover:text-gray-800"
                  >
                    Back to Trip Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;