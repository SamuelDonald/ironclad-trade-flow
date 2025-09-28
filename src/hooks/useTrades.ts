import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Trade {
  id: string;
  symbol: string;
  name: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  category: string;
  created_at: string;
}

export const useTrades = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTrades = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setTrades([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching trades:', error);
        toast({
          title: "Error loading trades",
          description: "Could not load your trading history.",
          variant: "destructive",
        });
        setTrades([]);
      } else {
        const processedTrades = (data || []).map(trade => ({
          ...trade,
          shares: Number(trade.shares) || 0,
          price: Number(trade.price) || 0,
          total_amount: Number(trade.total_amount) || 0,
          type: trade.type as 'buy' | 'sell',
          status: trade.status as 'pending' | 'completed' | 'cancelled',
        }));
        setTrades(processedTrades);
      }
    } catch (error) {
      console.error('Error in fetchTrades:', error);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();

    // Set up real-time subscription
    const channel = supabase
      .channel('trades_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trades'
        },
        () => {
          fetchTrades();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { trades, loading, refetch: fetchTrades };
};