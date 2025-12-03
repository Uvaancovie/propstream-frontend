import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

// Small button component used inside property cards to avoid nested anchors
const RegisterButton = () => {
  const navigate = useNavigate();
  const handleClick = (e) => {
    // Prevent the outer Link (card) from navigating
    e.stopPropagation();
    e.preventDefault();
    navigate('/register');
  };
  return (
    <button onClick={handleClick} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">
      Sign up to book
    </button>
  );
};
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

const PublicPropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    city: ''
  });
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Get search query from URL if present
    const query = searchParams.get('search') || '';
    setSearchQuery(query);
    loadProperties(query);
  }, [searchParams]);

  // Base URL for API (falls back to localhost backend)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

  // Normalize image URLs: if URL is relative, prefix with backend host (strip /api)
  const normalizeImageUrl = (url) => {
    if (!url) return '/novaprop-logo.jpeg';
    if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url;
    const apiHost = API_BASE.replace(/\/+api\/?$/i, '').replace(/\/+$/,'');
    if (url.startsWith('/')) return `${apiHost}${url}`;
    return `${apiHost}/${url}`;
  };

  const loadProperties = async (search = '') => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (filters.propertyType) queryParams.append('propertyType', filters.propertyType);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.city) queryParams.append('city', filters.city);

      const url = `${API_BASE.replace(/\/+$/,'')}/public/properties?${queryParams}`;
      const response = await fetch(url, { credentials: 'include' });

      // Protect against HTML (index.html) responses from dev server or proxy misconfig
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        const text = await response.text();
        console.error('Error loading properties, status:', response.status, 'response:', text);
        setLoadError(`Server error (${response.status}).`);
        setProperties([]);
      } else if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but received:', text.slice(0, 200));
        setLoadError('Invalid response from server (not JSON). Check the API base URL or proxy.');
        setProperties([]);
      } else {
        const json = await response.json();
        // backend returns { success: true, results: [...] }
        const items = Array.isArray(json.results) ? json.results : (json.results || []);
        setProperties(items);
        setLoadError('');
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      setLoadError(error.message || 'Failed to load properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newSearchParams = new URLSearchParams();
    if (searchQuery) newSearchParams.set('search', searchQuery);
    setSearchParams(newSearchParams);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    loadProperties(searchQuery);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyTypeColor = (type) => {
    const colors = {
      'house': 'bg-blue-100 text-blue-800',
      'apartment': 'bg-green-100 text-green-800',
      'condo': 'bg-purple-100 text-purple-800',
      'commercial': 'bg-orange-100 text-orange-800',
      'land': 'bg-gray-100 text-gray-800'
    };
    return colors[type?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
  <div className="min-h-screen bg-[#0B0B0E] text-slate-200">
      {/* Header */}
      <div className="bg-[#0B0B0E] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-100">Browse Properties</h1>
              <p className="text-slate-400 mt-1">Public listings — view details and photos. Sign up to contact or book.</p>
            </div>

            <div className="flex items-center gap-3">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Search by city, neighbourhood, or feature"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-72 bg-slate-800 text-slate-100 border-slate-700 placeholder:text-slate-400"
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Search</Button>
              </form>

              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="ml-3 px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-sm text-slate-200"
                aria-label="Filter by property type"
              >
                <option value="">All types</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
              </select>

              <Link to="/login" className="ml-3 hidden md:inline-flex bg-transparent border border-slate-700 text-slate-200 hover:bg-slate-800 px-3 py-2 rounded-md text-sm">Realtor Login</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadError && (
          <div className="mb-6 bg-yellow-900/30 border border-yellow-700 text-yellow-200 p-4 rounded-lg">
            <strong>Unable to load properties:</strong> {loadError}
            <div className="text-xs text-yellow-200/80 mt-1">If this persists, check that the backend API is running at the configured VITE_API_BASE_URL ({import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'})</div>
          </div>
        )}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg bg-slate-800 shadow-sm overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-700" />
                <div className="p-4">
                  <div className="h-4 bg-slate-700 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-slate-700 rounded w-1/2 mb-2" />
                  <div className="h-8 bg-slate-700 rounded w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-slate-800 rounded-lg p-8 shadow-sm border border-slate-700 max-w-md mx-auto">
              <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m6 0v-7h4v7m-4-3h2m-2 0V9h2v3" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">No Properties Found</h3>
              <p className="text-slate-400">
                {searchQuery ? 
                  'Try adjusting your search criteria or filters.' : 
                  'No public properties are currently available.'
                }
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {properties.length} Properties Found
              </h2>
              {searchQuery && (
                <p className="text-gray-600">
                  Results for "{searchQuery}"
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Link key={property._id} to={`/property/${property.public_slug || property._id}`} className="group">
                  <Card className="overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1 duration-200 bg-slate-800 border-slate-700 text-slate-200">
                    {/* Image area with price overlay */}
                    <div className="relative h-56 bg-slate-700">
                      {property.images && property.images.length > 0 ? (
                        <img src={normalizeImageUrl(property.images[0])} alt={property.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-700">
                          <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                          </svg>
                        </div>
                      )}

                      <div className="absolute left-3 bottom-3 bg-gradient-to-r from-violet-600/95 to-blue-600/90 text-white px-3 py-1 rounded-md shadow">
                        <div className="text-sm font-semibold">{formatPrice(property.price_per_night ?? property.price)}</div>
                        <div className="text-xs opacity-90">per night</div>
                      </div>

                      <div className="absolute top-3 right-3">
                        <Badge className={getPropertyTypeColor(property.propertyType)}>
                          {property.propertyType}
                        </Badge>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-slate-100 group-hover:text-blue-300 truncate">{property.title}</h3>
                      <p className="text-sm text-slate-400 mt-1 truncate">{property.city}, {property.state}</p>

                      <p className="text-slate-300 text-sm mt-3 line-clamp-2">{property.description}</p>

                      {/* Rental Agreement Link */}
                      {property.rental_agreement && (
                        <div className="mt-3">
                          <a 
                            href={normalizeImageUrl(property.rental_agreement)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg transition-all duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View Rental Agreement
                          </a>
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={normalizeImageUrl(property.realtor_profileImage || property.realtor?.profileImage || property.owner?.profileImage || '/novaprop-logo.jpeg')} alt={(property.realtor?.name || property.owner?.name || 'Realtor')} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                          <div className="text-sm">
                            <div className="font-medium text-slate-100">{property.realtor?.name || property.owner?.name || 'Realtor'}</div>
                            <div className="text-xs text-slate-400 truncate max-w-[10rem]">{property.realtor?.bio || property.owner?.bio || ''}</div>
                          </div>
                        </div>

                        <div>
                          <RegisterButton />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PublicPropertiesPage;
