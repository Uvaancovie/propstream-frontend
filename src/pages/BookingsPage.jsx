import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bookingsAPI } from '../services/api';
import { getBookingsFromStorage } from '../utils/seedData';
import toast from 'react-hot-toast';
import { 
  CalendarDaysIcon, 
  MapPinIcon, 
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

const BookingsPage = () => {
  // Helper to format numbers as South African Rand (R)
  const formatZAR = (value) => {
    if (value == null) return 'R0';
    const num = Number(value) || 0;
    return 'R' + num.toLocaleString('en-ZA', { maximumFractionDigits: 0 });
  };
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, pending

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let userBookings = [];

      // Try to fetch from API first
      try {
        const response = await bookingsAPI.getAll();
        console.log('📋 API bookings response:', response);
        userBookings = response.bookings || [];
        
        // Filter bookings for current user based on role
        if (user?.role === 'client') {
          userBookings = userBookings.filter(booking => 
            booking.guest_email === user.email || booking.guestEmail === user.email
          );
        } else if (user?.role === 'realtor') {
          userBookings = userBookings.filter(booking => 
            booking.realtor_email === user.email || booking.realtorEmail === user.email
          );
        }
      } catch (apiError) {
        console.warn('⚠️ API fetch failed, using localStorage:', apiError);
        
        // Fallback to localStorage
        const storedBookings = getBookingsFromStorage();
        
        // Filter bookings for current user based on role
        if (user?.role === 'client') {
          userBookings = storedBookings.filter(booking => 
            booking.guestEmail === user.email
          );
        } else if (user?.role === 'realtor') {
          userBookings = storedBookings.filter(booking => 
            booking.realtorEmail === user.email
          );
        }
      }
      
      console.log('📋 Filtered bookings for user:', userBookings);
      setBookings(userBookings);
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      toast.error('Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return CheckCircleIcon;
      case 'pending':
        return ClockIcon;
      case 'cancelled':
        return XCircleIcon;
      default:
        return ClockIcon;
    }
  };

  const handleViewDetails = (booking) => {
    // Navigate to a booking details page
    window.location.href = `/booking/${booking._id || booking.id}`;
  };

  const filterBookings = (bookings, filter) => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return bookings.filter(booking => {
          // Handle both API naming (check_in) and localStorage naming (checkIn)
          const checkInDate = new Date(booking.check_in || booking.checkIn);
          return checkInDate > now;
        });
      case 'past':
        return bookings.filter(booking => {
          // Handle both API naming (check_out) and localStorage naming (checkOut)
          const checkOutDate = new Date(booking.check_out || booking.checkOut);
          return checkOutDate < now;
        });
      case 'pending':
        return bookings.filter(booking => booking.status === 'pending');
      default:
        return bookings;
    }
  };

  const filteredBookings = filterBookings(bookings, filter);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-gray-600">
            Manage your property bookings and view booking history
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Bookings', count: bookings.length },
                { key: 'upcoming', label: 'Upcoming', count: filterBookings(bookings, 'upcoming').length },
                { key: 'pending', label: 'Pending', count: filterBookings(bookings, 'pending').length },
                { key: 'past', label: 'Past', count: filterBookings(bookings, 'past').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      filter === tab.key ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            </h3>
            <p className="mt-2 text-gray-500">
              {filter === 'all' 
                ? 'Start exploring properties and make your first booking!' 
                : `You don't have any ${filter} bookings at the moment.`
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => window.location.href = '/browse-properties'}
                className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Browse Properties
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking, index) => {
              const StatusIcon = getStatusIcon(booking.status);
              // Handle both API naming (check_in) and localStorage naming (checkIn)
              const checkInDate = new Date(booking.check_in || booking.checkIn);
              const checkOutDate = new Date(booking.check_out || booking.checkOut);
              const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 mr-3">
                            {booking.property_name || booking.propertyName}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div className="flex items-center text-gray-600">
                            <CalendarDaysIcon className="h-5 w-5 mr-2" />
                            <div>
                              <div className="text-sm font-medium">Check-in</div>
                              <div className="text-sm">{checkInDate.toLocaleDateString()}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-gray-600">
                            <CalendarDaysIcon className="h-5 w-5 mr-2" />
                            <div>
                              <div className="text-sm font-medium">Check-out</div>
                              <div className="text-sm">{checkOutDate.toLocaleDateString()}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-gray-600">
                            <UserGroupIcon className="h-5 w-5 mr-2" />
                            <div>
                              <div className="text-sm font-medium">Guests</div>
                              <div className="text-sm">{booking.guests} guest{booking.guests > 1 ? 's' : ''}</div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center text-green-600">
                            <CurrencyDollarIcon className="h-5 w-5 mr-1" />
                            <span className="font-semibold">
                              {formatZAR(booking.total_amount || booking.totalPrice)} total ({nights} night{nights > 1 ? 's' : ''})
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-500">
                            Booked on {new Date(booking.createdAt || booking.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        {(booking.special_requests || booking.message) && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm font-medium text-gray-700 mb-1">Special Requests:</div>
                            {user?.role === 'realtor' && (booking.guest_name || booking.guestName || booking.guest_name === '') && (
                              <div className="text-xs text-gray-500 mb-2">
                                From: <span className="font-medium text-gray-700">{booking.guest_name || booking.guestName || booking.guestName}</span>
                                {' '}— Sent on {new Date(booking.createdAt || booking.created_at).toLocaleDateString()}
                              </div>
                            )}
                            <div className="text-sm text-gray-600">{booking.special_requests || booking.message}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex space-x-3">
                      {booking.status === 'pending' && (
                        <button className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                          Cancel Request
                        </button>
                      )}
                      
                      {booking.status === 'confirmed' && new Date(booking.checkIn) > new Date() && (
                        <button className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
                          Modify Booking
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleViewDetails(booking)}
                        className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;
