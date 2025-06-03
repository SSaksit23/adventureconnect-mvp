// frontend/src/pages/CreateTrip.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  MapPinIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PhotoIcon,
  ClockIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

const CreateTrip = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);

  const tripType = watch('tripType');

  const steps = [
    { id: 1, name: 'Basic Info' },
    { id: 2, name: 'Details' },
    { id: 3, name: 'Pricing' },
    { id: 4, name: 'Review' }
  ];

  const activityTypes = [
    'Adventure',
    'Cultural',
    'Culinary',
    'Nature',
    'Photography',
    'Wellness',
    'Local Experience',
    'Guided Tour'
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // In real implementation, upload to server and get URLs
    const newImages = files.map(file => URL.createObjectURL(file));
    setUploadedImages([...uploadedImages, ...newImages]);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const tripData = {
        ...data,
        images: uploadedImages,
        // For Phase 1, we'll focus on simple service components
        customizableComponents: {
          accommodation: data.includeAccommodation,
          activities: data.includeActivities
        }
      };

      await api.post('/trips', tripData);
      navigate('/provider/dashboard');
    } catch (error) {
      console.error('Error creating trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-4xl">
        {/* Progress Steps */}
        <nav aria-label="Progress" className="mb-8">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li key={step.name} className={stepIdx !== steps.length - 1 ? 'flex-1' : ''}>
                <div className="flex items-center">
                  <span className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step.id 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckIcon className="w-6 h-6" />
                    ) : (
                      step.id
                    )}
                  </span>
                  <span className={`ml-3 text-sm font-medium ${
                    currentStep >= step.id ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                  {stepIdx !== steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-primary-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </nav>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white shadow-sm rounded-lg p-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trip Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        {...register('tripType', { required: 'Please select trip type' })}
                        type="radio"
                        value="service_component"
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium">Service Component</p>
                        <p className="text-sm text-gray-500">Individual service (accommodation, activity, guide)</p>
                      </div>
                    </label>
                    <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        {...register('tripType', { required: 'Please select trip type' })}
                        type="radio"
                        value="example_itinerary"
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium">Example Itinerary</p>
                        <p className="text-sm text-gray-500">Complete trip package with multiple components</p>
                      </div>
                    </label>
                  </div>
                  {errors.tripType && (
                    <p className="mt-1 text-sm text-red-600">{errors.tripType.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    type="text"
                    className="input"
                    placeholder="e.g., 'Sunset Photography Tour in Bangkok'"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...register('location', { required: 'Location is required' })}
                      type="text"
                      className="input pl-10"
                      placeholder="e.g., Bangkok, Thailand"
                    />
                  </div>
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Type
                  </label>
                  <select
                    {...register('activityType', { required: 'Activity type is required' })}
                    className="input"
                  >
                    <option value="">Select activity type</option>
                    {activityTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.activityType && (
                    <p className="mt-1 text-sm text-red-600">{errors.activityType.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Trip Details</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={6}
                    className="input"
                    placeholder="Describe your trip experience, what makes it unique, what travelers can expect..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <ClockIcon className="inline h-4 w-4 mr-1" />
                      Duration
                    </label>
                    <input
                      {...register('duration', { required: 'Duration is required' })}
                      type="text"
                      className="input"
                      placeholder="e.g., 4 hours, 2 days"
                    />
                    {errors.duration && (
                      <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <UserGroupIcon className="inline h-4 w-4 mr-1" />
                      Max Group Size
                    </label>
                    <input
                      {...register('maxGroupSize', { 
                        required: 'Group size is required',
                        min: { value: 1, message: 'Must be at least 1' }
                      })}
                      type="number"
                      className="input"
                      placeholder="e.g., 8"
                    />
                    {errors.maxGroupSize && (
                      <p className="mt-1 text-sm text-red-600">{errors.maxGroupSize.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's Included
                  </label>
                  <textarea
                    {...register('included')}
                    rows={3}
                    className="input"
                    placeholder="List what's included in the price (e.g., Transportation, Meals, Equipment)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <PhotoIcon className="inline h-4 w-4 mr-1" />
                    Photos
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                          <span>Upload photos</span>
                          <input
                            type="file"
                            className="sr-only"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                  {uploadedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-4">
                      {uploadedImages.map((image, idx) => (
                        <img
                          key={idx}
                          src={image}
                          alt={`Upload ${idx + 1}`}
                          className="h-24 w-full object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Pricing */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing & Customization</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CurrencyDollarIcon className="inline h-4 w-4 mr-1" />
                    Base Price (per person)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      {...register('basePrice', { 
                        required: 'Price is required',
                        min: { value: 1, message: 'Price must be positive' }
                      })}
                      type="number"
                      step="0.01"
                      className="input pl-8"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.basePrice && (
                    <p className="mt-1 text-sm text-red-600">{errors.basePrice.message}</p>
                  )}
                </div>

                {/* Phase 1: Simple customization options */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Customizable Components</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Select which components travelers can customize for this trip
                  </p>
                  
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        {...register('includeAccommodation')}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-3">
                        <span className="font-medium">Accommodation Options</span>
                        <span className="block text-sm text-gray-500">
                          Allow travelers to add/customize accommodation
                        </span>
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        {...register('includeActivities')}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-3">
                        <span className="font-medium">Additional Activities</span>
                        <span className="block text-sm text-gray-500">
                          Allow travelers to add extra activities or guides
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select {...register('availability')} className="input">
                    <option value="daily">Available Daily</option>
                    <option value="weekends">Weekends Only</option>
                    <option value="specific">Specific Dates</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Listing</h2>
                
                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Basic Information</h3>
                    <dl className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Title:</dt>
                        <dd className="text-sm font-medium">{watch('title')}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Location:</dt>
                        <dd className="text-sm font-medium">{watch('location')}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Type:</dt>
                        <dd className="text-sm font-medium">{watch('activityType')}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900">Details</h3>
                    <dl className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Duration:</dt>
                        <dd className="text-sm font-medium">{watch('duration')}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Max Group Size:</dt>
                        <dd className="text-sm font-medium">{watch('maxGroupSize')}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900">Pricing</h3>
                    <dl className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Base Price:</dt>
                        <dd className="text-sm font-medium">${watch('basePrice')}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Your listing will be reviewed by our team before going live. 
                    This typically takes 24-48 hours.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-secondary"
                >
                  Previous
                </button>
              )}
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary ml-auto"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary ml-auto"
                >
                  {loading ? 'Creating...' : 'Create Trip'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTrip;