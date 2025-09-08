import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  CalendarDaysIcon,
  PlusIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const CalendarPage = () => {
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [bookingForm, setBookingForm] = useState({
    propertyId: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    totalPrice: 0,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [propertiesRes, bookingsRes] = await Promise.all([
        api.get('/properties'),
        api.get('/bookings')
      ]);
      
      setProperties(propertiesRes.data.properties || []);
      setBookings(bookingsRes.data.bookings || []);
      
      console.log('Calendar data loaded:', {
        properties: propertiesRes.data.properties?.length || 0,
        bookings: bookingsRes.data.bookings?.length || 0
      });
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      const bookingData = {
        property_id: bookingForm.propertyId,
        guest_name: bookingForm.guestName,
        guest_email: bookingForm.guestEmail,
        guest_phone: bookingForm.guestPhone,
        start_date: bookingForm.checkIn,
        end_date: bookingForm.checkOut,
        guest_count: parseInt(bookingForm.guests),
        total_price: parseFloat(bookingForm.totalPrice),
        notes: bookingForm.notes
      };

      await api.post('/bookings', bookingData);
      setShowBookingModal(false);
      resetBookingForm();
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  const resetBookingForm = () => {
    setBookingForm({
      propertyId: '',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      checkIn: '',
      checkOut: '',
      guests: 1,
      totalPrice: 0,
      notes: ''
    });
  };

  const openBookingModal = (propertyId = '') => {
    setBookingForm(prev => ({ ...prev, propertyId }));
    setShowBookingModal(true);
  };

  const calculateTotalPrice = () => {
    if (!bookingForm.propertyId || !bookingForm.checkIn || !bookingForm.checkOut) return 0;
    
    const property = properties.find(p => p._id === bookingForm.propertyId);
    if (!property) return 0;
    
    const checkIn = new Date(bookingForm.checkIn);
    const checkOut = new Date(bookingForm.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    return nights * property.pricePerNight;
  };

  // Update total price when dates or property changes
  useEffect(() => {
    const total = calculateTotalPrice();
    setBookingForm(prev => ({ ...prev, totalPrice: total }));
  }, [bookingForm.propertyId, bookingForm.checkIn, bookingForm.checkOut, properties]);

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDatePointer = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dayBookings = bookings.filter(booking => {
        // Handle both API naming (check_in/check_out) and localStorage naming (start/start_date)
        const bookingStart = new Date(booking.check_in || booking.start_date || booking.start || booking.checkIn);
        const bookingEnd = new Date(booking.check_out || booking.end_date || booking.end || booking.checkOut);
        return currentDatePointer >= bookingStart && currentDatePointer <= bookingEnd;
      });
      
      days.push({
        date: new Date(currentDatePointer),
        isCurrentMonth: currentDatePointer.getMonth() === month,
        bookings: dayBookings
      });
      
      currentDatePointer.setDate(currentDatePointer.getDate() + 1);
    }
    
    return days;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getBookingColor = (booking) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500'
    ];
    const propertyIndex = properties.findIndex(p => p._id === booking.property_id);
    return colors[propertyIndex % colors.length] || 'bg-gray-500';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const calendarDays = generateCalendarDays();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar & Bookings</h1>
          <p className="mt-2 text-gray-600">
            Manage your property bookings and availability
          </p>
        </div>
        <button
          onClick={() => openBookingModal()}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Booking
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                R{bookings.reduce((sum, booking) => {
                  const amount = booking.total_amount || booking.total_price || booking.totalPrice || 0;
                  return sum + parseFloat(amount);
                }, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <UserGroupIcon className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Guests</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.reduce((sum, booking) => {
                  const guests = booking.guests || booking.guest_count || 0;
                  return sum + parseInt(guests);
                }, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <ClockIcon className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Stay</p>
              <p className="text-2xl font-bold text-gray-900">5 nights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[100px] p-2 border border-gray-100 rounded-lg ${
                  day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${
                  day.date.toDateString() === new Date().toDateString() 
                    ? 'ring-2 ring-blue-500 ring-opacity-50' 
                    : ''
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {day.date.getDate()}
                </div>
                
                {/* Bookings for this day */}
                <div className="space-y-1">
                  {day.bookings.slice(0, 2).map((booking, bookingIndex) => {
                    const property = properties.find(p => p._id === booking.property_id);
                    return (
                      <div
                        key={bookingIndex}
                        className={`text-xs p-1 rounded text-white truncate ${getBookingColor(booking)}`}
                        title={`${booking.guest_name || booking.guestName} - ${property?.name || 'Unknown Property'}`}
                      >
                        {booking.guest_name || booking.guestName || 'Guest'}
                      </div>
                    );
                  })}
                  {day.bookings.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{day.bookings.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {bookings.slice(0, 5).map((booking) => {
            const property = properties.find(p => p._id === booking.property_id);
            return (
              <div key={booking._id || booking.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${getBookingColor(booking)}`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {booking.guest_name || booking.guestName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {property?.name || 'Unknown Property'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(booking.check_in || booking.start_date || booking.start || booking.checkIn).toLocaleDateString()} - 
                      {new Date(booking.check_out || booking.end_date || booking.end || booking.checkOut).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      R{booking.total_amount || booking.total_price || booking.totalPrice || 0}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Booking</h2>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  resetBookingForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateBooking} className="p-6 space-y-6">
              {/* Property Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property *
                </label>
                <select
                  required
                  value={bookingForm.propertyId}
                  onChange={(e) => setBookingForm({...bookingForm, propertyId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a property</option>
                  {properties.map(property => (
                    <option key={property._id} value={property._id}>
                      {property.name} - R{property.pricePerNight}/night
                    </option>
                  ))}
                </select>
              </div>

              {/* Guest Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.guestName}
                    onChange={(e) => setBookingForm({...bookingForm, guestName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={bookingForm.guestEmail}
                    onChange={(e) => setBookingForm({...bookingForm, guestEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={bookingForm.guestPhone}
                  onChange={(e) => setBookingForm({...bookingForm, guestPhone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+27 123 456 789"
                />
              </div>

              {/* Dates and Guests */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in *
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingForm.checkIn}
                    onChange={(e) => setBookingForm({...bookingForm, checkIn: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out *
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingForm.checkOut}
                    onChange={(e) => setBookingForm({...bookingForm, checkOut: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guests *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bookingForm.guests}
                    onChange={(e) => setBookingForm({...bookingForm, guests: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Total Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">R</span>
                  <input
                    type="number"
                    step="0.01"
                    value={bookingForm.totalPrice}
                    onChange={(e) => setBookingForm({...bookingForm, totalPrice: e.target.value})}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special requests or notes..."
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingModal(false);
                    resetBookingForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                >
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
