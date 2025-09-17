import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

const PublicPropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const loadProperties = async (search = '') => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (filters.propertyType) queryParams.append('propertyType', filters.propertyType);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.city) queryParams.append('city', filters.city);

      const response = await fetch(`/api/public/properties?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      } else {
        console.error('Error loading properties');
        setProperties([]);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Property Listings</h1>
              <p className="text-gray-600 mt-1">Discover your perfect property</p>
            </div>
            <Link 
              to="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Realtor Login
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search properties by location, type, or features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Search
              </Button>
            </div>
          </form>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <select
              value={filters.propertyType}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Property Types</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
            </select>

            <Input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />

            <Input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />

            <Input
              type="text"
              placeholder="City"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 max-w-md mx-auto">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m6 0v-7h4v7m-4-3h2m-2 0V9h2v3" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Properties Found</h3>
              <p className="text-gray-600">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Link
                  key={property._id}
                  to={`/property/${property.public_slug || property._id}`}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                    {/* Property Image */}
                    <div className="relative h-48 bg-gray-200">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m6 0v-7h4v7m-4-3h2m-2 0V9h2v3" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge className={getPropertyTypeColor(property.propertyType)}>
                          {property.propertyType}
                        </Badge>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                          {property.title}
                        </h3>
                        <p className="text-xl font-bold text-blue-600">
                          {formatPrice(property.price)}
                        </p>
                      </div>

                      <p className="text-gray-600 mb-4 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {property.city}, {property.state}
                      </p>

                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                        {property.description}
                      </p>

                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        {property.bedrooms && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v0" />
                            </svg>
                            {property.bedrooms} bed
                          </span>
                        )}
                        {property.bathrooms && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                            </svg>
                            {property.bathrooms} bath
                          </span>
                        )}
                        {property.squareFootage && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                            </svg>
                            {property.squareFootage.toLocaleString()} sq ft
                          </span>
                        )}
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
