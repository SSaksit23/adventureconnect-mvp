// frontend/src/pages/BookingRequest.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  CreditCardIcon,
  LockClosedIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const BookingRequest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || ''
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const bookingData = location.state?.bookingData;

  if (!bookingData) {
    navigate('/trips');
    return null;
  }

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // In a real implementation, this would:
      // 1. Create a payment intent with Stripe/PayPal
      // 2. Process the payment
      // 3. Create the booking in the database
      
      const bookingPayload = {
        ...bookingData,
        travelerInfo: data,
        paymentMethod,
        specialRequests: data.specialRequests
      };

      const response = await api.post('/bookings', bookingPayload);
      
      // Redirect to confirmation page
      navigate('/booking/confirmation', { 
        state: { 
          bookingId: response.data.id,
          booking: response.data 
        } 
      });
    } catch (error) {
      console.error('Booking error:', error);
      // Handle error - show error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Traveler Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Traveler Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      {...register('firstName', { required: 'First name is required' })}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      {...register('lastName', { required: 'Last name is required' })}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      {...register('phone', { required: 'Phone number is required' })}
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Additional Travelers */}
                {bookingData.customization.travelers > 1 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Additional Travelers</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Please provide names for all {bookingData.customization.travelers} travelers
                    </p>
                    {[...Array(bookingData.customization.travelers - 1)].map((_, idx) => (
                      <div key={idx} className="grid grid-cols-2 gap-4 mb-3">
                        <input
                          {...register(`additionalTravelers.${idx}.firstName`)}
                          type="text"
                          placeholder={`Traveler ${idx + 2} First Name`}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <input
                          {...register(`additionalTravelers.${idx}.lastName`)}
                          type="text"
                          placeholder={`Traveler ${idx + 2} Last Name`}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Special Requests */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    {...register('specialRequests')}
                    rows={3}
                    placeholder="Any dietary restrictions, accessibility needs, or special requests..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                
                <div className="space-y-3">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <CreditCardIcon className="h-6 w-6 mr-3 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium">Credit/Debit Card</p>
                      <p className="text-sm text-gray-500">Secure payment via Stripe</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div className="h-6 w-6 mr-3 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                      PP
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">PayPal</p>
                      <p className="text-sm text-gray-500">Pay with your PayPal account</p>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'card' && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-3">
                      You will be redirected to our secure payment page to complete your booking.
                    </p>
                    {/* In real implementation, integrate Stripe Elements here */}
                  </div>
                )}
              </div>

              {/* Terms & Conditions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <label className="flex items-start">
                  <input
                    {...register('agreeToTerms', { 
                      required: 'You must agree to the terms and conditions' 
                    })}
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-500">
                      Terms and Conditions
                    </a>
                    {' '}and{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-500">
                      Cancellation Policy
                    </a>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary inline-flex items-center"
                >
                  <LockClosedIcon className="h-5 w-5 mr-2" />
                  {loading ? 'Processing...' : `Pay $${bookingData.totalPrice}`}
                </button>
              </div>
            </form>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
              
              {/* Trip Info */}
              <div className="pb-4 border-b">
                <h3 className="font-medium text-gray-900 mb-2">Trip Details</h3>
                <p className="text-sm text-gray-600">Trip ID: {bookingData.tripId}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Date: {bookingData.customization.dates || 'Flexible'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Travelers: {bookingData.customization.travelers}
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="py-4 space-y-2">
                <h3 className="font-medium text-gray-900 mb-2">Price Breakdown</h3>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base trip</span>
                  <span className="font-medium">
                    ${(bookingData.totalPrice / bookingData.customization.travelers).toFixed(2)} × {bookingData.customization.travelers}
                  </span>
                </div>

                {bookingData.customization.includeAccommodation && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Accommodation</span>
                    <span className="font-medium">Included</span>
                  </div>
                )}

                {bookingData.customization.additionalActivities && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Extra Activities</span>
                    <span className="font-medium">Included</span>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold text-lg">${bookingData.totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">Secure Booking</p>
                    <p className="text-xs text-green-700 mt-1">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">Flexible Cancellation</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Free cancellation up to 48 hours before the trip
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingRequest;