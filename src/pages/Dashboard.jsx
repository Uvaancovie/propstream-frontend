import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { propertiesAPI, bookingsAPI, billingAPI } from '../services/api';
import { seedDemoData, getPropertiesFromStorage } from '../utils/seedData';
import LoadingSpinner from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { 
  BuildingOfficeIcon, 
  CalendarDaysIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  
  // Redirect owners/admins to admin dashboard
  if (user && (user.role === 'owner' || user.role === 'admin')) {
    return <Navigate to="/admin" replace />;
  }
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
      fetchSubscription();
      fetchDashboardData();
    }
  }, [user]);

  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [startingTrial, setStartingTrial] = useState(false);

  const fetchSubscription = async () => {
    try {
      const res = await billingAPI.getSubscription();
      setSubscriptionInfo(res.subscription || null);
    } catch (err) {
      console.warn('Could not fetch subscription info', err);
      setSubscriptionInfo(null);
    }
  };

  const handleStartTrial = async () => {
    if (!window.confirm('Start a 14-day free trial for your organization?')) return;
    setStartingTrial(true);
    try {
      const res = await billingAPI.startTrial({ planId: 'starter' });
      if (res && res.subscription) {
        setSubscriptionInfo(res.subscription);
        alert('Trial started — you have 14 days free.');
      } else {
        alert('Trial started.');
      }
    } catch (err) {
      console.error('start trial error', err);
      alert('Unable to start trial: ' + (err.response?.data?.message || err.message));
    } finally {
      setStartingTrial(false);
    }
  };

  // Welcome section component based on user role
  const WelcomeSection = () => {
    if (!user) return null;
    
    return (
      <div className="bg-[#0B0B0E] p-6 rounded-lg shadow-lg border border-slate-800 mb-6">
        <h2 className="text-2xl font-bold mb-2 text-white">Welcome, {user.name || user.email}!</h2>
        <p className="text-slate-400 mb-4">
          {user.role === 'realtor' 
            ? 'Manage your properties, bookings, and clients from your dashboard.' 
            : 'Browse properties, manage your bookings, and messages from your dashboard.'}
        </p>
        <div className="flex flex-wrap gap-3">
          {user.role === 'realtor' && (
            <>
              <Link to="/properties/add">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                  Add New Property
                </Button>
              </Link>
              <Link to="/calendar">
                <Button className="bg-slate-700 hover:bg-slate-600 text-white">
                  View Calendar
                </Button>
              </Link>
              {/* Trial CTA */}
              {!subscriptionInfo || subscriptionInfo.status === 'trialing' || subscriptionInfo.status === 'trial_expired' ? (
                <Button onClick={handleStartTrial} disabled={startingTrial} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {startingTrial ? 'Starting...' : 'Start 14-day Free Trial'}
                </Button>
              ) : null}
            </>
          )}
          {user.role === 'client' && (
            <>
              <Link to="/browse">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                  Browse Properties
                </Button>
              </Link>
              <Link to="/bookings">
                <Button className="bg-slate-700 hover:bg-slate-600 text-white">
                  My Bookings
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    );
  };

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
        let propertiesData;
        
        if (user?.role === 'realtor') {
          // For realtors, fetch their own properties
          propertiesData = await propertiesAPI.getAll();
        } else {
          // For clients, fetch public properties
          propertiesData = await propertiesAPI.getAllPublic();
        }
        
        properties = propertiesData.properties || [];
        console.log('✅ Properties from API:', properties.length);
      } catch (apiError) {
        console.warn('⚠️ API failed, using localStorage:', apiError);
        // Fallback to localStorage
        properties = getPropertiesFromStorage();
        console.log('💾 Properties from localStorage:', properties.length);
      }
      
      // Get bookings
      let bookings = [];
      try {
        // Try to get bookings from API first
        const bookingsData = await bookingsAPI.getAll();
        bookings = bookingsData.bookings || [];
        console.log('✅ Bookings from API:', bookings.length);
      } catch (apiError) {
        console.warn('⚠️ Bookings API failed, using localStorage:', apiError);
        // Fallback to localStorage
        const storedBookings = JSON.parse(localStorage.getItem('propstream_bookings') || '[]');
        bookings = storedBookings;
      }
      
      // Filter data based on user role
      let userBookings = [];
      let userProperties = [];
      
      if (user?.role === 'realtor') {
        // Realtors see their own properties and bookings for their properties
        userProperties = properties.filter(p => 
          p.realtor_email === user.email || 
          p.realtor_id === user.id
        );
        userBookings = bookings.filter(b => 
          b.realtor_email === user.email ||
          userProperties.some(p => p.id === b.property_id || p._id === b.property_id)
        );
      } else {
        // Clients see all properties but only their own bookings
        userProperties = properties;
        userBookings = bookings.filter(b => 
          b.guest_email === user.email || b.user_id === user.id
        );
      }
      
      console.log('📋 User properties:', userProperties.length);
      console.log('📅 User bookings:', userBookings.length);
      
      // Calculate stats based on user role
      const totalProperties = user?.role === 'realtor' ? userProperties.length : properties.length;
      const activeBookings = userBookings.filter(b => b.status !== 'cancelled').length;
      const totalGuests = userBookings.reduce((sum, booking) => {
        const guests = booking.guests || booking.guest_count || 0;
        return sum + parseInt(guests);
      }, 0);
      
      // Calculate revenue with different possible field names
      const totalRevenue = userBookings.reduce((sum, booking) => {
        const amount = booking.total_amount || booking.totalAmount || booking.totalPrice || 0;
        return sum + parseFloat(amount);
      }, 0);
      
      // Calculate monthly revenue - bookings from current month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = userBookings.reduce((sum, booking) => {
        const bookingDate = new Date(booking.createdAt || booking.created_at);
        if (bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear) {
          const amount = booking.total_amount || booking.totalAmount || booking.totalPrice || 0;
          return sum + parseFloat(amount);
        }
        return sum;
      }, 0);
      
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
      color: 'bg-violet-900/30 border-violet-800 text-violet-400',
      description: 'Properties you\'ve listed'
    },
    {
      name: 'Active Bookings',
      value: dashboardData.activeBookings.toString(),
      icon: CalendarDaysIcon,
      color: 'bg-slate-800 border-slate-700 text-slate-300',
      description: 'Current and upcoming reservations'
    },
    {
      name: 'Total Revenue',
      value: `R${dashboardData.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-violet-900/30 border-violet-800 text-violet-400',
      description: 'Total earnings this month'
    },
    {
      name: 'Total Clients',
      value: dashboardData.totalGuests.toString(),
      icon: UserGroupIcon,
      color: 'bg-slate-800 border-slate-700 text-slate-300',
      description: 'Unique clients served'
    }
  ] : [
    {
      name: 'Available Properties',
      value: dashboardData.totalProperties.toString(),
      icon: BuildingOfficeIcon,
      color: 'bg-violet-900/30 border-violet-800 text-violet-400',
      description: 'Properties ready to book'
    },
    {
      name: 'My Bookings',
      value: dashboardData.activeBookings.toString(),
      icon: CalendarDaysIcon,
      color: 'bg-slate-800 border-slate-700 text-slate-300',
      description: 'Your current reservations'
    },
    {
      name: 'Favorite Properties',
      value: '0',
      icon: CurrencyDollarIcon,
      color: 'bg-violet-900/30 border-violet-800 text-violet-400',
      description: 'Properties you\'ve saved'
    },
    {
      name: 'Reviews Given',
      value: '0',
      icon: UserGroupIcon,
      color: 'bg-slate-800 border-slate-700 text-slate-300',
      description: 'Reviews you\'ve written'
    }
  ];

  const quickActions = user?.role === 'realtor' ? [
    {
      title: 'Add New Property',
      description: 'List a new rental property',
      href: '/properties/add',
      icon: BuildingOfficeIcon,
      color: 'bg-slate-800/80 text-violet-400 hover:bg-slate-800 border border-slate-700'
    },
    {
      title: 'View Calendar',
      description: 'Check your booking calendar',
      href: '/calendar',
      icon: CalendarDaysIcon,
      color: 'bg-violet-900/20 text-violet-400 hover:bg-violet-900/30 border border-violet-800/50'
    },
    {
      title: 'Manage Properties',
      description: 'Edit your property listings',
      href: '/properties',
      icon: ArrowTrendingUpIcon,
      color: 'bg-slate-800/80 text-violet-400 hover:bg-slate-800 border border-slate-700'
    }
    ,
    {
      title: 'Newsletter',
      description: 'View subscribers and send newsletters',
      href: '/realtor/newsletter',
      icon: SparklesIcon,
      color: 'bg-violet-900/20 text-violet-400 hover:bg-violet-900/30 border border-violet-800/50'
    },
    {
      title: 'AI Listing Generator',
      description: 'Create compelling property descriptions with AI.',
      href: '/ai-studio',
      icon: SparklesIcon,
      color: 'bg-slate-800/80 text-violet-400 hover:bg-slate-800 border border-slate-700'
    }
  ] : [
    {
      title: 'Browse Properties',
      description: 'Find your perfect stay',
  href: '/browse',
      icon: BuildingOfficeIcon,
      color: 'bg-slate-800/80 text-violet-400 hover:bg-slate-800 border border-slate-700'
    },
    {
      title: 'My Bookings',
      description: 'View your reservations',
      href: '/bookings',
      icon: CalendarDaysIcon,
      color: 'bg-violet-900/20 text-violet-400 hover:bg-violet-900/30 border border-violet-800/50'
    },
    {
      title: 'Account Settings',
      description: 'Update your profile',
      href: '/billing',
      icon: ArrowTrendingUpIcon,
      color: 'bg-slate-800/80 text-violet-400 hover:bg-slate-800 border border-slate-700'
    }
  ];

  const recentActivity = user?.role === 'realtor' ? [
    {
      type: 'info',
      message: 'Welcome to Nova Prop! Start by adding your first property.',
      time: 'Just now',
      icon: BuildingOfficeIcon
    }
  ] : [
    {
      type: 'info',
      message: 'Welcome to Nova Prop! Start by browsing amazing properties.',
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

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Loading Dashboard...</h2>
          <p className="text-slate-400">Please wait while we load your data.</p>
          <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
            <p className="text-slate-300 text-sm">
              Debug: authLoading={authLoading.toString()}, loading={loading.toString()}, user={user ? 'exists' : 'null'}
            </p>
            <button 
              onClick={() => {
                // Test button to manually set user for debugging
                const testUser = { id: 1, name: 'Test User', email: 'test@example.com', role: 'realtor' };
                localStorage.setItem('user', JSON.stringify(testUser));
                window.location.reload();
              }}
              className="mt-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md transition-colors duration-200"
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
      {/* Welcome Section */}
      <WelcomeSection />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-[#0B0B0E] border border-slate-800 p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg border ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-slate-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-500">{stat.description}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-[#0B0B0E] border border-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    to={action.href}
                    className={`p-4 rounded-lg transition-colors duration-200 ${action.color}`}
                  >
                    <Icon className="w-8 h-8 mb-3" />
                    <h3 className="font-semibold mb-1 text-white">{action.title}</h3>
                    <p className="text-sm text-slate-400">{action.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Getting Started Guide */}
          <div className="bg-[#0B0B0E] border border-slate-800 p-6 rounded-lg shadow-md mt-6">
            <h2 className="text-xl font-semibold text-white mb-4">Getting Started</h2>
            <div className="space-y-4">
              {gettingStartedSteps.map((step) => (
                <div key={step.number} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-violet-900/50 border border-violet-800' 
                      : step.number === 1 
                        ? 'bg-violet-900/30 border border-violet-800' 
                        : 'bg-slate-800 border border-slate-700'
                  }`}>
                    <span className={`text-xs font-semibold ${
                      step.completed 
                        ? 'text-violet-300' 
                        : step.number === 1 
                          ? 'text-violet-400' 
                          : 'text-slate-400'
                    }`}>
                      {step.number}
                    </span>
                  </div>
                  <div>
                    <h3 className={`font-medium ${
                      step.completed 
                        ? 'text-violet-300' 
                        : step.number === 1 
                          ? 'text-white' 
                          : 'text-slate-400'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm ${
                      step.completed 
                        ? 'text-violet-400' 
                        : step.number === 1 
                          ? 'text-slate-400' 
                          : 'text-slate-500'
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
          <div className="bg-[#0B0B0E] border border-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Icon className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300">{activity.message}</p>
                      <div className="flex items-center mt-1">
                        <ClockIcon className="w-3 h-3 text-slate-500 mr-1" />
                        <p className="text-xs text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* API Status */}
          <div className="bg-[#0B0B0E] border border-slate-800 p-6 rounded-lg shadow-md mt-6">
            <h2 className="text-xl font-semibold text-white mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">API Connection</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-900/30 border border-violet-800 text-violet-300">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Database</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-900/30 border border-violet-800 text-violet-300">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Calendar Sync</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300">
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
