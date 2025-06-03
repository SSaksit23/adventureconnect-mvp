// frontend/src/pages/provider/Dashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { tripService } from '../../services/trips';
import { bookingService } from '../../services/bookings';
import { useAuth } from '../../contexts/AuthContext';
import {
  PlusIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

const ProviderDashboard = () => {
  const { user } = useAuth();

  const { data: tripsData, isLoading: tripsLoading } = useQuery(
    'providerTrips',
    tripService.getProviderTrips
  );

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery(
    'providerBookings',
    bookingService.getProviderBookings
  );

  const stats = {
    totalTrips: tripsData?.trips?.length || 0,
    activeTrips: tripsData?.trips?.filter(t => t.status === 'published').length || 0,
    totalBookings: bookingsData?.bookings?.length || 0,
    pendingBookings: bookingsData?.bookings?.filter(b => b.status === 'inquiry').length || 0,
  };

  return (
    <div className="container-custom py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your trips and bookings from your dashboard.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 flex flex-wrap gap-4">
        <Link to="/provider/trips/create" className="btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Create New Trip
        </Link>
        <Link to="/provider/bookings" className="btn-outline">
          View All Bookings
        </Link>
        <Link to="/provider/profile" className="btn-outline">
          Edit Profile
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Trips</p>
              <p className="text-2xl font-semibold">{stats.totalTrips}</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Trips</p>
              <p className="text-2xl font-semibold">{stats.activeTrips}</p>
            </div>
            <EyeIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-semibold">{stats.totalBookings}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Inquiries</p>
              <p className="text-2xl font-semibold">{stats.pendingBookings}</p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Booking Inquiries</h2>
        </div>
        <div className="divide-y">
          {bookingsLoading ? (
            <div className="p-6 text-center">Loading bookings...</div>
          ) : bookingsData?.bookings?.slice(0, 5).map((booking) => (
            <div key={booking.id} className="p-6 flex items-center justify-between">
              <div>
                <p className="font-medium">{booking.trip_title}</p>
                <p className="text-sm text-gray-600">
                  {booking.traveler_first_name} {booking.traveler_last_name} • 
                  {booking.num_participants} participants
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(booking.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs ${
                  booking.status === 'inquiry' ? 'bg-yellow-100 text-yellow-800' :
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {booking.status}
                </span>
                <Link
                  to={`/provider/bookings/${booking.id}`}
                  className="text-primary-600 hover:text-primary-700"
                >
                  View Details
                </Link>
              </div>
            </div>
          )).length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No bookings yet
            </div>
          )}
        </div>
      </div>

      {/* My Trips */}
      <div className="card">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">My Trips</h2>
        </div>
        <div className="divide-y">
          {tripsLoading ? (
            <div className="p-6 text-center">Loading trips...</div>
          ) : tripsData?.trips?.map((trip) => (
            <div key={trip.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {trip.images?.length > 0 ? (
                  <img
                    src={`http://localhost:5000${trip.images[0]}`}
                    alt={trip.title}
                    className="w-16 h-16 rounded object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-gray-200"></div>
                )}
                <div>
                  <p className="font-medium">{trip.title}</p>
                  <p className="text-sm text-gray-600">
                    {trip.destination} • {trip.duration_days} days • ${trip.price_per_person}
                  </p>
                  <p className="text-sm text-gray-500">
                    {trip.booking_count || 0} bookings
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs ${
                  trip.status === 'published' ? 'bg-green-100 text-green-800' :
                  trip.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {trip.status}
                </span>
                <Link
                  to={`/provider/trips/${trip.id}/edit`}
                  className="text-primary-600 hover:text-primary-700"
                >
                  <PencilIcon className="h-5 w-5" />
                </Link>
              </div>
            </div>
          )).length === 0 && (
            <div className="p-6 text-center">
              <p className="text-gray-500 mb-4">You haven't created any trips yet</p>
              <Link to="/provider/trips/create" className="btn-primary">
                Create Your First Trip
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;