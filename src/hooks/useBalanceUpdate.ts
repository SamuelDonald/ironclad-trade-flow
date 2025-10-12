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

      // Validate required fields before sending
      if (!userId || !reason || reason.trim() === '') {
        throw new Error('User ID and reason are required');
      }

      console.log('[useBalanceUpdate] Sending request:', {
        action: 'update-balances',
        userId,
        mode,
        hasReason: !!reason,
        balanceFields: {
          cashBalance: updates.cash_balance,
          investedAmount: updates.invested_amount,
          freeMargin: updates.free_margin
        }
      });

      const { data, error } = await supabase.functions.invoke(
        'admin-operations',
        {
          body: {
            action: 'update-balances',
            userId,
            cashBalance: updates.cash_balance,
            investedAmount: updates.invested_amount,
            freeMargin: updates.free_margin,
            mode,
            reason
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (error) {
        console.error('Edge function error details:', {
          message: error.message,
          status: error.status,
          context: error.context,
          name: error.name,
          fullError: error
        });
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from edge function');
      }

      toast({
        title: 'Success',
        description: 'User balance updated successfully',
      });

      return data;
    } catch (err: any) {
      console.error('Error updating balance:', err);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to update balance';
      if (err.message?.includes('JSON')) {
        errorMessage = 'Invalid request format. Please try again.';
      } else if (err.message?.includes('authorization') || err.message?.includes('denied')) {
        errorMessage = 'Authorization failed. Please sign in again.';
      } else if (err.message?.includes('Reason is required')) {
        errorMessage = 'Please provide a reason for the balance update.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateBalance, loading };
};
