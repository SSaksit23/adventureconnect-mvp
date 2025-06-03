// frontend/src/pages/TripList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  CalendarIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
  StarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import api from '../services/api';

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    activityType: '',
    priceRange: '',
    duration: '',
    location: ''
  });

  const activityTypes = [
    'All',
    'Adventure',
    'Cultural',
    'Culinary',
    'Nature',
    'Photography',
    'Wellness',
    'Local Experience',
    'Guided Tour'
  ];

  const priceRanges = [
    { label: 'All Prices', value: '' },
    { label: 'Under $50', value: '0-50' },
    { label: '$50 - $100', value: '50-100' },
    { label: '$100 - $200', value: '100-200' },
    { label: '$200+', value: '200+' }
  ];

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, trips]);

  const fetchTrips = async () => {
    try {
      const response = await api.get('/trips');
      setTrips(response.data);
      setFilteredTrips(response.data);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...trips];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(trip => 
        trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Activity type filter
    if (filters.activityType && filters.activityType !== 'All') {
      filtered = filtered.filter(trip => trip.activityType === filters.activityType);
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(trip => {
        if (max) {
          return trip.basePrice >= min && trip.basePrice <= max;
        } else {
          return trip.basePrice >= min;
        }
      });
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(trip => 
        trip.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredTrips(filtered);
  };

  const renderRating = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          i < Math.floor(rating) ? (
            <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
          ) : (
            <StarIcon key={i} className="h-4 w-4 text-gray-300" />
          )
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container-custom py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search destinations, activities, or experiences..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary inline-flex items-center"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={filters.activityType}
                    onChange={(e) => setFilters({...filters, activityType: e.target.value})}
                  >
                    {activityTypes.map(type => (
                      <option key={type} value={type === 'All' ? '' : type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Range
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={filters.priceRange}
                    onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                  >
                    {priceRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter location..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilters({
                        activityType: '',
                        priceRange: '',
                        duration: '',
                        location: ''
                      });
                      setSearchTerm('');
                    }}
                    className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="container-custom py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {searchTerm || filters.activityType || filters.location 
              ? `Search Results (${filteredTrips.length})`
              : `All Experiences (${filteredTrips.length})`
            }
          </h1>
        </div>

        {filteredTrips.length === 0 ? (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No trips found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <Link
                key={trip.id}
                to={`/trips/${trip.id}`}
                className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Trip Image */}
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative overflow-hidden">
                  {trip.images && trip.images[0] ? (
                    <img
                      src={trip.images[0]}
                      alt={trip.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <MapPinIcon className="h-12 w-12 text-white opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-semibold text-gray-700">
                    ${trip.basePrice}
                  </div>
                </div>

                {/* Trip Info */}
                <div className="p-4">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                      {trip.activityType}
                    </span>
                    {trip.customizableComponents && (
                      <span className="ml-2 text-primary-600 text-xs font-medium">
                        Customizable
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {trip.title}
                  </h3>

                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {trip.location}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {trip.duration}
                      </div>
                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        Max {trip.maxGroupSize}
                      </div>
                    </div>
                  </div>

                  {trip.rating && (
                    <div className="mt-3">
                      {renderRating(trip.rating)}
                    </div>
                  )}

                  <div className="mt-3 flex items-center">
                    <img
                      src={trip.provider?.avatar || `https://ui-avatars.com/api/?name=${trip.provider?.name}`}
                      alt={trip.provider?.name}
                      className="h-6 w-6 rounded-full mr-2"
                    />
                    <span className="text-sm text-gray-600">
                      by {trip.provider?.name}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripList;