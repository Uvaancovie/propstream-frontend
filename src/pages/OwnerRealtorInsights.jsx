import React, { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Home, Activity, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const OwnerRealtorInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const { user } = useAuth();

  const authorizedEmail = 'way2flyagency@gmail.com';
  const isAuthorizedOwner = (user?.email || '').toLowerCase() === authorizedEmail;

  useEffect(() => {
    if (!isAuthorizedOwner) {
      setLoading(false);
      setError('Access denied. Owner insights are restricted to the designated account owner.');
      return;
    }

    const fetchInsights = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getOwnerRealtorInsights();
        setData(response);
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to load realtor insights';
        console.error('Owner realtor insights fetch error:', err);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [isAuthorizedOwner]);

  const handleSort = (key) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDirection((prevDirection) => (prevDirection === 'asc' ? 'desc' : 'asc'));
        return prevKey;
      }
      setSortDirection('desc');
      return key;
    });
  };

  const sortedRealtors = useMemo(() => {
    if (!data?.realtors) return [];

    const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });

    return data.realtors
      .filter((realtor) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
          realtor.name?.toLowerCase().includes(term) ||
          realtor.email?.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        const direction = sortDirection === 'asc' ? 1 : -1;

        switch (sortKey) {
          case 'name':
            return direction * collator.compare(a.name || '', b.name || '');
          case 'propertiesCount':
            return direction * ((a.propertiesCount || 0) - (b.propertiesCount || 0));
          case 'requests':
            return direction * ((a.aiUsage?.totalRequests || 0) - (b.aiUsage?.totalRequests || 0));
          case 'tokens':
            return direction * ((a.aiUsage?.totalTokens || 0) - (b.aiUsage?.totalTokens || 0));
          case 'createdAt':
          default: {
            const aDate = new Date(a.createdAt || 0).getTime();
            const bDate = new Date(b.createdAt || 0).getTime();
            return direction * (aDate - bDate);
          }
        }
      });
  }, [data, searchTerm, sortKey, sortDirection]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'No usage yet';
    return new Date(dateString).toLocaleString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Unable to load owner insights</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    {
      title: 'Total Realtors',
      value: data.totals?.realtors ?? 0,
      description: 'Active realtor accounts',
      icon: Users,
      color: 'violet',
    },
    {
      title: 'Total Clients',
      value: data.totals?.clients ?? 0,
      description: 'Registered buyer accounts',
      icon: UserCheck,
      color: 'blue',
    },
    {
      title: 'Properties Listed',
      value: data.realtors?.reduce((acc, realtor) => acc + (realtor.propertiesCount || 0), 0) ?? 0,
      description: 'Across all realtors',
      icon: Home,
      color: 'emerald',
    },
    {
      title: 'AI Requests',
      value:
        data.realtors?.reduce((acc, realtor) => acc + (realtor.aiUsage?.totalRequests || 0), 0) ?? 0,
      description: 'Lifetime usage of AI tools',
      icon: Activity,
      color: 'pink',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Owner Insights</h1>
        <p className="mt-2 text-gray-400">
          Monitor realtor activity, property growth, and AI adoption across the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map(({ title, value, description, icon: Icon, color }) => (
          <Card key={title} className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
              <Icon className={`w-4 h-4 text-${color}-400`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{value}</div>
              <CardDescription className="text-gray-400 mt-1">{description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-4 border-b border-gray-700/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-white">Realtor Performance</CardTitle>
              <CardDescription className="text-gray-400">
                Track signups, property contributions, and AI usage per realtor.
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name or email"
                className="w-full lg:w-72 bg-gray-900 text-gray-200 placeholder-gray-500 border border-gray-700 rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-white"
                    onClick={() => handleSort('name')}
                  >
                    Realtor
                  </th>
                  <th className="py-3 px-4">Email</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-white"
                    onClick={() => handleSort('createdAt')}
                  >
                    Joined
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-white"
                    onClick={() => handleSort('propertiesCount')}
                  >
                    Properties
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-white"
                    onClick={() => handleSort('requests')}
                  >
                    AI Requests
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-white"
                    onClick={() => handleSort('tokens')}
                  >
                    AI Tokens
                  </th>
                  <th className="py-3 px-4">Last AI Activity</th>
                </tr>
              </thead>
              <tbody>
                {sortedRealtors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 px-4 text-center text-gray-400">
                      No realtors matched your filters.
                    </td>
                  </tr>
                ) : (
                  sortedRealtors.map((realtor) => (
                    <tr
                      key={realtor.id}
                      className="border-b border-gray-700/60 hover:bg-gray-700/20 text-gray-200"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-white">{realtor.name || 'No name'}</div>
                          {realtor.organizationId && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              Org ID: {realtor.organizationId}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{realtor.email}</td>
                      <td className="py-3 px-4 text-gray-300">{formatDate(realtor.createdAt)}</td>
                      <td className="py-3 px-4 text-white">{realtor.propertiesCount || 0}</td>
                      <td className="py-3 px-4 text-white">
                        {realtor.aiUsage?.totalRequests ?? 0}
                      </td>
                      <td className="py-3 px-4 text-white">
                        {realtor.aiUsage?.totalTokens ?? 0}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {formatDateTime(realtor.aiUsage?.lastUsedAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerRealtorInsights;


