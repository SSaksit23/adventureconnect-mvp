// frontend/src/pages/ProviderDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  PlusIcon, 
  MapPinIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTrips: 0,
    activeBookings: 0,
    totalRevenue: 0,
    avgRating: 0
  });
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviderData();
  }, []);

  const fetchProviderData = async () => {
    try {
      const [statsRes, tripsRes] = await Promise.all([
        api.get('/providers/stats'),
        api.get('/providers/trips')
      ]);
      
      setStats(statsRes.data);
      setTrips(tripsRes.data);
    } catch (error) {
      console.error('Error fetching provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Trips',
      value: stats.totalTrips,
      icon: MapPinIcon,
      bgColor: 'bg-blue-500',
    },
    {
      name: 'Active Bookings',
      value: stats.activeBookings,
      icon: CalendarIcon,
      bgColor: 'bg-green-500',
    },
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      bgColor: 'bg-yellow-500',
    },
    {
      name: 'Average Rating',
      value: stats.avgRating.toFixed(1),
      icon: ChartBarIcon,
      bgColor: 'bg-purple-500',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your trips and track your performance
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              to="/provider/trips/create"
              className="btn-primary inline-flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create New Trip
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${stat.bgColor} rounded-md p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Trips */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Trips</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trips.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium">No trips yet</p>
                      <p className="mt-1">Get started by creating your first trip.</p>
                      <Link
                        to="/provider/trips/create"
                        className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-500"
                      >
                        <PlusIcon className="h-5 w-5 mr-1" />
                        Create Trip
                      </Link>
                    </td>
                  </tr>
                ) : (
                  trips.map((trip) => (
                    <tr key={trip.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {trip.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {trip.activityType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {trip.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${trip.basePrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <UserGroupIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {trip.bookingCount || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          trip.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/provider/trips/${trip.id}/edit`}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/trips/${trip.id}`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;