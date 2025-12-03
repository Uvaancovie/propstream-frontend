import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { addPropertyToStorage } from '../utils/seedData';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { propertiesAPI } from '../services/api';
import { 
  PhotoIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  HomeIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const AddPropertyPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    province: '',
    price_per_night: '',
    bedrooms: '',
    bathrooms: '',
    max_guests: '',
    amenities: '',
    imageInputs: ['', '', ''],
    property_type: 'apartment',
    available_from: '',
    available_to: '',
    houseRules: ''
  });

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'villa', label: 'Villa' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'studio', label: 'Studio' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageInputChange = (index, value) => {
    setFormData(prev => {
      const nextImages = [...prev.imageInputs];
      nextImages[index] = value;
      return {
        ...prev,
        imageInputs: nextImages
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to add a property');
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'realtor') {
      toast.error('Only realtors can add properties');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Authentication token missing. Please log in again.');
      navigate('/login');
      return;
    }

    if (!formData.name || !formData.address || !formData.city || !formData.price_per_night) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const propertyData = {
        ...formData,
        price_per_night: parseFloat(formData.price_per_night) || 0,
        bedrooms: parseInt(formData.bedrooms) || 1,
        bathrooms: parseInt(formData.bathrooms) || 1,
        max_guests: parseInt(formData.max_guests) || 2,
        amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()).filter(a => a) : [],
        images: formData.imageInputs ? formData.imageInputs.map(i => i.trim()).filter(i => i) : [],
        is_available: true
      };

      if (!propertyData.realtor_id && user.id) {
        propertyData.realtor_id = user.id;
      }
      if (!propertyData.realtor_name && user.name) {
        propertyData.realtor_name = user.name;
      }
      if (!propertyData.realtor_email && user.email) {
        propertyData.realtor_email = user.email;
      }
      if (!propertyData.realtor_phone && user.phone) {
        propertyData.realtor_phone = user.phone;
      }

      console.log('🏠 Sending property data:', propertyData);
      
      try {
        const response = await propertiesAPI.create(propertyData);
        console.log('✅ Property creation response:', response);
        
        if (response.success) {
          toast.success('Property added successfully!');
          navigate('/dashboard');
          return;
        } else {
          throw new Error(response.message || 'Failed to add property');
        }
      } catch (apiError) {
        console.warn('API request failed, error details:', apiError);
        
        if (apiError.response) {
          console.warn('Server responded with:', apiError.response.status, apiError.response.data);
          toast.error(apiError.response.data.error || apiError.response.data.message || 'Server error');
        } else {
          console.warn('API request failed, saving to localStorage:', apiError);
          
          const localPropertyData = {
            ...propertyData,
            id: Date.now(),
            createdAt: new Date().toISOString()
          };

          addPropertyToStorage(localPropertyData);
          toast.success('Property added successfully (saved locally)!');
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('❌ Property creation error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to add property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not a realtor
  if (user?.role !== 'realtor') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
        <div className="text-center">
          <BuildingOfficeIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-slate-400 mb-6">Only realtors can add properties.</p>
          <button
            onClick={() => navigate('/browse')}
            className="btn-primary-gradient px-6 py-3 rounded-xl font-semibold"
          >
            Browse Properties Instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-violet-500/5 pointer-events-none" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-600 rounded-full blur-lg opacity-50" />
              <div className="relative bg-gradient-to-r from-purple-500 to-violet-600 p-4 rounded-2xl shadow-2xl">
                <BuildingOfficeIcon className="w-12 h-12 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-violet-400 to-purple-600 text-transparent bg-clip-text mb-2">
                Add New Property
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-purple-400 to-violet-600 rounded-full mx-auto" />
            </div>
          </div>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto leading-relaxed">
            Create a stunning property listing in minutes
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-2xl" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                  <HomeIcon className="w-6 h-6 text-white" />
                </div>
                Basic Information
              </h2>
          
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Beautiful 2BR Apartment in City Center"
                    className="input-dark w-full text-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Property Type *
                  </label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleInputChange}
                    className="input-dark w-full"
                    required
                  >
                    {propertyTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-purple-400" />
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g., 123 Main Street"
                    className="input-dark w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g., Cape Town"
                    className="input-dark w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Province
                  </label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    placeholder="e.g., Western Cape"
                    className="input-dark w-full"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe your property, amenities, and what makes it special..."
                    className="input-dark w-full resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-violet-500/10 to-transparent rounded-full blur-2xl" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                  <HomeIcon className="w-6 h-6 text-white" />
                </div>
                Property Details
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Bedrooms *
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    className="input-dark w-full text-center font-semibold text-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Bathrooms *
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    step="0.5"
                    className="input-dark w-full text-center font-semibold text-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <UserGroupIcon className="w-4 h-4 text-purple-400" />
                    Max Guests *
                  </label>
                  <input
                    type="number"
                    name="max_guests"
                    value={formData.max_guests}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    className="input-dark w-full text-center font-semibold text-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <CurrencyDollarIcon className="w-4 h-4 text-purple-400" />
                    Price/Night (R) *
                  </label>
                  <input
                    type="number"
                    name="price_per_night"
                    value={formData.price_per_night}
                    onChange={handleInputChange}
                    min="50"
                    step="50"
                    placeholder="1500"
                    className="input-dark w-full text-center font-semibold text-lg"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Amenities & Images */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-2xl" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                  <PhotoIcon className="w-6 h-6 text-white" />
                </div>
                Amenities & Images
              </h2>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Amenities
                  </label>
                  <textarea
                    name="amenities"
                    value={formData.amenities}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="e.g., WiFi, Swimming Pool, Parking, Kitchen, Air Conditioning..."
                    className="input-dark w-full resize-none"
                  />
                  <p className="text-sm text-slate-400 mt-2">Separate amenities with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-4">
                    Property Images (up to 3)
                  </label>
                  <div className="space-y-5">
                    {formData.imageInputs.map((url, index) => (
                      <div key={index} className="space-y-3">
                        <label className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                          Image {index + 1}
                        </label>
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => handleImageInputChange(index, e.target.value)}
                          placeholder="https://example.com/property-image.jpg"
                          className="input-dark w-full"
                        />
                        {url && (
                          <div className="h-40 rounded-xl overflow-hidden border-2 border-purple-500/30 shadow-lg hover:shadow-purple-500/20 transition-all duration-200">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-400 mt-4">
                    These photos will be shown on the public browse page so guests can preview your space.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-violet-500/10 to-transparent rounded-full blur-2xl" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                  <CalendarDaysIcon className="w-6 h-6 text-white" />
                </div>
                Availability
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Available From
                  </label>
                  <input
                    type="date"
                    name="available_from"
                    value={formData.available_from}
                    onChange={handleInputChange}
                    className="input-dark w-full"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Available To
                  </label>
                  <input
                    type="date"
                    name="available_to"
                    value={formData.available_to}
                    onChange={handleInputChange}
                    className="input-dark w-full"
                    min={formData.available_from || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <p className="text-sm text-slate-400 mt-4">
                Leave blank for ongoing availability
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-between gap-6 pt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-slate-700/80 hover:bg-slate-600/80 backdrop-blur-sm px-8 py-4 rounded-xl text-lg font-semibold text-white transition-all duration-200 border border-slate-600/50"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 btn-primary-gradient px-8 py-4 rounded-xl text-lg font-bold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Property...</span>
                </>
              ) : (
                <>
                  <BuildingOfficeIcon className="w-6 h-6" />
                  <span>Add Property</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyPage;
