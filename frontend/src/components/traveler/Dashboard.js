// frontend/src/pages/traveler/Dashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { bookingService } from '../../services/bookings';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const TravelerDashboard = () => {
  const { user } = useAuth();
  
  const { data: bookingsData, isLoading } = useQuery(
    'travelerBookings',
    bookingService.getTravelerBookings
  );

  const upcomingBookings = bookingsData?.bookings?.filter(
    b => new Date(b.start_date) > new Date() && b.status === 'confirmed'
  ) || [];

  const pendingBookings = bookingsData?.bookings?.filter(
    b => b.status === 'inquiry' || b.status === 'pending'
  ) || [];

  return (
    <div className="container-custom py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Your adventure dashboard
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/trips" className="card p-6 hover:shadow-lg transition-shadow">
          <MagnifyingGlassIcon className="h-8 w-8 text-primary-600 mb-4" />
          <h3 className="font-semibold mb-2">Explore Trips</h3>
          <p className="text-sm text-gray-600">
            Discover new adventures from expert providers
          </p>
        </Link>

        <Link to="/traveler/bookings" className="card p-6 hover:shadow-lg transition-shadow">
          <CalendarIcon className="h-8 w-8 text-green-600 mb-4" />
          <h3 className="font-semibold mb-2">My Bookings</h3>
          <p className="text-sm text-gray-600">
            View all your bookings and inquiries
          </p>
        </Link>

        <div className="card p-6 bg-gray-50">
          <ClockIcon className="h-8 w-8 text-blue-600 mb-4" />
          <h3 className="font-semibold mb-2">Coming Soon</h3>
          <p className="text-sm text-gray-600">
            Saved trips and travel preferences
          </p>
        </div>
      </div>

      {/* Upcoming Trips */}
      {upcomingBookings.length > 0 && (
        <div className="card mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Upcoming Adventures</h2>
          </div>
          <div className="divide-y">
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-lg">{booking.trip_title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {format(new Date(booking.start_date), 'MMM d')} - 
                        {format(new Date(booking.end_date), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {booking.destination}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Hosted by {booking.business_name || `${booking.provider_first_name} ${booking.provider_last_name}`}
                    </p>
                  </div>
                  <Link
                    to={`/traveler/bookings/${booking.id}`}
                    className="btn-primary"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Inquiries */}
      {pendingBookings.length > 0 && (
        <div className="card">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Pending Inquiries</h2>
          </div>
          <div className="divide-y">
            {pendingBookings.map((booking) => (
              <div key={booking.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{booking.trip_title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Requested on {format(new Date(booking.created_at), 'MMM d, yyyy')}
                    </p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs ${
                      booking.status === 'inquiry' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {booking.status === 'inquiry' ? 'Awaiting Response' : 'Pending Confirmation'}
                    </span>
                  </div>
                  <Link
                    to={`/traveler/bookings/${booking.id}`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && bookingsData?.bookings?.length === 0 && (
        <div className="card p-12 text-center">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No bookings yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start exploring unique trips from our expert providers
          </p>
          <Link to="/trips" className="btn-primary">
            Browse Trips
          </Link>
        </div>
      )}
    </div>
  );
};

export default TravelerDashboard;

// frontend/src/pages/traveler/Bookings.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { bookingService } from '../../services/bookings';
import { format } from 'date-fns';
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const TravelerBookings = () => {
  const { data, isLoading } = useQuery(
    'travelerBookings',
    bookingService.getTravelerBookings
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

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      {data?.bookings?.length === 0 ? (
        <div className="card p-12 text-center">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No bookings yet
          </h3>
          <p className="text-gray-600 mb-6">
            When you book a trip, it will appear here
          </p>
          <Link to="/trips" className="btn-primary">
            Explore Trips
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {data?.bookings?.map((booking) => (
            <div key={booking.id} className="card">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{booking.trip_title}</h2>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  {booking.images?.length > 0 && (
                    <img
                      src={`http://localhost:5000${booking.images[0]}`}
                      alt={booking.trip_title}
                      className="w-full md:w-32 h-32 object-cover rounded mt-4 md:mt-0"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <span>
                      {format(new Date(booking.start_date), 'MMM d')} - 
                      {format(new Date(booking.end_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span>{booking.destination}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    <span>{booking.num_participants} participants</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                    <span>${booking.total_price}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Provider: {booking.business_name || `${booking.provider_first_name} ${booking.provider_last_name}`}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Booked on {format(new Date(booking.created_at), 'MMM d, yyyy')}
                    </p>
                    <Link
                      to={`/traveler/bookings/${booking.id}`}
                      className="btn-primary"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TravelerBookings;