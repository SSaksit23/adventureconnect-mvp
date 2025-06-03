// frontend/src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, MapPinIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated, isProvider } = useAuth();

  const features = [
    {
      name: 'Unique Experiences',
      description: 'Discover one-of-a-kind trips curated by passionate local experts and travel specialists.',
      icon: MapPinIcon,
    },
    {
      name: 'Expert Providers',
      description: 'Connect with verified travel bloggers, guides, and adventure specialists.',
      icon: UserGroupIcon,
    },
    {
      name: 'Flexible Booking',
      description: 'Easy inquiry system with direct communication to customize your perfect trip.',
      icon: CalendarIcon,
    },
    {
      name: 'Trusted Platform',
      description: 'Secure transactions and verified providers for peace of mind.',
      icon: MagnifyingGlassIcon,
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative container-custom py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Discover Unique Travel Experiences
            </h1>
            <p className="mt-6 text-xl text-primary-100 max-w-2xl mx-auto">
              Connect with passionate local experts and specialized travel providers for authentic, 
              off-the-beaten-path adventures.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {isAuthenticated ? (
                isProvider ? (
                  <Link to="/provider/trips/create" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                    Create a Trip
                  </Link>
                ) : (
                  <Link to="/trips" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                    Browse Trips
                  </Link>
                )
              ) : (
                <>
                  <Link to="/trips" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                    Explore Trips
                  </Link>
                  <Link to="/register" className="text-sm font-semibold leading-6 text-white">
                    Become a Provider <span aria-hidden="true">→</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Why Choose AdventureConnect?
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              We're building a community where travel expertise meets wanderlust.
            </p>
          </div>

          <div className="mt-20">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {features.map((feature) => (
                <div key={feature.name} className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50">
        <div className="container-custom py-16 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ready to start your adventure?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Join our community of travelers and providers creating unique travel experiences.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
              <Link to="/trips" className="text-sm font-semibold leading-6 text-gray-900">
                Browse Trips <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;