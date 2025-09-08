import { useState, useEffect } from 'react';
import { waitlistAPI } from '../services/api';
import { supabase } from '../lib/supabase';

export const useWaitlistStats = () => {
  const [stats, setStats] = useState({
    total_signups: 0,
    realtorCount: 0,
    clientCount: 0,
    last_24h: 0,
    last_7_days: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      // Try to fetch stats from our backend API first
      try {
        const response = await waitlistAPI.getStats();
        
        if (response && response.success) {
          setStats({
            total_signups: response.data.totalCount || 0,
            realtorCount: response.data.realtorCount || 0,
            clientCount: response.data.clientCount || 0,
            loading: false,
            error: null
          });
          return;
        }
      } catch (apiError) {
        console.log('API stats fetch failed, falling back to Supabase');
      }

      // Fallback to Supabase if API fails
      // Get total signups
      const { count: totalCount, error: totalError } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get signups from last 24 hours
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);
      
      const { count: last24hCount, error: last24hError } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneDayAgo.toISOString());

      if (last24hError) throw last24hError;

      // Get signups from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: last7daysCount, error: last7daysError } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      if (last7daysError) throw last7daysError;

      setStats({
        total_signups: totalCount || 0,
        last_24h: last24hCount || 0,
        last_7_days: last7daysCount || 0,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching waitlist stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  const addToWaitlist = async (email, source = 'website') => {
    try {
      // Try our backend API first
      try {
        const response = await waitlistAPI.join({
          email,
          source
        });
        
        // Refresh stats after adding
        await fetchStats();
        
        return { success: true, data: response.data };
      } catch (apiError) {
        console.log('API waitlist join failed, falling back to Supabase');
      }

      // Fallback to Supabase if API fails
      const { data, error } = await supabase
        .from('waitlist')
        .insert([
          {
            email: email,
            source: source,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      // Refresh stats after adding
      await fetchStats();
      
      return { success: true, data };
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    ...stats,
    addToWaitlist,
    refreshStats: fetchStats
  };
};
