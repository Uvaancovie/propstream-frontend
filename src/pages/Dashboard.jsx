import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  BuildingOfficeIcon, 
  CalendarDaysIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    properties: [],
    bookings: [],
    totalProperties: 0,
    activeBookings: 0,
    totalGuests: 0,
    monthlyRevenue: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [propertiesRes, bookingsRes] = await Promise.all([
        api.get('/properties'),
        api.get('/bookings')
      ]);
      
      const properties = propertiesRes.data.properties || [];
      const bookings = bookingsRes.data.bookings || [];
      
      // Calculate stats
      const totalProperties = properties.length;
      const activeBookings = bookings.filter(booking => {
        const today = new Date();
        const startDate = new Date(booking.start_date || booking.start);
        const endDate = new Date(booking.end_date || booking.end);
        return startDate <= today && endDate >= today;
      }).length;
      
      const totalGuests = bookings.reduce((sum, booking) => 
        sum + (booking.guest_count || booking.guests || 0), 0
      );
      
      const totalRevenue = bookings.reduce((sum, booking) => 
        sum + (booking.total_price || booking.totalPrice || 0), 0
      );
      
      // Calculate monthly revenue (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = bookings
        .filter(booking => {
          const bookingDate = new Date(booking.start_date || booking.start);
          return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
        })
        .reduce((sum, booking) => sum + (booking.total_price || booking.totalPrice || 0), 0);

      setDashboardData({
        properties,
        bookings,
        totalProperties,
        activeBookings,
        totalGuests,
        monthlyRevenue,
        totalRevenue
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      name: 'Total Properties',
      value: dashboardData.totalProperties.toString(),
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500',
      description: 'Properties in your portfolio'
    },
    {
      name: 'Active Bookings',
      value: dashboardData.activeBookings.toString(),
      icon: CalendarDaysIcon,
      color: 'bg-green-500',
      description: 'Current and upcoming reservations'
    },
    {
      name: 'Total Guests',
      value: dashboardData.totalGuests.toString(),
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      description: 'Guests served all time'
    },
    {
      name: 'Total Revenue',
      value: `R${dashboardData.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
      description: 'Total earnings all time'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Property',
      description: 'List a new rental property',
      href: '/properties',
      icon: BuildingOfficeIcon,
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
    },
    {
      title: 'Create Booking',
      description: 'Add a manual reservation',
      href: '/bookings',
      icon: CalendarDaysIcon,
      color: 'bg-green-50 text-green-600 hover:bg-green-100'
    },
    {
      title: 'Sync Calendar',
      description: 'Import from booking platforms',
      href: '/calendar',
      icon: ArrowTrendingUpIcon,
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100'
    }
  ];

  const recentActivity = [
    {
      type: 'info',
      message: 'Welcome to Propstream! Start by adding your first property.',
      time: 'Just now',
      icon: BuildingOfficeIcon
    }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || 'Property Manager'}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your properties today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">{stat.description}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <a
                    key={action.title}
                    href={action.href}
                    className={`p-4 rounded-lg border border-gray-200 transition-colors duration-200 ${action.color}`}
                  >
                    <Icon className="w-8 h-8 mb-3" />
                    <h3 className="font-semibold mb-1">{action.title}</h3>
                    <p className="text-sm opacity-75">{action.description}</p>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Getting Started Guide */}
          <div className="card mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary-600">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Add Your First Property</h3>
                  <p className="text-sm text-gray-600">Create a property listing with photos and details.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-400">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Set Up Calendar Sync</h3>
                  <p className="text-sm text-gray-500">Connect with Airbnb, Vrbo, and other platforms.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-400">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Create Message Templates</h3>
                  <p className="text-sm text-gray-500">Automate guest communications.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Icon className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <div className="flex items-center mt-1">
                        <ClockIcon className="w-3 h-3 text-gray-400 mr-1" />
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* API Status */}
          <div className="card mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Connection</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Calendar Sync</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Setup Required
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
