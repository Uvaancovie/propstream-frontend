import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  PlusIcon, 
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const PropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    province: '',
    description: '',
    price_per_night: '',
    max_guests: '',
    bedrooms: '',
    bathrooms: '',
    amenities: '',
    houseRules: '',
    images: ''
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await api.get('/properties');
      // The API returns { message, count, properties } structure
      const propertyData = response.data.properties || [];
      
      // Ensure properties is always an array, even if the API structure varies
      setProperties(Array.isArray(propertyData) ? propertyData : []);
      
      console.log('Properties loaded:', propertyData);
      console.log('Total properties:', propertyData.length);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Extract data from form, omitting fields not in backend model
      const { houseRules, ...formDataForSubmit } = formData;
      
      const propertyData = {
        ...formDataForSubmit,
        price_per_night: parseFloat(formData.price_per_night),
        max_guests: parseInt(formData.max_guests),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
        images: formData.images.split(',').map(i => i.trim()).filter(i => i)
      };

      console.log('Sending property data:', propertyData);

      if (selectedProperty) {
        await api.put(`/properties/${selectedProperty._id}`, propertyData);
      } else {
        await api.post('/properties', propertyData);
      }

      setShowModal(false);
      setSelectedProperty(null);
      resetForm();
      fetchProperties();
    } catch (error) {
      console.error('Error saving property:', error);
    }
  };

  const handleEdit = (property) => {
    setFormData({
      name: property.name,
      address: property.address,
      city: property.city,
      province: property.province || '',
      description: property.description || '',
      price_per_night: property.price_per_night.toString(),
      max_guests: property.max_guests.toString(),
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      amenities: Array.isArray(property.amenities) ? property.amenities.join(', ') : '',
      houseRules: property.houseRules || '',
      images: Array.isArray(property.images) ? property.images.join(', ') : ''
    });
    
    // Call openModal with the property to edit
    openModal(property);
  };

  const handleDelete = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await api.delete(`/properties/${propertyId}`);
        fetchProperties();
      } catch (error) {
        console.error('Error deleting property:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      province: '',
      description: '',
      price_per_night: '',
      max_guests: '',
      bedrooms: '',
      bathrooms: '',
      amenities: '',
      houseRules: '',
      images: ''
    });
  };

  const openModal = (property) => {
    // Only allow editing existing properties
    if (!property) return;
    
    resetForm();
    setSelectedProperty(property);
    setShowModal(true);
  };

  // Custom CSS for animations
  const animationStyles = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Add custom animation styles */}
      <style>{animationStyles}</style>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="mt-2 text-gray-600">
            Manage your rental properties and listings
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchProperties}
            className="btn bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg p-2 transition-colors duration-200"
            title="Refresh properties"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
          <BuildingOfficeIcon className="w-24 h-24 text-blue-300 mx-auto mb-6 animate-pulse" />
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">No properties yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            There are no properties in your portfolio yet. Properties will appear here once they are added to your account.
          </p>
        </div>
      ) : (
        <>
          {/* Properties Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <BuildingOfficeIcon className="w-8 h-8 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Properties</p>
                  <p className="text-3xl font-bold text-gray-900">{properties.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-6 rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <CurrencyDollarIcon className="w-8 h-8 text-green-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue/Night</p>
                  <p className="text-3xl font-bold text-gray-900">
                    R{properties.reduce((sum, p) => sum + (Number(p.price_per_night) || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg mr-4">
                  <UserGroupIcon className="w-8 h-8 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Capacity</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {properties.reduce((sum, p) => sum + (Number(p.max_guests) || 0), 0)} guests
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                  <svg className="w-8 h-8 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Avg Price/Night</p>
                  <p className="text-3xl font-bold text-gray-900">
                    R{properties.length > 0 ? Math.round(properties.reduce((sum, p) => sum + (Number(p.price_per_night) || 0), 0) / properties.length).toLocaleString() : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Properties List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties && properties.map((property) => {
              // Check if property is valid and has required fields
              if (!property || !property._id) return null;
              
              return (
                <div key={property._id} className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col transform hover:-translate-y-1">
                  {/* Property Image with Badge */}
                  <div className="relative overflow-hidden">
                    <img
                      src={(property.images && property.images.length > 0 && property.images[0]) || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'}
                      alt={property.name || 'Property'}
                      className="w-full h-64 object-cover transform hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
                    />
                    {/* Price Badge */}
                    <div className="absolute top-3 right-3 bg-white bg-opacity-95 backdrop-blur-sm text-blue-700 font-bold px-3 py-2 rounded-full text-sm shadow-lg border">
                      R{property.price_per_night || 0}
                      <span className="text-xs text-gray-600 block">per night</span>
                    </div>
                    {/* Property Type Badge */}
                    <div className="absolute bottom-3 left-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                      {property.bedrooms || 0}BR • {property.bathrooms || 0}BA
                    </div>
                    {/* Image Count Indicator */}
                    {property.images && property.images.length > 1 && (
                      <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                        📷 {property.images.length} photos
                      </div>
                    )}
                  </div>

                  {/* Property Details */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Title and Location */}
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{property.name}</h3>
                      
                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
                        <span className="text-sm">{property.address}, {property.city}</span>
                      </div>
                    </div>

                    {/* Description preview */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                      {property.description || "Beautiful property perfect for your stay. Book now for an amazing experience!"}
                    </p>

                    {/* Property Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <UserGroupIcon className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                        <span className="text-sm font-semibold text-gray-700">{property.max_guests || 0} Guests</span>
                      </div>
                      <div className="text-center">
                        <BuildingOfficeIcon className="w-5 h-5 mx-auto text-green-500 mb-1" />
                        <span className="text-sm font-semibold text-gray-700">{property.bedrooms || 0} Bedrooms</span>
                      </div>
                    </div>

                    {/* Amenities */}
                    {property.amenities && property.amenities.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {property.amenities.slice(0, 4).map((amenity, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {amenity}
                            </span>
                          ))}
                          {property.amenities.length > 4 && (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                              +{property.amenities.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Property Actions */}
                    <div className="flex space-x-2 pt-4 border-t mt-auto">
                      <button
                        onClick={() => handleEdit(property)}
                        className="flex-1 btn bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
                      >
                        <PencilIcon className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(property._id)}
                        className="btn bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors duration-200"
                        title="Delete Property"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                      <button 
                        className="btn bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors duration-200"
                        title="View Property"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-fadeIn">
            {/* Header with background - Fixed position */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-t-xl flex-shrink-0">
              <h2 className="text-2xl font-bold text-white">
                Edit Property
              </h2>
              <p className="text-blue-100 mt-1">
                Update your property details
              </p>
              
              {/* Close button */}
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-white hover:text-blue-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Scrollable form content */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Basic Info Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <BuildingOfficeIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Basic Information
                  </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Property Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Beautiful Apartment in City Center"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          placeholder="Cape Town"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="123 Main Street, Suburb"
                      />
                    </div>
                  </div>
                  
                  {/* Property Details Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <MapPinIcon className="w-5 h-5 mr-2 text-blue-600" />
                      Property Details
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Describe your property... What makes it special? What can guests expect?"
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price/Night (R) *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">R</span>
                          </div>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.price_per_night}
                            onChange={(e) => setFormData({...formData, price_per_night: e.target.value})}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Guests *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.max_guests}
                          onChange={(e) => setFormData({...formData, max_guests: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bedrooms *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.bedrooms}
                          onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bathrooms *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.bathrooms}
                          onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Amenities & Rules Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Amenities & Rules
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amenities
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.amenities}
                        onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                        placeholder="WiFi, Pool, Parking, Kitchen (comma separated)"
                      />
                      <p className="mt-1 text-xs text-gray-500">Separate amenities with commas</p>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        House Rules
                      </label>
                      <textarea
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.houseRules}
                        onChange={(e) => setFormData({...formData, houseRules: e.target.value})}
                        placeholder="No smoking, No pets, Check-in after 3pm..."
                      />
                    </div>
                  </div>
                  
                  {/* Images Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Property Images
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image URLs
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.images}
                        onChange={(e) => setFormData({...formData, images: e.target.value})}
                        placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                      />
                      <p className="mt-1 text-xs text-gray-500">Separate image URLs with commas</p>
                    </div>
                    
                    {/* Preview of first image if available */}
                    {formData.images && formData.images.split(',')[0].trim() && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
                        <img 
                          src={formData.images.split(',')[0].trim()} 
                          alt="Property preview" 
                          className="h-32 object-cover rounded-lg border border-gray-300" 
                          onError={(e) => e.target.src = 'https://via.placeholder.com/400x250?text=Invalid+Image+URL'} 
                        />
                      </div>
                    )}
                  </div>
                </form>
              </div>
            
            {/* Fixed footer with buttons */}
            <div className="flex-shrink-0 border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="flex-1 py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Update Property
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
