import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  kyc_status: string;
  cash_balance: number;
  invested_amount: number;
  free_margin: number;
  total_value: number;
  last_sign_in_at: string | null;
}

export const useAdminUsers = (searchQuery: string = '', page: number = 1, limit: number = 20) => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Refresh session if needed
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (!refreshData.session) {
          throw new Error('Session expired. Please log in again.');
        }
      }

      const offset = (page - 1) * limit;
      const params = new URLSearchParams({
        search: searchQuery,
        offset: offset.toString(),
        limit: limit.toString(),
      });

      const { data, error: fetchError } = await supabase.functions.invoke(
        `admin-operations/users?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

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
      setUsers(data.users || []);
      setTotalCount(data.totalCount || 0);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [searchQuery, page, limit]);

  return { users, totalCount, loading, error, refetch: fetchUsers };
};
