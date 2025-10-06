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

      const { data, error: fetchError } = await supabase.functions.invoke('admin-operations', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (fetchError) throw fetchError;
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
