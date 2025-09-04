import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useWaitlistStats = () => {
  const [stats, setStats] = useState({
    total_signups: 0,
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
