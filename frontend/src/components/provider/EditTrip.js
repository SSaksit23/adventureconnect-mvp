// frontend/src/pages/provider/EditTrip.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import { tripService } from '../../services/trips';
import toast from 'react-hot-toast';

const EditTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  // Fetch trip data
  const { data, isLoading } = useQuery(
    ['trip', id],
    () => tripService.getTrip(id)
  );

  // Set form values when data is loaded
  useEffect(() => {
    if (data?.trip) {
      const trip = data.trip;
      setValue('title', trip.title);
      setValue('description', trip.description);
      setValue('destination', trip.destination);
      setValue('durationDays', trip.duration_days);
      setValue('maxParticipants', trip.max_participants);
      setValue('pricePerPerson', trip.price_per_person);
      setValue('activityType', trip.activity_type || '');
      setValue('difficultyLevel', trip.difficulty_level || '');
      setValue('status', trip.status);
    }
  }, [data, setValue]);

  const updateTripMutation = useMutation(
    (tripData) => tripService.updateTrip(id, tripData),
    {
      onSuccess: () => {
        toast.success('Trip updated successfully!');
        navigate('/provider/dashboard');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update trip');
      },
    }
  );

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setNewImagePreviews(previews);
  };

  const onSubmit = (formData) => {
    const tripData = {
      ...formData,
      images: newImages,
    };

    updateTripMutation.mutate(tripData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const trip = data?.trip;

  if (!trip) {
    return (
      <div className="container-custom py-12">
        <p className="text-center text-red-600">Trip not found</p>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Trip</h1>

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
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="label">Destination *</label>
                <input
                  {...register('destination', { required: 'Destination is required' })}
                  className="input"
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

              <div>
                <label className="label">Status</label>
                <select {...register('status')} className="input">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="paused">Paused</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="label">Description *</label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={6}
                  className="input"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          {/* Current Images */}
          {trip.images?.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Current Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {trip.images.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={`http://localhost:5000${image}`}
                      alt={`Trip ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Images */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Images</h2>
            
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
              <p className="text-sm text-gray-500 mt-1">Upload additional images</p>
            </div>

            {newImagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {newImagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={preview}
                      alt={`New ${index + 1}`}
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
              disabled={updateTripMutation.isLoading}
              className="btn-primary flex-1"
            >
              {updateTripMutation.isLoading ? 'Updating...' : 'Update Trip'}
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

export default EditTrip;