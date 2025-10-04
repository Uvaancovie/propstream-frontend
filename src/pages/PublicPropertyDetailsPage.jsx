import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import SubscribeButton from '../components/SubscribeButton';

// API base helper and image normalizer (shared fallback for relative URLs)
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
const normalizeImageUrl = (url) => {
  if (!url) return '/novaprop-logo.jpeg';
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url;
  const apiHost = API_BASE.replace(/\/+api\/?$/i, '').replace(/\/+$/,'');
  if (url.startsWith('/')) return `${apiHost}${url}`;
  return `${apiHost}/${url}`;
};

const PublicPropertyDetailsPage = () => {
  const { slug } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  useEffect(() => {
    loadProperty();
  }, [slug]);

  // API base (fall back to localhost backend)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

  const normalizeImageUrl = (url) => {
    if (!url) return '/novaprop-logo.jpeg';
    if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url;
    const apiHost = API_BASE.replace(/\/+api\/?$/i, '').replace(/\/+$/,'');
    if (url.startsWith('/')) return `${apiHost}${url}`;
    return `${apiHost}/${url}`;
  };

  const loadProperty = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const url = `${API_BASE.replace(/\/+$/,'')}/public/properties/${slug}`;
      const res = await fetch(url, { credentials: 'include' });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok) {
        const text = await res.text();
        console.error('Error loading property, status:', res.status, 'response:', text);
        setLoadError(`Server error (${res.status}).`);
        setProperty(null);
      } else if (!contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Expected JSON but received:', text.slice(0, 300));
        setLoadError('Invalid response from server (not JSON). Check API base URL or proxy.');
        setProperty(null);
      } else {
        const json = await res.json();
        // backend returns { success: true, property: { ... } }
        if (json && json.success && json.property) {
          setProperty(json.property);
          setLoadError('');
        } else {
          console.error('Unexpected payload when loading property:', json);
          setLoadError('Unexpected response from server.');
          setProperty(null);
        }
      }
    } catch (error) {
      console.error('Error loading property:', error);
      setLoadError(error.message || 'Failed to load property');
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const shareProperty = (method) => {
    const url = window.location.href;
    const priceVal = property?.price_per_night ?? property?.price ?? 0;
    const title = `${property.title} - ${formatPrice(priceVal)}`;
    
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
      <div className="min-h-screen bg-[#0B0B0E] text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          <p className="mt-2 text-slate-400">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#0B0B0E] text-slate-200 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-slate-800 rounded-lg p-8 shadow-sm border border-slate-700">
            <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m6 0v-7h4v7m-4-3h2m-2 0V9h2v3" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Property Not Found</h3>
            <p className="text-slate-400 mb-4">
              The property you're looking for doesn't exist, is not publicly listed, or has been removed.
            </p>
            <Link to="/browse" className="text-blue-400 hover:text-blue-300 font-medium">
              ← Back to Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0E] text-slate-200">
      {/* Navigation */}
      <nav className="bg-transparent border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/browse" className="flex items-center text-slate-300 hover:text-slate-100">
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
        {loadError && (
          <div className="mb-6 bg-yellow-900/30 border border-yellow-700 text-yellow-200 p-4 rounded-lg">
            <strong>Unable to load property:</strong> {loadError}
            <div className="text-xs text-yellow-200/80 mt-1">Check that the backend API is running at the configured VITE_API_BASE_URL ({import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'})</div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative h-96 bg-slate-800 rounded-lg overflow-hidden">
              {property.images && property.images.length > 0 ? (
                <img
                  src={normalizeImageUrl(property.images[activeImageIndex])}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                  <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 p-2 bg-slate-800 bg-opacity-80 rounded-full hover:bg-opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5 text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveImageIndex(Math.min(property.images.length - 1, activeImageIndex + 1))}
                    disabled={activeImageIndex === property.images.length - 1}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-slate-800 bg-opacity-80 rounded-full hover:bg-opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5 text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className={`relative h-24 bg-slate-800 rounded-lg overflow-hidden ${
                      index === activeImageIndex ? 'ring-2 ring-violet-500' : ''
                    }`}
                  >
                    <img
                      src={normalizeImageUrl(image)}
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

              <div className="flex items-center space-x-4 text-slate-400 mb-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.address}, {property.city}, {property.state}
                </div>
                <Badge variant="secondary">{property.propertyType}</Badge>
              </div>

              <div className="text-3xl font-bold text-violet-400 mb-4">
                {formatPrice(property.price_per_night ?? property.price)}
              </div>
            </div>

            {/* Quick Stats */}
            <Card className="p-4 bg-slate-800 border-slate-700 text-slate-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                {property.bedrooms && (
                  <div>
                    <div className="text-2xl font-bold text-slate-100">{property.bedrooms}</div>
                    <div className="text-sm text-slate-400">Bedrooms</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div>
                    <div className="text-2xl font-bold text-slate-100">{property.bathrooms}</div>
                    <div className="text-sm text-slate-400">Bathrooms</div>
                  </div>
                )}
                {property.squareFootage && (
                  <div>
                    <div className="text-2xl font-bold text-slate-100">{property.squareFootage.toLocaleString()}</div>
                    <div className="text-sm text-slate-400">Sq Ft</div>
                  </div>
                )}
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6 bg-slate-800 border-slate-700 text-slate-200">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">Description</h2>
              <p className="text-slate-300 leading-relaxed">
                {property.description || 'No description available.'}
              </p>
            </Card>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card className="p-6 bg-slate-800 border-slate-700 text-slate-200">
                <h2 className="text-xl font-semibold text-slate-100 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 gap-2">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center text-slate-300">
                      <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {amenity}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Contact CTA */}
            <Card className="p-6 bg-slate-800 border-slate-700 text-slate-200">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">About the Realtor</h2>
              <div className="text-slate-300 mb-4">
                  Listed by:
                </div>
              <div className="flex items-center gap-4 mb-4">
                <img src={normalizeImageUrl(property.realtor_profileImage || '/novaprop-logo.jpeg')} alt={(property.realtor_name || 'Realtor')} className="w-14 h-14 rounded-full object-cover border border-slate-700" />
                <div>
                  <div className="font-medium text-slate-100">{property.realtor_name || 'Realtor'}</div>
                  <div className="text-sm text-slate-400">{property.realtor_email || ''}</div>
                  <div className="text-sm text-slate-400">{property.realtor_phone || ''}</div>
                </div>
              </div>

              <p className="text-slate-300 mb-4">
                Contacting and booking requires an account. Sign up or log in to message the realtor and request viewings.
              </p>
              <AuthCTA property={property} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicPropertyDetailsPage;

// Small component to render CTA for authenticated users vs guests
const AuthCTA = ({ property }) => {
  const { user, isAuthenticated } = useAuth();

  if (!property) return null;

  return (
    <div className="space-y-3">
      {isAuthenticated ? (
        <>
          <Link
            to={`/property/${property.public_slug || property._id}/book`}
            className="block w-full bg-violet-600 text-white text-center px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors font-medium"
          >
            Book Now
          </Link>
          <div className="mt-2">
            <SubscribeButton realtorId={property.realtorId || property.realtor_id} isSubscribedInitial={!!property.isSubscribedToOwner} />
          </div>
        </>
      ) : (
        <Link
          to="/register"
          className="block w-full bg-violet-600 text-white text-center px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors font-medium"
        >
          Sign up to contact
        </Link>
      )}

      <Button
        onClick={() => navigator.clipboard && navigator.clipboard.writeText(window.location.href)}
        variant="outline"
        className="w-full text-slate-200 border-slate-600"
      >
        Share Property
      </Button>
    </div>
  );
};
