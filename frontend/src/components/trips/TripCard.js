// frontend/src/components/trips/TripCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const TripCard = ({ trip }) => {
  return (
    <Link to={`/trips/${trip.id}`} className="card hover:shadow-lg transition-shadow">
      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
        {trip.images?.length > 0 ? (
          <img
            src={`http://localhost:5000${trip.images[0]}`}
            alt={trip.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center">
            <p className="text-gray-500">No image</p>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{trip.title}</h3>
        
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPinIcon className="h-4 w-4 mr-1" />
          {trip.destination}
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <ClockIcon className="h-4 w-4 mr-1" />
            {trip.duration_days} days
          </div>
          <div className="flex items-center font-semibold">
            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
            ${trip.price_per_person}
          </div>
        </div>
        
        {trip.business_name && (
          <p className="text-xs text-gray-500 mt-2">by {trip.business_name}</p>
        )}
      </div>
    </Link>
  );
};

export default TripCard;

// frontend/src/components/trips/TripFilters.js
import React from 'react';

const TripFilters = ({ filters, onFilterChange }) => {
  const activityTypes = [
    'Adventure',
    'Cultural',
    'Culinary',
    'Wildlife',
    'Wellness',
    'Photography',
    'Hiking',
    'Water Sports',
  ];

  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      destination: '',
      activityType: '',
      minPrice: '',
      maxPrice: '',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-4">
        {/* Activity Type */}
        <div>
          <label className="label">Activity Type</label>
          <select
            value={filters.activityType}
            onChange={(e) => handleChange('activityType', e.target.value)}
            className="input"
          >
            <option value="">All Types</option>
            {activityTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="label">Price Range</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              className="input"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              className="input"
            />
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="label">Travel Dates</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="input mb-2"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="input"
            min={filters.startDate}
          />
        </div>
      </div>
    </div>
  );
};

export default TripFilters;

// frontend/src/components/trips/BookingModal.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { format } from 'date-fns';
import { bookingService } from '../../services/bookings';
import toast from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';

const BookingModal = ({ trip, selectedDate, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    numParticipants: 1,
    message: '',
    specialRequirements: '',
  });

  const bookingMutation = useMutation(bookingService.createInquiry, {
    onSuccess: (data) => {
      toast.success('Booking inquiry sent successfully!');
      onClose();
      navigate('/traveler/bookings');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to send booking inquiry');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    bookingMutation.mutate({
      tripId: trip.id,
      tripDateId: selectedDate.id,
      numParticipants: parseInt(formData.numParticipants),
      message: formData.message,
      specialRequirements: formData.specialRequirements,
    });
  };

  const totalPrice = trip.price_per_person * formData.numParticipants;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Request to Book</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Trip Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">{trip.title}</h3>
            <p className="text-sm text-gray-600">
              {format(new Date(selectedDate.start_date), 'MMM d')} - 
              {format(new Date(selectedDate.end_date), 'MMM d, yyyy')}
            </p>
            <p className="text-sm text-gray-600">{trip.destination}</p>
          </div>

          {/* Number of Participants */}
          <div className="mb-4">
            <label className="label">Number of Participants</label>
            <select
              value={formData.numParticipants}
              onChange={(e) => setFormData({ ...formData, numParticipants: e.target.value })}
              className="input"
              required
            >
              {[...Array(Math.min(selectedDate.available_spots, trip.max_participants))].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i === 0 ? 'person' : 'people'}
                </option>
              ))}
            </select>
          </div>

          {/* Message to Provider */}
          <div className="mb-4">
            <label className="label">Message to Provider (Optional)</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="input"
              placeholder="Tell the provider about yourself and why you're interested in this trip..."
            />
          </div>

          {/* Special Requirements */}
          <div className="mb-6">
            <label className="label">Special Requirements (Optional)</label>
            <textarea
              value={formData.specialRequirements}
              onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
              rows={3}
              className="input"
              placeholder="Dietary restrictions, medical conditions, etc."
            />
          </div>

          {/* Price Summary */}
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between mb-2">
              <span>${trip.price_per_person} × {formData.numParticipants} participants</span>
              <span className="font-semibold">${totalPrice}</span>
            </div>
            <p className="text-sm text-gray-600">
              * Final payment will be processed after the provider confirms your booking
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={bookingMutation.isLoading}
              className="btn-primary flex-1"
            >
              {bookingMutation.isLoading ? 'Sending...' : 'Send Booking Request'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;