import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Building2, 
  Home, 
  Calendar, 
  Mail, 
  Sparkles,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/metrics');
      setMetrics(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load metrics';
      
      // Add helpful message for 403 errors
      if (err.response?.status === 403) {
        setError('Access denied. Please logout and login again to refresh your permissions.');
      } else {
        setError(errorMessage);
      }
      
      console.error('Metrics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">⚠️ Access Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
            <h3 className="font-semibold text-red-800 mb-2">How to fix:</h3>
            <ol className="list-decimal list-inside text-red-700 space-y-1">
              <li>Click logout in the top right</li>
              <li>Login again with your credentials</li>
              <li>Navigate back to /admin</li>
            </ol>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Logout & Clear Cache
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const metricCards = [
    {
      title: 'Total Users',
      value: metrics.users.total,
      change: `+${metrics.users.last7d} last 7 days`,
      icon: Users,
      color: 'violet'
    },
    {
      title: 'Organizations',
      value: metrics.orgs.total,
      change: `+${metrics.orgs.last7d} last 7 days`,
      icon: Building2,
      color: 'blue'
    },
    {
      title: 'Properties',
      value: metrics.properties.total,
      change: `+${metrics.properties.last7d} last 7 days`,
      icon: Home,
      color: 'green'
    },
    {
      title: 'Bookings',
      value: metrics.bookings.total,
      change: `+${metrics.bookings.last7d} last 7 days`,
      icon: Calendar,
      color: 'orange'
    },
    {
      title: 'Newsletters Sent',
      value: metrics.newsletters.sentThisMonth,
      change: `${metrics.newsletters.subscribersTotal} subscribers`,
      icon: Mail,
      color: 'purple'
    },
    {
      title: 'AI Generations',
      value: metrics.ai.usedThisMonth,
      change: `${metrics.ai.topupsThisMonth} top-ups`,
      icon: Sparkles,
      color: 'pink'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-2 text-gray-400">
          Monitor platform activity and user signups
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  {card.title}
                </CardTitle>
                <Icon className={`w-4 h-4 text-${card.color}-500`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{card.value}</div>
                <p className="text-xs text-gray-400 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {card.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Users by Role</CardTitle>
            <CardDescription className="text-gray-400">Distribution across user types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.users.byRole).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-gray-300 capitalize">{role}</span>
                  <span className="text-white font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Organizations by Plan</CardTitle>
            <CardDescription className="text-gray-400">Subscription tier breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.orgs.byPlan).map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between">
                  <span className="text-gray-300 capitalize">{plan}</span>
                  <span className="text-white font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Signups Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Signups</CardTitle>
          <CardDescription className="text-gray-400">Last 10 users who joined</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Role</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentSignups.map((user, idx) => (
                  <tr key={idx} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-3 px-4 text-white">{user.name || '-'}</td>
                    <td className="py-3 px-4 text-gray-300">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'realtor' ? 'bg-violet-500/20 text-violet-300' :
                        user.role === 'client' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
