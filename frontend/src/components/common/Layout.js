// frontend/src/components/common/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

// frontend/src/components/common/PrivateRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ userType }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userType && user?.user_type !== userType) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;

// frontend/src/components/common/Navbar.js
import React, { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigation = [
    { name: 'Browse Trips', href: '/trips', current: false },
  ];

  const userNavigation = user?.user_type === 'provider' ? [
    { name: 'Dashboard', href: '/provider/dashboard' },
    { name: 'My Trips', href: '/provider/dashboard' },
    { name: 'Bookings', href: '/provider/bookings' },
    { name: 'Profile', href: '/provider/profile' },
  ] : [
    { name: 'Dashboard', href: '/traveler/dashboard' },
    { name: 'My Bookings', href: '/traveler/bookings' },
  ];

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="container-custom">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/" className="text-xl font-bold text-primary-600">
                    AdventureConnect
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={classNames(
                          item.current
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                          'rounded-md px-3 py-2 text-sm font-medium'
                        )}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {isAuthenticated ? (
                  <>
                    {user?.user_type === 'provider' && (
                      <Link
                        to="/provider/trips/create"
                        className="btn-primary mr-3"
                      >
                        Create Trip
                      </Link>
                    )}
                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                          <span className="sr-only">Open user menu</span>
                          <UserCircleIcon className="h-8 w-8 text-gray-400" />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="px-4 py-2 text-sm text-gray-700 border-b">
                            {user?.first_name} {user?.last_name}
                            <div className="text-xs text-gray-500">
                              {user?.user_type === 'provider' ? 'Provider' : 'Traveler'}
                            </div>
                          </div>
                          {userNavigation.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <Link
                                  to={item.href}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}
                                >
                                  {item.name}
                                </Link>
                              )}
                            </Menu.Item>
                          ))}
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={handleLogout}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block w-full text-left px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link to="/login" className="text-gray-700 hover:text-gray-900">
                      Sign in
                    </Link>
                    <Link to="/register" className="btn-primary">
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                    'block rounded-md px-3 py-2 text-base font-medium'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <hr className="my-2" />
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      {item.name}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;

// frontend/src/components/common/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <h3 className="text-lg font-bold text-primary-600 mb-4">AdventureConnect</h3>
            <p className="text-gray-600 text-sm">
              Connecting travelers with unique, specialized travel experiences from passionate local experts.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">For Travelers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/trips" className="text-gray-600 hover:text-gray-900">Browse Trips</Link></li>
              <li><Link to="/register" className="text-gray-600 hover:text-gray-900">Sign Up</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">For Providers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register" className="text-gray-600 hover:text-gray-900">Become a Provider</Link></li>
              <li><Link to="/provider/dashboard" className="text-gray-600 hover:text-gray-900">Provider Dashboard</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Help Center</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            © 2024 AdventureConnect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;