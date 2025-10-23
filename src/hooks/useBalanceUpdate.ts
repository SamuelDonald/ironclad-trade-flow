import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BalanceUpdateRequest {
  userId: string;
  updates: {
    cash_balance?: number;
    invested_amount?: number;
    free_margin?: number;
  };
  mode: 'delta' | 'absolute';
  reason: string;
}

interface BalanceUpdateResponse {
  success: boolean;
  data?: any;
  error?: string;
  details?: string[];
}

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

      // Client-side validation
      if (!userId || typeof userId !== 'string') {
        throw new Error('User ID is required');
      }

      if (!reason || typeof reason !== 'string' || reason.trim() === '') {
        throw new Error('Reason is required and cannot be empty');
      }

      if (!['delta', 'absolute'].includes(mode)) {
        throw new Error('Mode must be either "delta" or "absolute"');
      }

      // At least one balance field must be provided
      const hasBalanceUpdate = updates.cash_balance !== undefined || 
                              updates.invested_amount !== undefined || 
                              updates.free_margin !== undefined;

      if (!hasBalanceUpdate) {
        throw new Error('At least one balance field must be provided');
      }

      // Prepare request payload
      const requestBody = {
        userId,
        cashBalance: updates.cash_balance,
        investedAmount: updates.invested_amount,
        freeMargin: updates.free_margin,
        mode,
        reason: reason.trim()
      };

      console.log('[useBalanceUpdate] Sending balance update request:', {
        userId,
        mode,
        reason: reason.trim(),
        updates: {
          cashBalance: updates.cash_balance,
          investedAmount: updates.invested_amount,
          freeMargin: updates.free_margin
        }
      });

      // DEBUG: Log the exact request details
      console.log('[useBalanceUpdate] DEBUG - Request details:', {
        functionName: 'balance-update',
        requestBody: requestBody,
        stringifiedBody: JSON.stringify(requestBody),
        supabaseUrl: supabase.supabaseUrl,
        expectedUrl: `${supabase.supabaseUrl}/functions/v1/balance-update`
      });

      // Call the dedicated balance-update function (now deployed)
      console.log('[useBalanceUpdate] About to call supabase.functions.invoke...');
      const { data, error } = await supabase.functions.invoke('balance-update', {
        body: requestBody
      });
      console.log('[useBalanceUpdate] supabase.functions.invoke completed');

      console.log('[useBalanceUpdate] Response received:', {
        hasData: !!data,
        hasError: !!error,
        data,
        error
      });

      // Handle Supabase function invocation errors
      if (error) {
        console.error('[useBalanceUpdate] Function invocation error:', {
          error,
          errorMessage: error.message,
          errorStatus: error.status,
          errorContext: error.context,
          errorName: error.name,
          fullError: JSON.stringify(error, null, 2)
        });
        throw new Error(error.message || 'Failed to invoke balance update function');
      }

      // Handle missing response data
      if (!data) {
        console.error('[useBalanceUpdate] No response data received');
        throw new Error('No response received from balance update function');
      }

      // Parse the response (balance-update returns { success: true, data: ... })
      const response: BalanceUpdateResponse = data;

      // Handle function-level errors
      if (!response.success) {
        console.error('[useBalanceUpdate] Function returned error:', response);
        
        let errorMessage = response.error || 'Balance update failed';
        if (response.details && Array.isArray(response.details)) {
          errorMessage += ': ' + response.details.join(', ');
        }
        
        throw new Error(errorMessage);
      }

      // Success - show toast and return data
      toast({
        title: 'Success',
        description: 'User balance updated successfully',
      });

      console.log('[useBalanceUpdate] Balance update successful:', response.data);
      return response.data;

    } catch (err: any) {
      console.error('[useBalanceUpdate] Error during balance update:', err);
      
      // Show error toast
      toast({
        title: 'Error',
        description: err.message || 'Failed to update balance',
        variant: 'destructive',
      });
      
      // Re-throw for component handling
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateBalance, loading };
};