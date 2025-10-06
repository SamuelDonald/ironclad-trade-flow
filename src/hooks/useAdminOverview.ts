import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  totalTrades: number;
  totalTransactions: number;
  pendingKYC: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  recentTrades: any[];
}

export const useAdminOverview = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Refresh session if needed
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !currentSession) {
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (!refreshData.session) {
          throw new Error('Session expired. Please log in again.');
        }
      }

      const { data, error: fetchError } = await supabase.functions.invoke('admin-operations/overview', {
        headers: {
          Authorization: `Bearer ${(currentSession || session).access_token}`,
        },
      });

      if (fetchError) {
        console.error('Edge function error details:', {
          message: fetchError.message,
          status: fetchError.status,
          context: fetchError.context
        });
        throw fetchError;
      }

      if (!data) {
        throw new Error('No data returned from edge function');
      }

      setStats(data);
    } catch (err: any) {
      console.error('Error fetching overview:', err);
      setError(err.message || 'Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return { stats, loading, error, refetch: fetchOverview };
};
