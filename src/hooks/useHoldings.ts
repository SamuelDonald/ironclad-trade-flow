import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  average_price: number;
  current_price: number;
  total_value: number;
  profit_loss: number;
  profit_loss_percent: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export const useHoldings = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchHoldings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setHoldings([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching holdings:', error);
        toast({
          title: "Error loading holdings",
          description: "Could not load your holdings data.",
          variant: "destructive",
        });
        setHoldings([]);
      } else {
        const processedHoldings = (data || []).map(holding => ({
          ...holding,
          shares: Number(holding.shares) || 0,
          average_price: Number(holding.average_price) || 0,
          current_price: Number(holding.current_price) || 0,
          total_value: Number(holding.total_value) || 0,
          profit_loss: Number(holding.profit_loss) || 0,
          profit_loss_percent: Number(holding.profit_loss_percent) || 0,
        }));
        setHoldings(processedHoldings);
      }
    } catch (error) {
      console.error('Error in fetchHoldings:', error);
      setHoldings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoldings();

    // Set up real-time subscription
    const channel = supabase
      .channel('holdings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'holdings'
        },
        () => {
          fetchHoldings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { holdings, loading, refetch: fetchHoldings };
};