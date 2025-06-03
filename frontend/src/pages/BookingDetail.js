// frontend/src/pages/BookingDetail.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { bookingService } from '../services/bookings';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isProvider } = useAuth();
  const [providerResponse, setProviderResponse] = useState('');

  const { data, isLoading, refetch } = useQuery(
    ['booking', id],
    () => bookingService.getBooking(id)
  );

  const updateStatusMutation = useMutation(
    ({ status, response }) => bookingService.updateBookingStatus(id, status, response),
    {
      onSuccess: () => {
        toast.success('Booking status updated successfully');
        refetch();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update booking');
      },
    }
  );

  const handleStatusUpdate = (status) => {
    updateStatusMutation.mutate({ status, response: providerResponse });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const booking = data?.booking;

  if (!booking) {
    return (
      <div className="container-custom py-12">
        <p className="text-center text-red-600">Booking not found</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'inquiry':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container-custom py-8">
      <button
        onClick={() => navigate(-1)}
        className="text-gray-600 hover:text-gray-900 mb-4"
      >
        ← Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Status */}
          <div className="card p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold">Booking Details</h1>
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>
            
            <div className="text-sm text-gray-600">
              Booking ID: #{booking.id} • Created on {format(new Date(booking.created_at), 'MMM d, yyyy')}
            </div>
          </div>

          {/* Trip Information */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Trip Information</h2>
            
            <div className="flex items-start space-x-4 mb-4">
              {booking.images?.length > 0 && (
                <img
                  src={`http://localhost:5000${booking.images[0]}`}
                  alt={booking.trip_title}
                  className="w-24 h-24 rounded object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{booking.trip_title}</h3>
                <p className="text-gray-600">{booking.destination}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <div>
                  <p className="text-sm">Travel Dates</p>
                  <p className="font-medium">
                    {format(new Date(booking.start_date), 'MMM d')} - 
                    {format(new Date(booking.end_date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                <div>
                  <p className="text-sm">Participants</p>
                  <p className="font-medium">{booking.num_participants} people</p>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600">
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                <div>
                  <p className="text-sm">Total Price</p>
                  <p className="font-medium">${booking.total_price}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Messages</h2>
            
            {booking.traveler_message && (
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Message from Traveler:
                </p>
                <p className="text-gray-600">{booking.traveler_message}</p>
              </div>
            )}

            {booking.special_requirements && (
              <div className="mb-4 p-4 bg-yellow-50 rounded">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Special Requirements:
                </p>
                <p className="text-gray-600">{booking.special_requirements}</p>
              </div>
            )}

            {booking.provider_response && (
              <div className="p-4 bg-blue-50 rounded">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Provider Response:
                </p>
                <p className="text-gray-600">{booking.provider_response}</p>
              </div>
            )}
          </div>

          {/* Provider Actions */}
          {isProvider && booking.status === 'inquiry' && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Respond to Inquiry</h2>
              
              <div className="mb-4">
                <label className="label">Your Response</label>
                <textarea
                  value={providerResponse}
                  onChange={(e) => setProviderResponse(e.target.value)}
                  rows={4}
                  className="input"
                  placeholder="Write a message to the traveler..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleStatusUpdate('confirmed')}
                  disabled={updateStatusMutation.isLoading}
                  className="btn-primary flex-1"
                >
                  Confirm Booking
                </button>
                <button
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={updateStatusMutation.isLoading}
                  className="btn-outline flex-1"
                >
                  Decline
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Contact Information */}
        <div className="lg:col-span-1">
          {/* Traveler Info (for providers) */}
          {isProvider && (
            <div className="card p-6 mb-6">
              <h3 className="font-semibold mb-4">Traveler Information</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">
                    {booking.traveler_first_name} {booking.traveler_last_name}
                  </p>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  <a href={`mailto:${booking.traveler_email}`} className="text-primary-600 hover:text-primary-700">
                    {booking.traveler_email}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Provider Info (for travelers) */}
          {!isProvider && (
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Provider Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  {booking.provider_image ? (
                    <img
                      src={`http://localhost:5000${booking.provider_image}`}
                      alt={booking.provider_first_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-600">
                        {booking.provider_first_name?.[0]}{booking.provider_last_name?.[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {booking.provider_first_name} {booking.provider_last_name}
                    </p>
                    {booking.business_name && (
                      <p className="text-sm text-gray-600">{booking.business_name}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  <a href={`mailto:${booking.provider_email}`} className="text-primary-600 hover:text-primary-700">
                    Contact Provider
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* What's Included */}
          {booking.included_items?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold mb-4">What's Included</h3>
              <ul className="space-y-2 text-sm">
                {booking.included_items.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;

// frontend/src/pages/provider/Bookings.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { bookingService } from '../../services/bookings';
import { format } from 'date-fns';
import {
  CalendarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const ProviderBookings = () => {
  const { data, isLoading } = useQuery(
    'providerBookings',
    bookingService.getProviderBookings
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'inquiry':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Group bookings by status
  const inquiries = data?.bookings?.filter(b => b.status === 'inquiry') || [];
  const confirmed = data?.bookings?.filter(b => b.status === 'confirmed') || [];
  const other = data?.bookings?.filter(b => !['inquiry', 'confirmed'].includes(b.status)) || [];

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">Booking Management</h1>

      {/* Pending Inquiries */}
      {inquiries.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Pending Inquiries ({inquiries.length})
          </h2>
          <div className="space-y-4">
            {inquiries.map((booking) => (
              <div key={booking.id} className="card p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{booking.trip_title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        {booking.traveler_first_name} {booking.traveler_last_name}
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {format(new Date(booking.start_date), 'MMM d')} - 
                        {format(new Date(booking.end_date), 'MMM d')}
                      </div>
                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        {booking.num_participants} participants
                      </div>
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                        ${booking.total_price}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Received {format(new Date(booking.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                      New Inquiry
                    </span>
                    <Link
                      to={`/provider/bookings/${booking.id}`}
                      className="btn-primary"
                    >
                      Respond
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmed Bookings */}
      {confirmed.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Confirmed Bookings ({confirmed.length})
          </h2>
          <div className="space-y-4">
            {confirmed.map((booking) => (
              <div key={booking.id} className="card p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{booking.trip_title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                      <span>{booking.traveler_first_name} {booking.traveler_last_name}</span>
                      <span>•</span>
                      <span>
                        {format(new Date(booking.start_date), 'MMM d')} - 
                        {format(new Date(booking.end_date), 'MMM d')}
                      </span>
                      <span>•</span>
                      <span>{booking.num_participants} participants</span>
                    </div>
                  </div>
                  <Link
                    to={`/provider/bookings/${booking.id}`}
                    className="text-primary-600 hover:text-primary-700 mt-4 md:mt-0"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Bookings */}
      {other.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Past & Cancelled Bookings
          </h2>
          <div className="space-y-4">
            {other.map((booking) => (
              <div key={booking.id} className="card p-6 opacity-75">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{booking.trip_title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {booking.traveler_first_name} {booking.traveler_last_name} • 
                      {format(new Date(booking.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-2 md:mt-0">
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <Link
                      to={`/provider/bookings/${booking.id}`}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {data?.bookings?.length === 0 && (
        <div className="card p-12 text-center">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No bookings yet
          </h3>
          <p className="text-gray-600">
            When travelers book your trips, they'll appear here
          </p>
        </div>
      )}
    </div>
  );
};

export default ProviderBookings;