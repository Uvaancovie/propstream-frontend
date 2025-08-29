import React from 'react';
import { Link } from 'react-router-dom';
import NewsletterSignup from '../components/NewsletterSignup';
import { 
  CalendarDaysIcon, 
  BuildingOfficeIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
  ShieldCheckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const LandingPage = () => {
  const features = [
    {
      icon: BuildingOfficeIcon,
      title: 'Property Management',
      description: 'Manage all your rental properties in one place with detailed information and photos.'
    },
    {
      icon: CalendarDaysIcon,
      title: 'Calendar Sync',
      description: 'Sync calendars across Airbnb, Vrbo, Booking.com and other platforms automatically.'
    },
    {
      icon: UserGroupIcon,
      title: 'Guest Communication',
      description: 'Automated message templates for seamless guest communication throughout their stay.'
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics & Reports',
      description: 'Track bookings, revenue, and occupancy rates with comprehensive analytics.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Billing Integration',
      description: 'Secure payment processing with South African Payfast integration.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with JWT authentication and data encryption.'
    }
  ];

  const benefits = [
    {
      icon: ClockIcon,
      title: 'Save Time',
      description: 'Automate calendar syncing and guest communications to save hours every week.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Multi-Platform',
      description: 'Works with all major booking platforms including Airbnb, Vrbo, and Booking.com.'
    },
    {
      icon: ChartBarIcon,
      title: 'Increase Revenue',
      description: 'Prevent double bookings and optimize pricing with real-time calendar management.'
    }
  ];

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="relative bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <span className="text-3xl mr-3">🏖️</span>
              <span className="text-2xl font-bold text-white">Propstream</span>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="text-white hover:text-primary-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
            Manage Your Properties Like a Pro
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto animate-slide-up">
            Streamline your property management with automated calendar syncing, 
            guest communications, and seamless booking management across all platforms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link
              to="/register"
              className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Start Free Trial
            </Link>
            <Link
              to="/browse-properties"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Browse Properties
            </Link>
            <Link
              to="/login"
              className="border-2 border-primary-300 text-primary-100 hover:bg-primary-500 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Properties
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From calendar management to guest communications, Propstream has all the tools 
              you need to run a successful property rental business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Property Managers Choose Propstream
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of property managers who have streamlined their operations with Propstream.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="text-center animate-slide-up"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Stay Informed
            </h2>
            <p className="text-lg text-gray-600">
              Get the latest property management tips, market insights, and platform updates
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <NewsletterSignup />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Streamline Your Property Management?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join Propstream today and take control of your property rental business.
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="text-3xl mr-3">🏖️</span>
              <span className="text-2xl font-bold text-white">Propstream</span>
            </div>
            <p className="text-gray-400 mb-4">
              Professional property management made simple.
            </p>
            <p className="text-gray-500 text-sm">
              © 2025 Propstream. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
