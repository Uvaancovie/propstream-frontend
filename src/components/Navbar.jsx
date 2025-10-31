import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  CalendarDaysIcon, 
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  NewspaperIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['client', 'realtor'] },
    { name: 'Profile', href: '/profile', icon: UserCircleIcon, roles: ['client', 'realtor'] },
    { name: 'Browse', href: '/browse', icon: BuildingOfficeIcon, roles: ['client'] },
    { name: 'News', href: '/news', icon: NewspaperIcon, roles: ['client'] },
    { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon, roles: ['client'] },
    { name: 'Properties', href: '/properties', icon: BuildingOfficeIcon, roles: ['realtor'] },
    { name: 'AI Studio', href: '/ai-studio', icon: SparklesIcon, roles: ['realtor'] },
    { name: 'Saved Listings', href: '/saved-listings', icon: BookmarkIcon, roles: ['realtor'] },
    { name: 'News', href: '/realtor/news', icon: NewspaperIcon, roles: ['realtor'] },
    { name: 'Bookings', href: '/bookings', icon: CalendarDaysIcon, roles: ['client', 'realtor'] },
    { name: 'Calendar', href: '/calendar', icon: CalendarDaysIcon, roles: ['realtor'] },
    { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon, roles: ['realtor'] },
    { name: 'Billing', href: '/billing', icon: CreditCardIcon, roles: ['client'] },
  ];

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => 
    !item.roles || item.roles.includes(user?.role)
  );

  const isRealtorDashboard = user?.role === 'realtor' && location.pathname.startsWith('/dashboard');

  const isActivePath = (path) => location.pathname === path;

  // Show simplified navbar for public pages
  if (!isAuthenticated) {
    return (
      <nav className="bg-[#0B0B0E] shadow border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img 
                  src="/novaprop-logo.jpeg" 
                  alt="NovaProp" 
                  className="h-8 w-8 rounded-lg shadow-[0_0_15px_rgba(124,58,237,.35)]" 
                />
                <span className="ml-2 text-xl font-bold text-white">PropNova</span>
              </Link>
            </div>
            
            {/* Public navigation */}
            <div className="flex items-center space-x-6">
              <Link
                to="/browse"
                className="text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Browse Properties
              </Link>
              <Link
                to="/login"
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-[#0B0B0E] shadow border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <img 
                  src="/novaprop-logo.jpeg" 
                  alt="NovaProp" 
                  className="h-8 w-8 rounded-lg shadow-[0_0_15px_rgba(124,58,237,.35)]" 
                />
                <span className="ml-2 text-xl font-bold text-white">PropNova</span>
              </Link>
            </div>
            
            {/* If we are on the realtor dashboard, show a compact header with a modal toggle */}
            {isRealtorDashboard ? (
              <div className="ml-4 flex items-center">
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center px-3 py-2 border border-slate-700 text-sm leading-4 font-medium rounded-md text-slate-300 hover:text-white hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors duration-200"
                >
                  <Bars3Icon className="w-5 h-5 mr-2" />
                  Menu
                </button>
              </div>
            ) : (
              /* Desktop navigation */
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {/* Always-visible Browse link for everyone */}
                <Link to="/browse" className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 border-transparent text-slate-300 hover:border-slate-600 hover:text-slate-200">
                  <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                  Browse
                </Link>

                {filteredNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                        isActivePath(item.href)
                          ? 'border-violet-500 text-white'
                          : 'border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center space-x-4">
              {user?.role && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-900/50 text-violet-300 border border-violet-800">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-slate-700 text-sm leading-4 font-medium rounded-md text-slate-300 hover:text-white hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors duration-200"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-500"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Realtor dashboard modal navigation */}
      {isRealtorDashboard && modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative mt-20 w-full max-w-md mx-4 bg-[#0B0B0E] border border-slate-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img src="/novaprop-logo.jpeg" alt="logo" className="h-8 w-8 rounded-md mr-2" />
                <h3 className="text-lg font-semibold text-white">Menu</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setModalOpen(false)}
                    className="flex items-center px-3 py-2 rounded-md text-slate-300 hover:bg-slate-800/50"
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 border-t border-slate-800 pt-4">
              <div className="flex items-center">
                <UserCircleIcon className="w-8 h-8 text-slate-400 mr-3" />
                <div>
                  <div className="text-sm text-slate-300">{user?.name || 'User'}</div>
                  <div className="text-xs text-slate-400">{user?.email}</div>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => { handleLogout(); setModalOpen(false); }}
                  className="w-full inline-flex items-center justify-center px-3 py-2 rounded-md border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800/50"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {/* Always present Browse link on mobile */}
            <Link
              to="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                isActivePath('/browse')
                  ? 'bg-violet-900/20 border-violet-500 text-violet-300'
                  : 'border-transparent text-slate-400 hover:bg-slate-800/50 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              <BuildingOfficeIcon className="w-5 h-5 mr-3" />
              Browse Properties
            </Link>

            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                    isActivePath(item.href)
                      ? 'bg-violet-900/20 border-violet-500 text-violet-300'
                      : 'border-transparent text-slate-400 hover:bg-slate-800/50 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-slate-800">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <UserCircleIcon className="w-8 h-8 text-slate-400" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-slate-300">
                  {user?.name || 'User'}
                </div>
                <div className="text-sm font-medium text-slate-400">
                  {user?.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-base font-medium text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
