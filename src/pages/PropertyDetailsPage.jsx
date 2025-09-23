import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  BuildingOfficeIcon,
  MapPinIcon,
  UserGroupIcon,
  CalendarIcon,
  HeartIcon,
  ShareIcon,
  StarIcon,
  WifiIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await api.get(`/properties/public/${id}`);
      setProperty(response.data.property);
      console.log('Property loaded:', response.data.property);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    navigate(`/property/${id}/book`);
  };

  const handleBackToProperties = () => {
    navigate('/properties/public');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BuildingOfficeIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property not found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
          <button 
            onClick={handleBackToProperties}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 
    ? property.images 
    : [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
      ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button 
            onClick={handleBackToProperties}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Properties
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Main Image */}
            <div className="relative">
              <img
                src={images[selectedImageIndex]}
                alt={property.name}
                className="w-full h-96 lg:h-[500px] object-cover rounded-2xl"
                onError={(e) => { 
                  e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
                }}
              />
              
              {/* Action buttons overlay */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button className="p-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-full hover:bg-opacity-100 transition-all shadow-lg">
                  <HeartIcon className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-full hover:bg-opacity-100 transition-all shadow-lg">
                  <ShareIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-2 gap-4">
              {images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`${property.name} ${index + 1}`}
                    className={`w-full h-44 lg:h-60 object-cover rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedImageIndex === index 
                        ? 'ring-4 ring-blue-500 ring-opacity-50' 
                        : 'hover:brightness-75'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                    onError={(e) => { 
                      e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                    }}
                  />
                  {index === 3 && images.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">
                        +{images.length - 4} more
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="w-5 h-5 mr-2" />
                    <span>{property.address}, {property.city}</span>
                  </div>
                </div>
                  <div className="flex items-center">
                    <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold text-gray-900 ml-1">4.8</span>
                    <span className="text-gray-600 ml-1">(24 reviews)</span>
                  </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <BuildingOfficeIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <UserGroupIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{property.max_guests}</div>
                  <div className="text-sm text-gray-600">Guests</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">About this place</h3>
                <p className="text-gray-600 leading-relaxed">
                  {property.description || "This beautiful property offers a comfortable and memorable stay for your next getaway."}
                </p>
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">What this place offers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 shadow-lg sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  R{property.pricePerNight}
                  <span className="text-lg font-normal text-gray-600">/night</span>
                </div>
                {/* Edit listing CTA for realtors */}
                {property.realtor_id && localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).id === property.realtor_id && (
                  <button
                    onClick={() => window.location.href = '/properties'}
                    className="mt-3 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    Edit Listing
                  </button>
                )}
                <div className="flex items-center justify-center">
                  <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">4.8 (24 reviews)</span>
                </div>
              </div>

              {/* Quick booking form preview */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-gray-300 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Check-in</label>
                    <div className="text-sm text-gray-600">Add date</div>
                  </div>
                  <div className="border border-gray-300 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Check-out</label>
                    <div className="text-sm text-gray-600">Add date</div>
                  </div>
                </div>
                <div className="border border-gray-300 rounded-lg p-3">
                  <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Guests</label>
                  <div className="text-sm text-gray-600">1 guest</div>
                </div>
              </div>

              <button
                onClick={handleBookNow}
                className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg flex items-center justify-center"
              >
                <CalendarIcon className="w-5 h-5 mr-2" />
                Reserve Now
              </button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">You won't be charged yet</p>
              </div>

              {/* Price breakdown preview */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                  <span>R{property.pricePerNight} x 5 nights</span>
                  <span>R{property.pricePerNight * 5}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                  <span>Cleaning fee</span>
                  <span>R50</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                  <span>Service fee</span>
                  <span>R25</span>
                </div>
                <div className="flex justify-between items-center font-semibold text-gray-900 text-lg border-t border-gray-200 pt-4">
                  <span>Total</span>
                  <span>R{(property.pricePerNight * 5) + 75}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
