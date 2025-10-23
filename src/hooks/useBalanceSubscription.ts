import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PortfolioBalance {
  id: string;
  user_id: string;
  cash_balance: number;
  invested_amount: number;
  free_margin: number;
  total_value: number;
  daily_change: number;
  daily_change_percent: number;
  created_at: string;
  updated_at: string;
}

export const useBalanceSubscription = (userId: string) => {
  const [balance, setBalance] = useState<PortfolioBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let channel: RealtimeChannel | null = null;

    const fetchInitialBalance = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('portfolio_balances')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching initial balance:', fetchError);
          setError(fetchError.message);
          return;
        }

        setBalance(data);
      } catch (err) {
        console.error('Error in fetchInitialBalance:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    const setupRealtimeSubscription = () => {
      // Subscribe to real-time updates for this user's portfolio balance
      channel = supabase
        .channel(`portfolio_balance_${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'portfolio_balances',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('Portfolio balance real-time update:', payload);
            
            if (payload.eventType === 'DELETE') {
              setBalance(null);
            } else if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              setBalance(payload.new as PortfolioBalance);
            }
          }
        )
        .subscribe((status) => {
          console.log('Balance subscription status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to balance updates for user:', userId);
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Error subscribing to balance updates');
            setError('Failed to subscribe to real-time updates');
          }
        });
    };

    // Fetch initial data and set up subscription
    fetchInitialBalance();
    setupRealtimeSubscription();

    // Cleanup function
    return () => {
      if (channel) {
        console.log('Unsubscribing from balance updates for user:', userId);
        supabase.removeChannel(channel);
      }
    };
  }, [userId]);

  return { balance, loading, error };
};
