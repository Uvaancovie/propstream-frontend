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
    image_url: '',
    property_type: 'apartment',
    available_from: '',
    available_to: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (user?.role !== 'realtor') {
      toast.error('Only realtors can add properties');
      return;
    }

    if (!formData.name || !formData.address || !formData.city || !formData.price_per_night) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare property data
      const propertyData = {
        ...formData,
        price_per_night: parseFloat(formData.price_per_night),
        bedrooms: parseInt(formData.bedrooms) || 1,
        bathrooms: parseInt(formData.bathrooms) || 1,
        max_guests: parseInt(formData.max_guests) || 2,
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
        images: formData.image_url ? [formData.image_url] : [],
        is_available: true,
        realtor_id: user.id,
        realtor_name: user.name,
        realtor_email: user.email,
        realtor_phone: user.phone || ''
      };

      console.log('🏠 Creating property:', propertyData);
      
      try {
        // Try API first using the propertiesAPI service
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
        console.warn('API request failed, saving to localStorage:', apiError);
        
        // Fallback to localStorage
        const localPropertyData = {
          ...propertyData,
          id: Date.now(),
          createdAt: new Date().toISOString()
        };

        addPropertyToStorage(localPropertyData);
        toast.success('Property added successfully (saved locally)!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('❌ Property creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to add property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not a realtor
  if (user?.role !== 'realtor') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-6">Only realtors can add properties.</p>
          <button
            onClick={() => navigate('/browse-properties')}
            className="btn btn-primary"
          >
            Browse Properties Instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
        <p className="mt-2 text-gray-600">
          Create a new property listing for potential clients to book.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <HomeIcon className="w-6 h-6 mr-2 text-primary-600" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Title *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Beautiful 2BR Apartment in City Center"
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleInputChange}
                className="input w-full"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPinIcon className="w-4 h-4 inline mr-1" />
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="e.g., 123 Main Street"
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="e.g., Cape Town"
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Province
              </label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                placeholder="e.g., Western Cape"
                className="input w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe your property, amenities, and what makes it special..."
                className="input w-full"
              />
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <HomeIcon className="w-6 h-6 mr-2 text-primary-600" />
            Property Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms *
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserGroupIcon className="w-4 h-4 inline mr-1" />
                Max Guests *
              </label>
              <input
                type="number"
                name="max_guests"
                value={formData.max_guests}
                onChange={handleInputChange}
                min="1"
                max="20"
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                Price per Night (R) *
              </label>
              <input
                type="number"
                name="price_per_night"
                value={formData.price_per_night}
                onChange={handleInputChange}
                min="50"
                step="50"
                placeholder="1500"
                className="input w-full"
                required
              />
            </div>
          </div>
        </div>

        {/* Amenities & Images */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <PhotoIcon className="w-6 h-6 mr-2 text-primary-600" />
            Amenities & Images
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenities
              </label>
              <textarea
                name="amenities"
                value={formData.amenities}
                onChange={handleInputChange}
                rows={3}
                placeholder="e.g., WiFi, Swimming Pool, Parking, Kitchen, Air Conditioning..."
                className="input w-full"
              />
              <p className="text-sm text-gray-500 mt-1">Separate amenities with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Image URL
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/property-image.jpg"
                className="input w-full"
              />
              <p className="text-sm text-gray-500 mt-1">
                Add a URL to a beautiful photo of your property
              </p>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <CalendarDaysIcon className="w-6 h-6 mr-2 text-primary-600" />
            Availability
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available From
              </label>
              <input
                type="date"
                name="available_from"
                value={formData.available_from}
                onChange={handleInputChange}
                className="input w-full"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available To
              </label>
              <input
                type="date"
                name="available_to"
                value={formData.available_to}
                onChange={handleInputChange}
                className="input w-full"
                min={formData.available_from || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            Leave blank for ongoing availability
          </p>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Creating Property...
              </>
            ) : (
              'Add Property'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPropertyPage;
