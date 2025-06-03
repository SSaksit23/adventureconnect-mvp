// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Home from './pages/Home.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import ProviderDashboard from './pages/ProviderDashboard.js';
import CreateTrip from './pages/CreateTrip.js';
import TripList from './pages/TripList.js';
import TripDetail from './pages/TripDetail.js';
import BookingRequest from './pages/BookingRequest.js';

// Components
const PrivateRoute = ({ children, providerOnly = false }) => {
  const { isAuthenticated, isProvider, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (providerOnly && !isProvider) {
    return <Navigate to="/" />;
  }

  return children;
};

const Navbar = () => {
  const { isAuthenticated, isProvider, user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            AdventureConnect
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/trips" className="text-gray-700 hover:text-primary-600">
              Browse Trips
            </Link>

            {isAuthenticated ? (
              <>
                {isProvider && (
                  <>
                    <Link to="/provider/dashboard" className="text-gray-700 hover:text-primary-600">
                      Dashboard
                    </Link>
                    <Link to="/provider/trips/create" className="btn-primary text-sm">
                      Create Trip
                    </Link>
                  </>
                )}
                
                <div className="relative group">
                  <button className="flex items-center text-gray-700 hover:text-primary-600">
                    <span className="mr-1">{user?.firstName}</span>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 invisible group-hover:visible">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    {!isProvider && (
                      <Link to="/bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        My Bookings
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/trips" element={<TripList />} />
            <Route path="/trips/:id" element={<TripDetail />} />
            
            {/* Protected Routes - Any authenticated user */}
            <Route
              path="/booking/request"
              element={
                <PrivateRoute>
                  <BookingRequest />
                </PrivateRoute>
              }
            />
            
            {/* Provider Only Routes */}
            <Route
              path="/provider/dashboard"
              element={
                <PrivateRoute providerOnly>
                  <ProviderDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/provider/trips/create"
              element={
                <PrivateRoute providerOnly>
                  <CreateTrip />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;