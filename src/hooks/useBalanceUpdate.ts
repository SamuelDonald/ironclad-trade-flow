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

      const requestBody = {
        action: 'update-balances',
        userId,
        cashBalance: updates.cash_balance,
        investedAmount: updates.invested_amount,
        freeMargin: updates.free_margin,
        mode,
        reason
      };

      console.log('[useBalanceUpdate] Sending request:', {
        action: 'update-balances',
        userId,
        mode,
        hasReason: !!reason,
        reasonLength: reason?.length || 0,
        stringifiedBody: JSON.stringify(requestBody),
        balanceFields: {
          cashBalance: updates.cash_balance,
          investedAmount: updates.invested_amount,
          freeMargin: updates.free_margin
        }
      });

      // Debug: Log the exact payload being sent
      console.log('[useBalanceUpdate] Request payload:', requestBody);

      const { data, error } = await supabase.functions.invoke(
        'admin-operations',
        {
          body: requestBody,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('[useBalanceUpdate] Edge function response:', {
        hasData: !!data,
        hasError: !!error,
        data: data,
        error: error
      });

      if (error) {
        console.error('[useBalanceUpdate] Edge function error:', {
          message: error.message,
          status: error.status,
          context: error.context,
          name: error.name,
          fullError: error
        });
        
        // Try to extract more details from the error
        let errorMessage = error.message || 'Edge function returned an error';
        if (error.context && typeof error.context === 'object') {
          errorMessage += ` - Context: ${JSON.stringify(error.context)}`;
        }
        
        throw new Error(errorMessage);
      }

      if (!data) {
        console.error('[useBalanceUpdate] No data returned from edge function');
        throw new Error('No data returned from edge function');
      }

      // Check if response indicates failure
      if (data.ok === false) {
        console.error('[useBalanceUpdate] Edge function returned error:', data);
        throw new Error(data.error || data.details || 'Balance update failed');
      }

      toast({
        title: 'Success',
        description: 'User balance updated successfully',
      });

      // Return the actual data (unwrap from { ok: true, data: ... })
      return data.data || data;
    } catch (err: any) {
      console.error('[useBalanceUpdate] Error updating balance:', {
        message: err.message,
        context: err.context,
        details: err,
        stack: err.stack
      });
      
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
