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
import SubscribeButton from '../components/SubscribeButton';

// Base API URL used for normalizing image urls when backend returns relative paths
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const normalizeImageUrl = (url) => {
  if (!url) return '/novaprop-logo.jpeg';
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url;
  const apiHost = API_BASE.replace(/\/+api\/?$/i, '').replace(/\/+$/,'');
  if (url.startsWith('/')) return `${apiHost}${url}`;
  return `${apiHost}/${url}`;
};

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
    <div className="min-h-screen bg-[#0B0B0E] text-slate-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-100 mb-4">Browse Properties</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Discover amazing properties for your next stay. From luxury villas to cozy cabins, 
            find the perfect place for your getaway.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
            <div className="relative max-w-md mx-auto">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search properties by name, city, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                  <PropertyCard key={property._id || property.id} property={property} />
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
  // Use public_slug when available. Only expose details/book links for public properties.
  const publicId = property.public_slug || (property.is_public ? (property._id || property.id) : null);
  const price = property.price_per_night ?? property.price;
  const formattedPrice = price ? new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(price) : 'Contact for pricing';

  // Use realtor profile image if available
  const realtorImg = property.realtor_profileImage || property.realtor?.profileImage || property.owner?.profileImage || null;

  return (
    <div className="bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-slate-700">
      {/* Property Image */}
      <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-800 relative">
        {property.images && property.images.length > 0 ? (
          <img
            src={normalizeImageUrl(property.images[0])}
            alt={property.name || property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <HomeIcon className="h-16 w-16 text-slate-400" />
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className="bg-black bg-opacity-40 text-slate-100 px-2 py-1 rounded-full text-sm font-medium">
            Property
          </span>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-slate-100 mb-2">
          {property.name || property.title}
        </h3>

        <div className="flex items-center text-slate-400 mb-3">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">{property.city}</span>
        </div>

        {property.description && (
          <p className="text-slate-300 text-sm mb-4 line-clamp-2">
            {property.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-emerald-400">
            <CurrencyDollarIcon className="h-5 w-5 mr-1" />
            <span className="font-semibold">{formattedPrice}{price ? '/night' : ''}</span>
          </div>
        </div>

        {/* Property Stats */}
        <div className="flex items-center justify-between mb-4 text-sm text-slate-400">
          <span>{property.max_guests} guests</span>
          <span>{property.bedrooms} bed</span>
          <span>{property.bathrooms} bath</span>
        </div>

        {/* Realtor Info */}
        <div className="mb-4 p-3 bg-slate-900 rounded-lg">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center mr-3 overflow-hidden border border-slate-700">
              {realtorImg ? (
                <img src={normalizeImageUrl(realtorImg)} alt={property.realtor?.name || property.owner?.name || 'Realtor'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm font-medium">{(property.realtorName || property.realtor_name || property.realtor?.name || 'R').charAt(0)}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-100">{property.realtor?.name || property.owner?.name || property.realtorName || property.realtor_name || 'Realtor'}</div>
              <div className="text-xs text-slate-400 truncate max-w-[10rem]">{property.realtor?.bio || property.owner?.bio || ''}</div>
            </div>
          </div>
        </div>

  {/* Action Buttons */}
        <div className="flex space-x-3">
          {publicId ? (
            <>
              <Link
                to={`/property/${publicId}`}
                className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                View Details
              </Link>
              <Link
                to={`/property/${publicId}/book`}
                className="flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50/5 transition-colors"
              >
                <CalendarIcon className="h-4 w-4" />
              </Link>
              {/* Subscribe to realtor newsletter */}
              <div className="flex items-center">
                <SubscribeButton realtorId={property.realtorId || property.realtor_id} isSubscribedInitial={!!property.isSubscribedToOwner} />
              </div>
            </>
          ) : (
            // If property is not public (no public slug), prompt user to sign up to view/book
            <button
              onClick={() => window.location.assign('/register')}
              className="flex-1 bg-violet-600 text-white text-center py-2 px-4 rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
            >
              Sign up to view
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowsePropertiesPage;
