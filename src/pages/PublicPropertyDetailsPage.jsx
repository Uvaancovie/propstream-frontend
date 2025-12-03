import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import SubscribeButton from '../components/SubscribeButton';
import {
  BedDouble,
  Bath,
  Users,
  MapPin,
  Share2,
  ShieldCheck,
  CalendarCheck,
  Sparkles
} from 'lucide-react';

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

  const shareProperty = async (method) => {
    const url = window.location.href;
    const priceVal = property?.price_per_night ?? property?.price ?? 0;
    const title = `${property.title} - ${formatPrice(priceVal)}`;

    switch (method) {
      case 'copy':
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(url);
        } else {
          const input = document.createElement('input');
          input.value = url;
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
        }
        break;
      case 'share':
        if (navigator.share) {
          try {
            await navigator.share({
              title,
              text: property.description?.slice(0, 140) || 'Check out this stay on Nova Prop',
              url
            });
          } catch (err) {
            console.warn('Web Share failed', err);
          }
          break;
        }
        // fallback to copy if Web Share not supported
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(url);
        }
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

  const heroImage =
    (property.images && property.images.length > 0 && normalizeImageUrl(property.images[0])) ||
    normalizeImageUrl(property.heroImage || property.coverImage);
  const locationLabel = [property.city, property.province || property.state, property.country]
    .filter(Boolean)
    .join(', ');
  const guestCount = property.max_guests || property.maxGuests || property.guests || 0;
  const nightlyRate = formatPrice(property.price_per_night ?? property.price);
  const highlights = [
    property.bedrooms ? `${property.bedrooms}+ serene bedrooms` : null,
    property.bathrooms ? `${property.bathrooms}+ spa bathrooms` : null,
    guestCount ? `Hosts up to ${guestCount} guests` : null,
    property.amenities?.includes('Sea View') ? 'Panoramic sea views' : null,
    property.amenities?.includes('Pool') ? 'Private pool experience' : null
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#05070F] text-slate-100">
      <header className="relative h-[420px] w-full overflow-hidden">
        <img
          src={heroImage}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070F] via-[#05070F]/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between gap-6">
            <div>
              <Link to="/browse" className="inline-flex items-center text-white/80 text-sm mb-4">
                ← Back to all stays
              </Link>
              <p className="uppercase tracking-[0.3em] text-xs text-white/60 mb-3">Exclusive Stay</p>
              <h1 className="text-3xl md:text-4xl font-semibold text-white max-w-3xl">
                {property.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-white/80">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {locationLabel || property.address}
                </span>
                {property.propertyType && (
                  <Badge className="bg-white/15 text-white border-white/20">
                    {property.propertyType}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right space-y-2">
              <p className="text-xs text-white/60 tracking-[0.2em]">FROM</p>
              <p className="text-3xl font-semibold text-white">{nightlyRate}</p>
              <p className="text-xs text-white/60">per night • flexible stays</p>
              <div className="flex md:justify-end gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShareMenuOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 text-white/80 text-sm border border-white/30 rounded-full px-4 py-2 hover:bg-white/10 transition"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  {shareMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#0f111b] border border-white/10 rounded-2xl shadow-xl z-20">
                      {[
                        { key: 'share', label: 'Share via device' },
                        { key: 'copy', label: 'Copy link' },
                        { key: 'facebook', label: 'Facebook' },
                        { key: 'twitter', label: 'Twitter' },
                        { key: 'linkedin', label: 'LinkedIn' },
                        { key: 'email', label: 'Email' }
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => shareProperty(key)}
                          className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 rounded-2xl"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-[#05070F] bg-white rounded-full px-4 py-2 font-semibold"
                >
                  Host with us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loadError && (
          <div className="mb-6 bg-yellow-900/20 border border-yellow-700 text-yellow-100/90 p-4 rounded-2xl">
            <strong>Unable to load property:</strong> {loadError}
          </div>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-10">
          <div className="space-y-8">
            <div className="rounded-3xl overflow-hidden">
              <div className="relative h-[420px] rounded-3xl overflow-hidden">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={normalizeImageUrl(property.images[activeImageIndex])}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900">
                    <Sparkles className="w-10 h-10 text-slate-500" />
                  </div>
                )}
                {property.images && property.images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    <button
                      onClick={() => setActiveImageIndex(Math.max(0, activeImageIndex - 1))}
                      className="bg-black/40 w-10 h-10 rounded-full text-white flex items-center justify-center hover:bg-black/60 transition"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setActiveImageIndex(Math.min(property.images.length - 1, activeImageIndex + 1))}
                      className="bg-black/40 w-10 h-10 rounded-full text-white flex items-center justify-center hover:bg-black/60 transition"
                    >
                      ›
                    </button>
                  </div>
                )}
                {property.images && property.images.length > 1 && (
                  <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2">
                    {property.images.slice(0, 6).map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`h-14 w-16 rounded-xl overflow-hidden border ${idx === activeImageIndex ? 'border-white' : 'border-white/30'} transition`}
                      >
                        <img
                          src={normalizeImageUrl(img)}
                          alt={`${property.title} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {property.bedrooms && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <BedDouble className="w-5 h-5 text-white/70" />
                  <p className="text-2xl font-semibold mt-2">{property.bedrooms}</p>
                  <p className="text-sm text-white/70">Bedrooms</p>
                </div>
              )}
              {property.bathrooms && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <Bath className="w-5 h-5 text-white/70" />
                  <p className="text-2xl font-semibold mt-2">{property.bathrooms}</p>
                  <p className="text-sm text-white/70">Bathrooms</p>
                </div>
              )}
              {guestCount ? (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <Users className="w-5 h-5 text-white/70" />
                  <p className="text-2xl font-semibold mt-2">{guestCount}</p>
                  <p className="text-sm text-white/70">Guests</p>
                </div>
              ) : null}
            </div>

            <Card className="bg-slate-900/40 border-slate-800 rounded-3xl p-8 text-white">
              <p className="uppercase tracking-[0.4em] text-xs text-white/50 mb-4">About this stay</p>
              <p className="text-lg leading-relaxed text-white/80 whitespace-pre-line">
                {property.description || 'No description available.'}
              </p>
            </Card>

            {highlights.length > 0 && (
              <Card className="bg-slate-900/50 border-slate-800 rounded-3xl p-8">
                <h2 className="text-xl font-semibold text-white mb-4">Why guests love it</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3 text-white/80">
                      <Sparkles className="w-4 h-4 text-violet-400 mt-1" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {property.amenities && property.amenities.length > 0 && (
              <Card className="bg-slate-900/50 border-slate-800 rounded-3xl p-8">
                <h2 className="text-xl font-semibold text-white mb-4">Amenities</h2>
                <div className="flex flex-wrap gap-3">
                  {property.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="text-sm px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Rental Agreement */}
            {property.rental_agreement && (
              <Card className="bg-slate-900/50 border-slate-800 rounded-3xl p-8">
                <h2 className="text-xl font-semibold text-white mb-4">Rental Agreement</h2>
                <p className="text-white/70 mb-4">
                  Review the rental agreement before booking. This document outlines the terms and conditions for your stay.
                </p>
                <a
                  href={normalizeImageUrl(property.rental_agreement)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Rental Agreement (PDF)
                </a>
              </Card>
            )}
          </div>

          <aside className="space-y-6">
            <Card className="bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sticky top-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">From</p>
                  <p className="text-3xl font-semibold">{nightlyRate}</p>
                  <p className="text-xs text-slate-400">Incl. concierge support</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Hosted by</p>
                  <p className="font-medium">{property.realtor_name || 'Realtor'}</p>
                  <p className="text-xs text-slate-400">{property.realtor_email}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <CalendarCheck className="w-4 h-4" />
                  Flexible check-in. Instant messaging after booking.
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <ShieldCheck className="w-4 h-4" />
                  Protected platform payments & verified hosts.
                </div>
              </div>

              <div className="mt-6">
                <AuthCTA property={property} />
              </div>
            </Card>

            <Card className="bg-slate-900/40 border-slate-800 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Hosted Experience</h3>
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={normalizeImageUrl(property.realtor_profileImage || '/novaprop-logo.jpeg')}
                  alt={(property.realtor_name || 'Realtor')}
                  className="w-14 h-14 rounded-full object-cover border border-white/10"
                />
                <div>
                  <p className="font-medium text-white">{property.realtor_name || 'Realtor'}</p>
                  <p className="text-sm text-white/70">{property.realtor_phone || ''}</p>
                </div>
              </div>
              <p className="text-sm text-white/70">
                Once you send a booking request, your dedicated host will confirm availability,
                arrange bespoke add-ons, and guide you from check-in to departure.
              </p>
            </Card>
          </aside>
        </section>
      </main>
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
