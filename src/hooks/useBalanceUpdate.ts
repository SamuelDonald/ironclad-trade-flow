import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useBalanceUpdate = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateBalance = async (
    userId: string,
    updates: {
      cash_balance?: number;
      invested_amount?: number;
      free_margin?: number;
    },
    mode: 'delta' | 'absolute' = 'delta',
    reason: string = ''
  ) => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke(
        `admin-operations/users/${userId}/balances`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ updates, mode, reason }),
        }
      );

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User balance updated successfully',
      });

      return data;
    } catch (err: any) {
      console.error('Error updating balance:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update balance',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateBalance, loading };
};
