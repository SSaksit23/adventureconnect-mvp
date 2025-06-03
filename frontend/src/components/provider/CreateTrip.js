// frontend/src/pages/provider/CreateTrip.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { tripService } from '../../services/trips';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  MinusIcon,
  PhotoIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const CreateTrip = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      includedItems: [''],
      excludedItems: [''],
      tripDates: [{ startDate: '', endDate: '' }],
      itinerary: [{ day: 'Day 1', activities: '' }],
    },
  });

  const { fields: includedFields, append: appendIncluded, remove: removeIncluded } = useFieldArray({
    control,
    name: 'includedItems',
  });

  const { fields: excludedFields, append: appendExcluded, remove: removeExcluded } = useFieldArray({
    control,
    name: 'excludedItems',
  });

  const { fields: dateFields, append: appendDate, remove: removeDate } = useFieldArray({
    control,
    name: 'tripDates',
  });

  const { fields: itineraryFields, append: appendItinerary, remove: removeItinerary } = useFieldArray({
    control,
    name: 'itinerary',
  });

  const createTripMutation = useMutation(tripService.createTrip, {
    onSuccess: (data) => {
      toast.success('Trip created successfully!');
      navigate('/provider/dashboard');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create trip');
    },
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const onSubmit = (data) => {
    // Transform itinerary array to object
    const itineraryObj = {};
    data.itinerary.forEach(item => {
      if (item.day && item.activities) {
        itineraryObj[item.day] = item.activities;
      }
    });

    const tripData = {
      ...data,
      includedItems: data.includedItems.filter(item => item.trim() !== ''),
      excludedItems: data.excludedItems.filter(item => item.trim() !== ''),
      itinerary: itineraryObj,
      images: images,
    };

    createTripMutation.mutate(tripData);
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Trip</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="label">Trip Title *</label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  className="input"
                  placeholder="e.g., Northern Thailand Hill Tribe Adventure"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="label">Destination *</label>
                <input
                  {...register('destination', { required: 'Destination is required' })}
                  className="input"
                  placeholder="e.g., Chiang Mai, Thailand"
                />
                {errors.destination && <p className="text-red-500 text-sm mt-1">{errors.destination.message}</p>}
              </div>

              <div>
                <label className="label">Duration (days) *</label>
                <input
                  {...register('durationDays', { 
                    required: 'Duration is required',
                    min: { value: 1, message: 'Duration must be at least 1 day' }
                  })}
                  type="number"
                  className="input"
                  placeholder="e.g., 7"
                />
                {errors.durationDays && <p className="text-red-500 text-sm mt-1">{errors.durationDays.message}</p>}
              </div>

              <div>
                <label className="label">Max Participants *</label>
                <input
                  {...register('maxParticipants', { 
                    required: 'Max participants is required',
                    min: { value: 1, message: 'Must allow at least 1 participant' }
                  })}
                  type="number"
                  className="input"
                  placeholder="e.g., 12"
                />
                {errors.maxParticipants && <p className="text-red-500 text-sm mt-1">{errors.maxParticipants.message}</p>}
              </div>

              <div>
                <label className="label">Price per Person (USD) *</label>
                <input
                  {...register('pricePerPerson', { 
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' }
                  })}
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="e.g., 599.00"
                />
                {errors.pricePerPerson && <p className="text-red-500 text-sm mt-1">{errors.pricePerPerson.message}</p>}
              </div>

              <div>
                <label className="label">Activity Type</label>
                <select {...register('activityType')} className="input">
                  <option value="">Select type</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Culinary">Culinary</option>
                  <option value="Wildlife">Wildlife</option>
                  <option value="Wellness">Wellness</option>
                  <option value="Photography">Photography</option>
                  <option value="Hiking">Hiking</option>
                  <option value="Water Sports">Water Sports</option>
                </select>
              </div>

              <div>
                <label className="label">Difficulty Level</label>
                <select {...register('difficultyLevel')} className="input">
                  <option value="">Select level</option>
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Challenging">Challenging</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="label">Description *</label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={6}
                  className="input"
                  placeholder="Describe your trip in detail..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          {/* Trip Dates */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Available Dates</h2>
              <button
                type="button"
                onClick={() => appendDate({ startDate: '', endDate: '' })}
                className="btn-outline text-sm"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Date
              </button>
            </div>

            <div className="space-y-4">
              {dateFields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <label className="label">Start Date</label>
                    <input
                      {...register(`tripDates.${index}.startDate`)}
                      type="date"
                      className="input"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="label">End Date</label>
                    <input
                      {...register(`tripDates.${index}.endDate`)}
                      type="date"
                      className="input"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDate(index)}
                    className="mt-8 text-red-600 hover:text-red-700"
                  >
                    <MinusIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Itinerary */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Itinerary</h2>
              <button
                type="button"
                onClick={() => appendItinerary({ day: `Day ${itineraryFields.length + 1}`, activities: '' })}
                className="btn-outline text-sm"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Day
              </button>
            </div>

            <div className="space-y-4">
              {itineraryFields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-start">
                  <div className="w-32">
                    <label className="label">Day</label>
                    <input
                      {...register(`itinerary.${index}.day`)}
                      className="input"
                      placeholder="Day 1"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="label">Activities</label>
                    <textarea
                      {...register(`itinerary.${index}.activities`)}
                      rows={2}
                      className="input"
                      placeholder="Describe the day's activities..."
                    />
                  </div>
                  {itineraryFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItinerary(index)}
                      className="mt-8 text-red-600 hover:text-red-700"
                    >
                      <MinusIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* What's Included */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">What's Included</h2>
              <button
                type="button"
                onClick={() => appendIncluded('')}
                className="btn-outline text-sm"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              {includedFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`includedItems.${index}`)}
                    className="input"
                    placeholder="e.g., All meals"
                  />
                  {includedFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIncluded(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <MinusIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* What's Not Included */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">What's Not Included</h2>
              <button
                type="button"
                onClick={() => appendExcluded('')}
                className="btn-outline text-sm"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              {excludedFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`excludedItems.${index}`)}
                    className="input"
                    placeholder="e.g., International flights"
                  />
                  {excludedFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExcluded(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <MinusIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Trip Images</h2>
            
            <div className="mb-4">
              <label className="block">
                <span className="sr-only">Choose images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary-50 file:text-primary-700
                    hover:file:bg-primary-100"
                />
              </label>
              <p className="text-sm text-gray-500 mt-1">Upload up to 10 images (JPG, PNG, WebP)</p>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={createTripMutation.isLoading}
              className="btn-primary flex-1"
            >
              {createTripMutation.isLoading ? 'Creating...' : 'Create Trip'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/provider/dashboard')}
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

export default CreateTrip;