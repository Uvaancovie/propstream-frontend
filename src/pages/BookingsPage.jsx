import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  PlusIcon, 
  CalendarDaysIcon,
  UserIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    property: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: '',
    checkOut: '',
    guests: '',
    totalAmount: '',
    status: 'confirmed',
    platform: 'direct',
    specialRequests: ''
  });

  useEffect(() => {
    fetchBookings();
    fetchProperties();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      console.log('Bookings response:', response.data);
      console.log('Bookings array:', response.data.bookings);
      
      // Handle the backend response structure
      if (response.data.bookings && Array.isArray(response.data.bookings)) {
        setBookings(response.data.bookings);
      } else if (Array.isArray(response.data)) {
        setBookings(response.data);
      } else {
        console.warn('Bookings data is not an array:', response.data);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]); // Ensure bookings is always an array
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await api.get('/properties');
      console.log('Properties response:', response.data);
      console.log('Properties array:', response.data.properties);
      
      // Handle the backend response structure
      if (response.data.properties && Array.isArray(response.data.properties)) {
        console.log('Setting properties from response.data.properties:', response.data.properties);
        setProperties(response.data.properties);
      } else if (Array.isArray(response.data)) {
        console.log('Setting properties from response.data:', response.data);
        setProperties(response.data);
      } else {
        console.warn('Properties data is not an array:', response.data);
        setProperties([]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]); // Ensure properties is always an array
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Form data before processing:', formData);
      console.log('Available properties:', properties);
      
      // Validate that property is a valid ID, not a name
      console.log('Looking for property with ID:', formData.property, typeof formData.property);
      const selectedProperty = properties.find(p => {
        const pId = p._id || p.id;
        console.log('Comparing with property:', pId, typeof pId, 'Match:', pId == formData.property);
        return pId == formData.property; // Use == for type-flexible comparison
      });
      if (!selectedProperty) {
        console.error('Property not found. FormData.property:', formData.property);
        console.error('Available properties:', properties.map(p => ({ id: p._id || p.id, name: p.name })));
        console.error('Raw properties data:', properties);
        alert('Please select a valid property');
        return;
      }
      
      // Additional validation: ensure the property value is numeric
      const propertyId = parseInt(formData.property);
      if (isNaN(propertyId)) {
        console.error('Property ID is not a number:', formData.property);
        alert('Invalid property selection. Please refresh and try again.');
        return;
      }
      
      console.log('Selected property:', selectedProperty);
      console.log('Property ID (parsed):', propertyId);
      
      const bookingData = {
        property_id: propertyId, // Use the parsed integer ID
        guest_name: formData.guestName,
        guest_email: formData.guestEmail,
        guest_phone: formData.guestPhone,
        start_date: formData.checkIn,
        end_date: formData.checkOut,
        guest_count: parseInt(formData.guests) || 1,
        total_price: parseFloat(formData.totalAmount) || 0,
        status: formData.status,
        platform: formData.platform,
        notes: formData.specialRequests
      };

      console.log('Sending booking data:', bookingData);

      if (selectedBooking) {
        await api.put(`/bookings/${selectedBooking._id}`, bookingData);
      } else {
        await api.post('/bookings', bookingData);
      }

      setShowModal(false);
      setSelectedBooking(null);
      resetForm();
      fetchBookings();
    } catch (error) {
      console.error('Error saving booking:', error);
      console.error('Error details:', error.response?.data);
      
      // Show user-friendly error message
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to save booking. Please try again.';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleEdit = (booking) => {
    console.log('Editing booking:', booking);
    console.log('Available properties for edit:', properties);
    
    setSelectedBooking(booking);
    
    // Find the correct property ID
    let propertyId = booking.property_id || booking.property?._id;
    
    // If property is populated as an object, get the ID
    if (booking.property && typeof booking.property === 'object') {
      propertyId = booking.property._id || booking.property.id;
    }
    
    console.log('Setting property ID to:', propertyId);
    
    setFormData({
      property: propertyId,
      guestName: booking.guest_name || booking.guestName,
      guestEmail: booking.guest_email || booking.guestEmail,
      guestPhone: booking.guest_phone || booking.guestPhone || '',
      checkIn: booking.start_date || booking.start || booking.checkIn,
      checkOut: booking.end_date || booking.end || booking.checkOut,
      guests: (booking.guest_count || booking.guests || 1).toString(),
      totalAmount: (booking.total_price || booking.totalPrice || 0).toString(),
      status: booking.status || 'confirmed',
      platform: booking.platform || 'direct',
      specialRequests: booking.notes || booking.specialRequests || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await api.delete(`/api/bookings/${bookingId}`);
        fetchBookings();
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      property: '',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      checkIn: '',
      checkOut: '',
      guests: '',
      totalAmount: '',
      status: 'confirmed',
      platform: 'direct',
      specialRequests: ''
    });
  };

  const openModal = () => {
    resetForm();
    setSelectedBooking(null);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
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
      case 'completed':
        return CheckCircleIcon;
      default:
        return ClockIcon;
    }
  };

  const filteredBookings = Array.isArray(bookings) ? bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  }) : [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateNights = (checkIn, checkOut) => {
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    return nights;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="mt-2 text-gray-600">
            Manage your property reservations and guest stays
          </p>
        </div>
        <button
          onClick={openModal}
          className="btn btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Booking</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'all', label: 'All Bookings' },
          { key: 'confirmed', label: 'Confirmed' },
          { key: 'pending', label: 'Pending' },
          { key: 'completed', label: 'Completed' },
          { key: 'cancelled', label: 'Cancelled' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <CalendarDaysIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? 'Get started by creating your first booking.'
              : `No ${filter} bookings at the moment.`
            }
          </p>
          {filter === 'all' && (
            <button
              onClick={openModal}
              className="btn btn-primary"
            >
              Create First Booking
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const StatusIcon = getStatusIcon(booking.status);
            const nights = calculateNights(
              booking.start_date || booking.start || booking.checkIn, 
              booking.end_date || booking.end || booking.checkOut
            );
            
            return (
              <div key={booking._id || booking.id || `booking-${Math.random()}`} className="card hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    {/* Guest Info */}
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {booking.guest_name || booking.guestName}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {booking.guest_email || booking.guestEmail}
                      </p>
                      <p className="text-xs text-gray-500">{booking.platform || 'direct'}</p>
                    </div>

                    {/* Property */}
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {booking.property_name || booking.propertyName || booking.property?.name || 'Unknown Property'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {booking.property?.city || 'Unknown Location'}
                      </p>
                    </div>

                    {/* Dates */}
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(booking.start_date || booking.start || booking.checkIn)} - {formatDate(booking.end_date || booking.end || booking.checkOut)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {nights} night{nights !== 1 ? 's' : ''} • {booking.guest_count || booking.guests || 1} guest{(booking.guest_count || booking.guests || 1) !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Amount */}
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          R{booking.total_price || booking.totalPrice || 0}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        R{nights > 0 ? Math.round((booking.total_price || booking.totalPrice || 0) / nights) : 0}/night
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(booking)}
                      className="btn btn-secondary text-sm"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(booking._id)}
                      className="btn btn-danger text-sm"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Special Requests */}
                {booking.specialRequests && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Special Requests:</span> {booking.specialRequests}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {selectedBooking ? 'Edit Booking' : 'Add New Booking'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property *
                  </label>
                  <select
                    required
                    className="input"
                    value={formData.property}
                    onChange={(e) => {
                      console.log('Property selection changed to:', e.target.value);
                      setFormData({...formData, property: e.target.value});
                    }}
                  >
                    <option key="select-property" value="">Select a property</option>
                    {Array.isArray(properties) && properties.map((property) => {
                      const propertyId = property._id || property.id;
                      const propertyName = `${property.name} - ${property.city}`;
                      console.log('Rendering property option:', { propertyId, propertyName, property });
                      return (
                        <option key={propertyId} value={propertyId}>
                          {propertyName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guest Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="input"
                      value={formData.guestName}
                      onChange={(e) => setFormData({...formData, guestName: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guest Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="input"
                      value={formData.guestEmail}
                      onChange={(e) => setFormData({...formData, guestEmail: e.target.value})}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guest Phone
                  </label>
                  <input
                    type="tel"
                    className="input"
                    value={formData.guestPhone}
                    onChange={(e) => setFormData({...formData, guestPhone: e.target.value})}
                    placeholder="+27 12 345 6789"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="input"
                      value={formData.checkIn}
                      onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="input"
                      value={formData.checkOut}
                      onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guests *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="input"
                      value={formData.guests}
                      onChange={(e) => setFormData({...formData, guests: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Amount (R) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="input"
                      value={formData.totalAmount}
                      onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform
                    </label>
                    <select
                      className="input"
                      value={formData.platform}
                      onChange={(e) => setFormData({...formData, platform: e.target.value})}
                    >
                      <option key="direct" value="direct">Direct</option>
                      <option key="airbnb" value="airbnb">Airbnb</option>
                      <option key="vrbo" value="vrbo">Vrbo</option>
                      <option key="booking.com" value="booking.com">Booking.com</option>
                      <option key="other" value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="input"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option key="pending" value="pending">Pending</option>
                    <option key="confirmed" value="confirmed">Confirmed</option>
                    <option key="completed" value="completed">Completed</option>
                    <option key="cancelled" value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests
                  </label>
                  <textarea
                    rows="3"
                    className="input"
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                    placeholder="Late check-in, early check-out, extra bedding..."
                  />
                </div>

                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                  >
                    {selectedBooking ? 'Update Booking' : 'Create Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
