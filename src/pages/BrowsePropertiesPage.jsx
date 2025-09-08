import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { propertiesAPI } from '../services/api';
import { seedDemoData, getPropertiesFromStorage } from '../utils/seedData';
import LoadingSpinner from '../components/LoadingSpinner';
import NewsletterSignup from '../components/NewsletterSignup';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  CurrencyDollarIcon, 
  CalendarIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const BrowsePropertiesPage = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    // Filter properties based on search term
    const filtered = properties.filter(property =>
      property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProperties(filtered);
  }, [searchTerm, properties]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      
      // Seed demo data first
      seedDemoData();
      
      let fetchedProperties = [];
      
      // Try to get properties from API first
      try {
        const response = await propertiesAPI.getAllPublic();
        console.log('✅ Properties from API:', response);
        fetchedProperties = response.properties || [];
      } catch (apiError) {
        console.warn('⚠️ API failed, using localStorage:', apiError);
        // Fallback to localStorage
        fetchedProperties = getPropertiesFromStorage();
        console.log('💾 Properties from localStorage:', fetchedProperties.length);
      }
      
      setProperties(fetchedProperties);
    } catch (error) {
      console.error('❌ Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse Properties</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing properties for your next stay. From luxury villas to cozy cabins, 
            find the perfect place for your getaway.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties by name, city, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {searchTerm ? 'No properties match your search' : 'No properties available'}
            </h3>
            <p className="mt-2 text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Check back later for new listings'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="mt-16">
          <NewsletterSignup className="max-w-md mx-auto" />
        </div>
      </div>
    </div>
  );
};

const PropertyCard = ({ property }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Property Image */}
      <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 relative">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <HomeIcon className="h-16 w-16 text-primary-400" />
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className="bg-white bg-opacity-90 text-primary-700 px-2 py-1 rounded-full text-sm font-medium">
            Property
          </span>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {property.name}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">{property.city}</span>
        </div>

        {property.description && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
            {property.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-green-600">
            <CurrencyDollarIcon className="h-5 w-5 mr-1" />
            <span className="font-semibold">
              ${property.price_per_night ? `${property.price_per_night}/night` : 'Contact for pricing'}
            </span>
          </div>
        </div>

        {/* Property Stats */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <span>{property.max_guests} guests</span>
          <span>{property.bedrooms} bed</span>
          <span>{property.bathrooms} bath</span>
        </div>

        {/* Realtor Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-medium">
                {(property.realtorName || property.realtor_name) ? (property.realtorName || property.realtor_name).charAt(0) : 'R'}
              </span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {property.realtorName || property.realtor_name || 'Professional Realtor'}
              </div>
              <div className="text-xs text-gray-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${property.realtorEmail || property.realtor_email || ''}`} className="hover:text-primary-600 hover:underline">
                  {property.realtorEmail || property.realtor_email || 'Contact for information'}
                </a>
              </div>
              {(property.realtorPhone || property.realtor_phone) && (
                <div className="text-xs text-gray-600 flex items-center mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${property.realtorPhone || property.realtor_phone || ''}`} className="hover:text-primary-600 hover:underline">
                    {property.realtorPhone || property.realtor_phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Link
            to={`/property/${property.id}`}
            className="flex-1 bg-primary-600 text-white text-center py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            View Details
          </Link>
          <Link
            to={`/property/${property.id}/book`}
            className="flex items-center justify-center px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
          >
            <CalendarIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BrowsePropertiesPage;
