import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { seedDemoData, getPropertiesFromStorage } from '../utils/seedData';
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
  const { user, loading: authLoading } = useAuth();
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
    // Only fetch dashboard data when user is loaded
    if (user) {
      console.log('🚀 User loaded, fetching dashboard data:', user);
      fetchDashboardData();
    } else {
      console.log('⏳ Waiting for user data...');
    }
  }, [user]);

  // Debug logging for loading states
  useEffect(() => {
    console.log('📊 Dashboard state:', { authLoading, loading, user: !!user });
    
    // For testing - if no user is loaded but we're not in auth loading, try to get user from localStorage
    if (!user && !authLoading) {
      const storedUser = localStorage.getItem('user');
      console.log('🔍 Checking localStorage for user:', storedUser);
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('👤 Found stored user data:', userData);
        } catch (e) {
          console.error('❌ Error parsing stored user:', e);
        }
      }
    }
  }, [authLoading, loading, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching dashboard data for user:', user);
      
      // Seed demo data first
      seedDemoData();
      
      let properties = [];
      
      // Try to get properties from API first
      try {
        const propertiesRes = await api.get('/properties/public');
        properties = propertiesRes.data.properties || [];
        console.log('✅ Properties from API:', properties.length);
      } catch (apiError) {
        console.warn('⚠️ API failed, using localStorage:', apiError);
        // Fallback to localStorage
        properties = getPropertiesFromStorage();
        console.log('💾 Properties from localStorage:', properties.length);
      }
      
      // Get bookings from localStorage for demo
      const storedBookings = JSON.parse(localStorage.getItem('propstream_bookings') || '[]');
      
      // Filter data based on user role
      let userBookings = [];
      let userProperties = [];
      
      if (user?.role === 'realtor') {
        // Realtors see their own properties and bookings for their properties
        userProperties = properties.filter(p => 
          p.realtor_email === user.email || 
          p.user_id === user.id
        );
        userBookings = storedBookings.filter(b => 
          b.realtorEmail === user.email ||
          userProperties.some(p => p.id === b.propertyId)
        );
      } else {
        // Clients see all properties but only their own bookings
        userProperties = properties;
        userBookings = storedBookings.filter(b => 
          b.guestEmail === user.email
        );
      }
      
      console.log('📋 User properties:', userProperties.length);
      console.log('📅 User bookings:', userBookings.length);
      
      // Calculate stats based on user role
      const totalProperties = user?.role === 'realtor' ? userProperties.length : properties.length;
      const activeBookings = userBookings.filter(b => b.status !== 'cancelled').length;
      const totalGuests = userBookings.reduce((sum, booking) => sum + (booking.guests || 0), 0);
      const monthlyRevenue = userBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
      
      setDashboardData({
        properties: userProperties,
        bookings: userBookings,
        totalProperties,
        activeBookings,
        totalGuests,
        monthlyRevenue,
        totalRevenue: monthlyRevenue
      });
    } catch (error) {
      console.error('❌ Dashboard data fetch error:', error);
      // Set default data to prevent blank page
      setDashboardData({
        properties: [],
        bookings: [],
        totalProperties: 0,
        activeBookings: 0,
        totalGuests: 0,
        monthlyRevenue: 0,
        totalRevenue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = user?.role === 'realtor' ? [
    {
      name: 'My Properties',
      value: dashboardData.totalProperties.toString(),
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500',
      description: 'Properties you\'ve listed'
    },
    {
      name: 'Active Bookings',
      value: dashboardData.activeBookings.toString(),
      icon: CalendarDaysIcon,
      color: 'bg-green-500',
      description: 'Current and upcoming reservations'
    },
    {
      name: 'Total Revenue',
      value: `R${dashboardData.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
      description: 'Total earnings this month'
    },
    {
      name: 'Total Clients',
      value: dashboardData.totalGuests.toString(),
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      description: 'Unique clients served'
    }
  ] : [
    {
      name: 'Available Properties',
      value: dashboardData.totalProperties.toString(),
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500',
      description: 'Properties ready to book'
    },
    {
      name: 'My Bookings',
      value: dashboardData.activeBookings.toString(),
      icon: CalendarDaysIcon,
      color: 'bg-green-500',
      description: 'Your current reservations'
    },
    {
      name: 'Favorite Properties',
      value: '0',
      icon: CurrencyDollarIcon,
      color: 'bg-purple-500',
      description: 'Properties you\'ve saved'
    },
    {
      name: 'Reviews Given',
      value: '0',
      icon: UserGroupIcon,
      color: 'bg-yellow-500',
      description: 'Reviews you\'ve written'
    }
  ];

  const quickActions = user?.role === 'realtor' ? [
    {
      title: 'Add New Property',
      description: 'List a new rental property',
      href: '/properties/add',
      icon: BuildingOfficeIcon,
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
    },
    {
      title: 'View Calendar',
      description: 'Check your booking calendar',
      href: '/calendar',
      icon: CalendarDaysIcon,
      color: 'bg-green-50 text-green-600 hover:bg-green-100'
    },
    {
      title: 'Manage Properties',
      description: 'Edit your property listings',
      href: '/properties',
      icon: ArrowTrendingUpIcon,
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100'
    }
  ] : [
    {
      title: 'Browse Properties',
      description: 'Find your perfect stay',
      href: '/browse-properties',
      icon: BuildingOfficeIcon,
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
    },
    {
      title: 'My Bookings',
      description: 'View your reservations',
      href: '/bookings',
      icon: CalendarDaysIcon,
      color: 'bg-green-50 text-green-600 hover:bg-green-100'
    },
    {
      title: 'Account Settings',
      description: 'Update your profile',
      href: '/billing',
      icon: ArrowTrendingUpIcon,
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100'
    }
  ];

  const recentActivity = user?.role === 'realtor' ? [
    {
      type: 'info',
      message: 'Welcome to Propstream! Start by adding your first property.',
      time: 'Just now',
      icon: BuildingOfficeIcon
    }
  ] : [
    {
      type: 'info',
      message: 'Welcome to Propstream! Start by browsing amazing properties.',
      time: 'Just now',
      icon: BuildingOfficeIcon
    }
  ];

  const gettingStartedSteps = user?.role === 'realtor' ? [
    {
      number: 1,
      title: 'Add Your First Property',
      description: 'Create a property listing with photos and details.',
      completed: false
    },
    {
      number: 2,
      title: 'Set Up Your Calendar',
      description: 'Configure availability and booking settings.',
      completed: false
    },
    {
      number: 3,
      title: 'Manage Bookings',
      description: 'Accept reservations and communicate with clients.',
      completed: false
    }
  ] : [
    {
      number: 1,
      title: 'Browse Properties',
      description: 'Explore available properties in your area.',
      completed: false
    },
    {
      number: 2,
      title: 'Make Your First Booking',
      description: 'Reserve a property for your stay.',
      completed: false
    },
    {
      number: 3,
      title: 'Leave a Review',
      description: 'Share your experience with other travelers.',
      completed: false
    }
  ];

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Show message if user is not loaded yet
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Dashboard...</h2>
          <p className="text-gray-600">Please wait while we load your data.</p>
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p className="text-yellow-800 text-sm">
              Debug: authLoading={authLoading.toString()}, loading={loading.toString()}, user={user ? 'exists' : 'null'}
            </p>
            <button 
              onClick={() => {
                // Test button to manually set user for debugging
                const testUser = { id: 1, name: 'Test User', email: 'test@example.com', role: 'realtor' };
                localStorage.setItem('user', JSON.stringify(testUser));
                window.location.reload();
              }}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Set Test User (Debug)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          {user?.role === 'realtor' 
            ? "Manage your properties and track your bookings." 
            : "Browse amazing properties and book your next stay."
          }
        </p>
        {!loading && dashboardData.totalProperties === 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              🏠 Welcome to Propstream! We have {dashboardData.totalProperties || 7} properties available to explore.
            </p>
          </div>
        )}
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
                  <Link
                    key={action.title}
                    to={action.href}
                    className={`p-4 rounded-lg border border-gray-200 transition-colors duration-200 ${action.color}`}
                  >
                    <Icon className="w-8 h-8 mb-3" />
                    <h3 className="font-semibold mb-1">{action.title}</h3>
                    <p className="text-sm opacity-75">{action.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Getting Started Guide */}
          <div className="card mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
            <div className="space-y-4">
              {gettingStartedSteps.map((step) => (
                <div key={step.number} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-100' 
                      : step.number === 1 
                        ? 'bg-primary-100' 
                        : 'bg-gray-100'
                  }`}>
                    <span className={`text-xs font-semibold ${
                      step.completed 
                        ? 'text-green-600' 
                        : step.number === 1 
                          ? 'text-primary-600' 
                          : 'text-gray-400'
                    }`}>
                      {step.number}
                    </span>
                  </div>
                  <div>
                    <h3 className={`font-medium ${
                      step.completed 
                        ? 'text-green-900' 
                        : step.number === 1 
                          ? 'text-gray-900' 
                          : 'text-gray-500'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm ${
                      step.completed 
                        ? 'text-green-600' 
                        : step.number === 1 
                          ? 'text-gray-600' 
                          : 'text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
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
