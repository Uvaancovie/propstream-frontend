import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const PublicPropertyDetailsPage = () => {
  const { slug } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  useEffect(() => {
    loadProperty();
  }, [slug]);

  const loadProperty = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/public/properties/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setProperty(data);
      } else {
        console.error('Property not found');
        setProperty(null);
      }
    } catch (error) {
      console.error('Error loading property:', error);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const shareProperty = (method) => {
    const url = window.location.href;
    const title = `${property.title} - ${formatPrice(property.price)}`;
    
    switch (method) {
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=Check out this property: ${encodeURIComponent(url)}`;
        break;
    }
    setShareMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m6 0v-7h4v7m-4-3h2m-2 0V9h2v3" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Property Not Found</h3>
            <p className="text-gray-600 mb-4">
              The property you're looking for doesn't exist or is no longer available.
            </p>
            <Link to="/browse" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Back to Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/browse" className="flex items-center text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Properties
            </Link>
            <Link 
              to="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Realtor Login
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
              {property.images && property.images.length > 0 ? (
                <img
                  src={property.images[activeImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m6 0v-7h4v7m-4-3h2m-2 0V9h2v3" />
                  </svg>
                </div>
              )}
              
              {/* Image Navigation */}
              {property.images && property.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex(Math.max(0, activeImageIndex - 1))}
                    disabled={activeImageIndex === 0}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveImageIndex(Math.min(property.images.length - 1, activeImageIndex + 1))}
                    disabled={activeImageIndex === property.images.length - 1}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {property.images && property.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative h-24 bg-gray-200 rounded-lg overflow-hidden ${
                      index === activeImageIndex ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${property.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                <div className="relative">
                  <button
                    onClick={() => setShareMenuOpen(!shareMenuOpen)}
                    className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>

                  {/* Share Menu */}
                  {shareMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="p-2">
                        <button onClick={() => shareProperty('copy')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                          Copy Link
                        </button>
                        <button onClick={() => shareProperty('facebook')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                          Share on Facebook
                        </button>
                        <button onClick={() => shareProperty('twitter')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                          Share on Twitter
                        </button>
                        <button onClick={() => shareProperty('linkedin')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                          Share on LinkedIn
                        </button>
                        <button onClick={() => shareProperty('email')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                          Share via Email
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 text-gray-600 mb-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.address}, {property.city}, {property.state}
                </div>
                <Badge variant="secondary">{property.propertyType}</Badge>
              </div>

              <div className="text-3xl font-bold text-blue-600 mb-4">
                {formatPrice(property.price)}
              </div>
            </div>

            {/* Quick Stats */}
            <Card className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                {property.bedrooms && (
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                )}
                {property.squareFootage && (
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{property.squareFootage.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Sq Ft</div>
                  </div>
                )}
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">
                {property.description || 'No description available.'}
              </p>
            </Card>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 gap-2">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center text-gray-700">
                      <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {amenity}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Contact CTA */}
            <Card className="p-6 bg-blue-50">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Interested in this property?</h2>
              <p className="text-gray-700 mb-4">
                Contact a realtor to learn more about this property, schedule a viewing, or get assistance with your real estate needs.
              </p>
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full bg-blue-600 text-white text-center px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Contact Realtor
                </Link>
                <Button
                  onClick={() => shareProperty('copy')}
                  variant="outline"
                  className="w-full"
                >
                  Share Property
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicPropertyDetailsPage;
