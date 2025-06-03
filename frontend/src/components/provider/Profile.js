// frontend/src/pages/provider/Profile.js
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { providerService } from '../../services/providers';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { PhotoIcon } from '@heroicons/react/24/outline';

const ProviderProfile = () => {
  const { user, updateUser } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (user) {
      setValue('businessName', user.business_name || '');
      setValue('bio', user.bio || '');
      setValue('location', user.location || '');
      setValue('yearsExperience', user.years_experience || '');
      setValue('expertise', user.expertise?.join(', ') || '');
      setValue('languages', user.languages?.join(', ') || '');
      
      if (user.profile_image) {
        setImagePreview(`http://localhost:5000${user.profile_image}`);
      }
    }
  }, [user, setValue]);

  const updateProfileMutation = useMutation(providerService.updateProfile, {
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      updateUser();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = (data) => {
    const profileData = {
      businessName: data.businessName,
      bio: data.bio,
      location: data.location,
      yearsExperience: data.yearsExperience ? parseInt(data.yearsExperience) : null,
      expertise: data.expertise ? data.expertise.split(',').map(e => e.trim()) : [],
      languages: data.languages ? data.languages.split(',').map(l => l.trim()) : [],
      profileImage: profileImage,
    };

    updateProfileMutation.mutate(profileData);
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Provider Profile</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Profile Image */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Image</h2>
            
            <div className="flex items-center space-x-6">
              <div className="relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block">
                  <span className="sr-only">Choose profile photo</span>
                  <input
                    type="file"
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
                <p className="text-sm text-gray-500 mt-1">JPG, PNG, or WebP. Max 5MB.</p>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Business Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="label">Business Name</label>
                <input
                  {...register('businessName')}
                  className="input"
                  placeholder="Your business or brand name"
                />
              </div>

              <div>
                <label className="label">Location</label>
                <input
                  {...register('location')}
                  className="input"
                  placeholder="e.g., Chiang Mai, Thailand"
                />
              </div>

              <div>
                <label className="label">Years of Experience</label>
                <input
                  {...register('yearsExperience', {
                    min: { value: 0, message: 'Must be a positive number' }
                  })}
                  type="number"
                  className="input"
                  placeholder="How many years have you been in this business?"
                />
                {errors.yearsExperience && (
                  <p className="text-red-500 text-sm mt-1">{errors.yearsExperience.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* About & Expertise */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">About & Expertise</h2>
            
            <div className="space-y-4">
              <div>
                <label className="label">Bio</label>
                <textarea
                  {...register('bio')}
                  rows={6}
                  className="input"
                  placeholder="Tell travelers about yourself, your experience, and what makes your trips special..."
                />
              </div>

              <div>
                <label className="label">Areas of Expertise</label>
                <input
                  {...register('expertise')}
                  className="input"
                  placeholder="e.g., Adventure Travel, Cultural Tours, Photography"
                />
                <p className="text-sm text-gray-500 mt-1">Separate multiple areas with commas</p>
              </div>

              <div>
                <label className="label">Languages Spoken</label>
                <input
                  {...register('languages')}
                  className="input"
                  placeholder="e.g., English, Thai, Spanish"
                />
                <p className="text-sm text-gray-500 mt-1">Separate multiple languages with commas</p>
              </div>
            </div>
          </div>

          {/* Profile Status */}
          {user && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Profile Status</h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email Verified</span>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    user.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Profile Approved</span>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    user.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.is_approved ? 'Approved' : 'Pending Review'}
                  </span>
                </div>
              </div>

              {!user.is_approved && (
                <p className="text-sm text-gray-500 mt-4">
                  Your profile is under review. You'll be notified once approved.
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={updateProfileMutation.isLoading}
              className="btn-primary flex-1"
            >
              {updateProfileMutation.isLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProviderProfile;