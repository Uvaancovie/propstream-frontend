import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { propertiesAPI, bookingsAPI } from '../services/api';
import { getPropertiesFromStorage, addBookingToStorage } from '../utils/seedData';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  CalendarDaysIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  MapPinIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const BookingPage = () => {

  // Formatter for South African Rand
  const formatZAR = (value) => {
    const n = Number(value) || 0;
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);
  };
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProperty();
  }, [propertyId, isAuthenticated]);

  const fetchProperty = async () => {
    try {
      // For now, get from public properties since we don't have individual property endpoints
      const response = await propertiesAPI.getAllPublic();
      // Match by several possible identifiers: public_slug, _id, or id
      const foundProperty = response.properties.find(p => {
        const pid = String(propertyId);
        return (
          (p.public_slug && p.public_slug === pid) ||
          (p._id && String(p._id) === pid) ||
          (p.id && String(p.id) === pid)
        );
      });
      
      if (foundProperty) {
        setProperty(foundProperty);
      } else {
        toast.error('Property not found');
  navigate('/browse');
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Error loading property details');
  navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotalPrice = () => {
    if (!bookingData.checkIn || !bookingData.checkOut || !property) return 0;

    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (nights <= 0) return 0;

    // Handle formatted price strings like "R1,234.00" or "$1,234.00"
    const raw = property.price_per_night ?? property.price ?? 0;
    const numeric = Number(String(raw).replace(/[^0-9.-]+/g, '')) || 0;

    return nights * numeric;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingData.checkIn || !bookingData.checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (new Date(bookingData.checkIn) >= new Date(bookingData.checkOut)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    if (bookingData.guests > property.max_guests) {
      toast.error(`Maximum guests allowed: ${property.max_guests}`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare booking data for API
      const bookingPayload = {
        // canonical id expected by backend
        property_id: property._id || property.id,
        property_name: property.name,
        property_location: property.address || property.city,
        check_in: bookingData.checkIn,
        check_out: bookingData.checkOut,
        guests: parseInt(bookingData.guests),
        special_requests: bookingData.message,
        total_amount: calculateTotalPrice(),
        guest_name: user.name,
        guest_email: user.email,
        guest_phone: bookingData.phone || user.phone || '',
        status: 'pending',
        realtor_id: property.user_id,
        realtor_name: property.realtor_name,
        realtor_email: property.realtor_email
      };

      console.log('📋 Submitting booking:', bookingPayload);

      // Try to submit to backend first
      try {
        const response = await bookingsAPI.create(bookingPayload);
        console.log('✅ Booking created via API:', response);
        toast.success('🎉 Booking request submitted successfully!');
        navigate('/bookings');
        return;
      } catch (apiError) {
        console.warn('⚠️ API booking failed, falling back to localStorage:', apiError);
      }

      // Fallback to localStorage for demo purposes
      const booking = {
        id: Date.now(),
        propertyId: property._id || property.id,
        propertyName: property.name,
        propertyLocation: property.address || property.city,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: parseInt(bookingData.guests),
        message: bookingData.message,
        totalAmount: calculateTotalPrice(),
        guestName: user.name,
        guestEmail: user.email,
        guestPhone: bookingData.phone || user.phone || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        realtorId: property.user_id,
        realtorName: property.realtor_name,
        realtorEmail: property.realtor_email
      };

      // Use the addBookingToStorage utility function
      addBookingToStorage(booking);

      console.log('💾 Booking saved to localStorage:', booking);
      toast.success('🎉 Booking request submitted successfully!');
      navigate('/bookings');
    } catch (error) {
      console.error('❌ Booking error:', error);
      toast.error('Error submitting booking request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-100">Property not found</h2>
          <button 
            onClick={() => navigate('/browse')}
            className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
          >
            Browse Properties
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();
  const nights = bookingData.checkIn && bookingData.checkOut 
    ? Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Property Header */}
        <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
          <div className="relative h-64">
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[0]}
                alt={property.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <span className="text-4xl">🏠</span>
              </div>
            )}
          </div>
          
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-100 mb-2">{property.name}</h1>
            <div className="flex items-center text-gray-300 mb-4">
              <MapPinIcon className="h-5 w-5 mr-2" />
              <span>{property.city}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <UserGroupIcon className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                <span className="text-sm text-gray-300">{property.max_guests} guests</span>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-300">{property.bedrooms} bed</span>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-300">{property.bathrooms} bath</span>
              </div>
            </div>

            <p className="text-gray-300 mb-4">{property.description}</p>

            <div className="flex items-center">
              <CurrencyDollarIcon className="h-6 w-6 text-green-400 mr-2" />
              <span className="text-2xl font-bold text-green-400">
                {formatZAR(property.price_per_night)}/night
              </span>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Book Your Stay</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Check-in Date
                </label>
                <input
                  type="date"
                  name="checkIn"
                  value={bookingData.checkIn}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Check-out Date
                </label>
                <input
                  type="date"
                  name="checkOut"
                  value={bookingData.checkOut}
                  onChange={handleInputChange}
                  min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Number of Guests
              </label>
              <select
                name="guests"
                value={bookingData.guests}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                {Array.from({ length: property.max_guests }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} guest{i + 1 > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={bookingData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Your phone number for contact"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Special Requests (Optional)
              </label>
              <textarea
                name="message"
                value={bookingData.message}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Any special requests or questions..."
              />
            </div>

            {/* Booking Summary */}
            {nights > 0 && (
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">Booking Summary</h3>
                <div className="space-y-2 text-sm text-gray-100">
                  <div className="flex justify-between">
                    <span>{formatZAR(property.price_per_night)}/night × {nights} night{nights > 1 ? 's' : ''}</span>
                    <span>{formatZAR(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-green-400">{formatZAR(totalPrice)}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || nights <= 0}
              className="w-full bg-black text-white py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Request Booking
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
