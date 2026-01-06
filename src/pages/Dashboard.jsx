import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { billingAPI, authAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { 
  BuildingOfficeIcon, 
  CalendarDaysIcon, 
  UserCircleIcon,
  SparklesIcon,
  ArrowUpCircleIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  BookmarkIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

// Stat Card Component
const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-[#0B0B0E] border border-slate-800 rounded-xl p-4">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-violet-900/30 border border-violet-800/50">
        <Icon className="w-5 h-5 text-violet-400" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  </div>
);

// Quick Action Card Component
const QuickActionCard = ({ href, icon: Icon, title, desc }) => (
  <Link 
    to={href}
    className="group flex items-center gap-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-violet-700/50 hover:bg-slate-900 transition-all"
  >
    <div className="p-2 rounded-lg bg-violet-900/20 border border-violet-800/30 group-hover:bg-violet-900/30 transition-colors">
      <Icon className="w-5 h-5 text-violet-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-white text-sm">{title}</p>
      <p className="text-xs text-slate-500 truncate">{desc}</p>
    </div>
    <ChevronRightIcon className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors" />
  </Link>
);

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  
  // Redirect owners/admins to admin dashboard
  if (user && (user.role === 'owner' || user.role === 'admin')) {
    return <Navigate to="/admin" replace />;
  }

  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [planUsage, setPlanUsage] = useState(null);
  const [stats, setStats] = useState(null);
  const [startingTrial, setStartingTrial] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSubscription(),
      fetchPlanUsage(),
      fetchStats()
    ]);
    setLoading(false);
  };

  const fetchSubscription = async () => {
    try {
      const res = await billingAPI.getSubscription();
      setSubscriptionInfo(res.subscription || null);
    } catch (err) {
      console.warn('Could not fetch subscription info', err);
      setSubscriptionInfo(null);
    }
  };

  const fetchPlanUsage = async () => {
    try {
      const res = await billingAPI.getUsage();
      setPlanUsage(res);
    } catch (err) {
      console.warn('Could not fetch plan usage info', err);
      setPlanUsage(null);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await authAPI.getStats();
      setStats(res.stats || null);
    } catch (err) {
      console.warn('Could not fetch stats', err);
      setStats(null);
    }
  };

  const handleStartTrial = async () => {
    if (!window.confirm('Start a 14-day free trial?')) return;
    setStartingTrial(true);
    try {
      const res = await billingAPI.startTrial({ planId: 'starter' });
      if (res?.subscription) {
        setSubscriptionInfo(res.subscription);
        alert('Trial started — you have 14 days free!');
      }
    } catch (err) {
      alert('Unable to start trial: ' + (err.response?.data?.message || err.message));
    } finally {
      setStartingTrial(false);
    }
  };

  // Helpers
  const getSubscriptionStatus = () => {
    if (!subscriptionInfo) return { label: 'Free Plan', color: 'slate', isTrial: false, isActive: false };
    
    const status = subscriptionInfo.status;
    if (status === 'trialing' || status === 'trial') {
      const daysLeft = subscriptionInfo.trialDaysRemaining || 
        Math.max(0, Math.ceil((new Date(subscriptionInfo.trialEnd) - new Date()) / (1000 * 60 * 60 * 24)));
      return { label: `Trial (${daysLeft} days left)`, color: 'amber', isTrial: true, isActive: true, daysLeft };
    }
    if (status === 'active') {
      return { label: subscriptionInfo.planLabel || 'Active', color: 'emerald', isTrial: false, isActive: true };
    }
    if (status === 'trial_expired') {
      return { label: 'Trial Expired', color: 'red', isTrial: false, isActive: false };
    }
    return { label: 'Free Plan', color: 'slate', isTrial: false, isActive: false };
  };

  const subStatus = getSubscriptionStatus();

  // Usage data
  const propertiesUsed = planUsage?.usage?.properties?.used || 0;
  const propertiesMax = planUsage?.usage?.properties?.max || 2;
  const aiUsed = planUsage?.usage?.aiGenerations?.used || 0;
  const aiMax = planUsage?.usage?.aiGenerations?.max || 8;
  const planLabel = planUsage?.plan?.label || 'Free';

  const propertiesPercent = propertiesMax === -1 ? 10 : Math.min(100, (propertiesUsed / propertiesMax) * 100);
  const aiPercent = aiMax === -1 ? 10 : Math.min(100, (aiUsed / aiMax) * 100);

  const isRealtor = user?.role === 'realtor';

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Loading...</h2>
        <p className="text-slate-400">Please wait while we load your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Section: Profile + Subscription */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#0E0E14] to-[#0B0B0E] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.name} 
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-violet-600/50"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white truncate">
                  {user.name || 'Welcome!'}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                  ${isRealtor ? 'bg-violet-900/50 text-violet-300 border border-violet-700' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                  {user.role}
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-3 truncate">{user.email}</p>
              
              <div className="flex flex-wrap gap-2">
                <Link to="/profile">
                  <Button variant="outline" size="sm" className="text-slate-300 border-slate-700 hover:bg-slate-800">
                    <UserCircleIcon className="w-4 h-4 mr-1.5" />
                    Edit Profile
                  </Button>
                </Link>
                {isRealtor && (
                  <Link to="/properties/add">
                    <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
                      <BuildingOfficeIcon className="w-4 h-4 mr-1.5" />
                      Add Property
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="bg-gradient-to-br from-[#0E0E14] to-[#0B0B0E] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Subscription</h2>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
              ${subStatus.color === 'emerald' ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700' : ''}
              ${subStatus.color === 'amber' ? 'bg-amber-900/50 text-amber-300 border border-amber-700' : ''}
              ${subStatus.color === 'red' ? 'bg-red-900/50 text-red-300 border border-red-700' : ''}
              ${subStatus.color === 'slate' ? 'bg-slate-800 text-slate-300 border border-slate-700' : ''}
            `}>
              {subStatus.label}
            </span>
          </div>
          
          <div className="mb-4">
            <p className="text-2xl font-bold text-white">{planLabel}</p>
            <p className="text-sm text-slate-500">Current plan</p>
          </div>

          {/* Show trial CTA or upgrade */}
          {!subStatus.isActive && isRealtor ? (
            <Button 
              onClick={handleStartTrial} 
              disabled={startingTrial}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            >
              {startingTrial ? 'Starting...' : 'Start 14-Day Free Trial'}
            </Button>
          ) : subStatus.isTrial || planLabel === 'Free' ? (
            <Link to="/billing" className="block">
              <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white">
                <ArrowUpCircleIcon className="w-4 h-4 mr-1.5" />
                Upgrade Plan
              </Button>
            </Link>
          ) : (
            <Link to="/billing" className="block">
              <Button variant="outline" className="w-full text-slate-300 border-slate-700 hover:bg-slate-800">
                <CreditCardIcon className="w-4 h-4 mr-1.5" />
                Manage Billing
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Usage Section (Realtors) */}
      {isRealtor && (
        <div className="bg-[#0B0B0E] border border-slate-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Usage Overview</h2>
            <span className="text-sm text-slate-500">{planLabel} Plan</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Properties Usage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="w-5 h-5 text-violet-400" />
                  <span className="font-medium text-white">Properties Listed</span>
                </div>
                <span className="text-sm font-semibold text-slate-300">
                  {propertiesUsed} / {propertiesMax === -1 ? '∞' : propertiesMax}
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${propertiesPercent >= 100 ? 'bg-red-500' : propertiesPercent >= 80 ? 'bg-amber-500' : 'bg-violet-500'}`}
                  style={{ width: `${propertiesPercent}%` }}
                />
              </div>
              {propertiesPercent >= 100 && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <ExclamationTriangleIcon className="w-3 h-3" />
                  Limit reached — upgrade to add more
                </p>
              )}
            </div>

            {/* AI Usage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-violet-400" />
                  <span className="font-medium text-white">AI Generations</span>
                </div>
                <span className="text-sm font-semibold text-slate-300">
                  {aiUsed} / {aiMax === -1 ? '∞' : aiMax}
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${aiPercent >= 100 ? 'bg-red-500' : aiPercent >= 80 ? 'bg-amber-500' : 'bg-violet-500'}`}
                  style={{ width: `${aiPercent}%` }}
                />
              </div>
              {aiPercent >= 100 && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <ExclamationTriangleIcon className="w-3 h-3" />
                  Limit reached — upgrade for more
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isRealtor ? (
          <>
            <StatCard 
              icon={BuildingOfficeIcon} 
              label="Properties" 
              value={stats?.properties || propertiesUsed} 
            />
            <StatCard 
              icon={CalendarDaysIcon} 
              label="Bookings" 
              value={stats?.bookings || 0} 
            />
            <StatCard 
              icon={ChatBubbleLeftRightIcon} 
              label="Messages" 
              value={stats?.messages || 0} 
            />
            <StatCard 
              icon={SparklesIcon} 
              label="AI Used" 
              value={aiUsed} 
            />
          </>
        ) : (
          <>
            <StatCard 
              icon={CalendarDaysIcon} 
              label="My Bookings" 
              value={stats?.bookings || 0} 
            />
            <StatCard 
              icon={BookmarkIcon} 
              label="Saved" 
              value={0} 
            />
            <StatCard 
              icon={ChatBubbleLeftRightIcon} 
              label="Messages" 
              value={stats?.messages || 0} 
            />
            <StatCard 
              icon={CheckCircleIcon} 
              label="Reviews" 
              value={0} 
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-[#0B0B0E] border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {isRealtor ? (
            <>
              <QuickActionCard 
                href="/properties" 
                icon={BuildingOfficeIcon} 
                title="My Properties" 
                desc="View & manage listings"
              />
              <QuickActionCard 
                href="/ai-studio" 
                icon={SparklesIcon} 
                title="AI Studio" 
                desc="Generate listing content"
              />
              <QuickActionCard 
                href="/calendar" 
                icon={CalendarDaysIcon} 
                title="Calendar" 
                desc="Manage availability"
              />
              <QuickActionCard 
                href="/messages" 
                icon={ChatBubbleLeftRightIcon} 
                title="Messages" 
                desc="Client communications"
              />
            </>
          ) : (
            <>
              <QuickActionCard 
                href="/browse" 
                icon={BuildingOfficeIcon} 
                title="Browse Properties" 
                desc="Find your next stay"
              />
              <QuickActionCard 
                href="/bookings" 
                icon={CalendarDaysIcon} 
                title="My Bookings" 
                desc="View reservations"
              />
              <QuickActionCard 
                href="/messages" 
                icon={ChatBubbleLeftRightIcon} 
                title="Messages" 
                desc="Chat with hosts"
              />
              <QuickActionCard 
                href="/profile" 
                icon={UserCircleIcon} 
                title="Profile" 
                desc="Update your info"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
