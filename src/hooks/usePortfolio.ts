import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface PortfolioData {
  cashBalance: number;
  investedAmount: number;
  freeMargin: number;
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
}

const defaultPortfolio: PortfolioData = {
  cashBalance: 0,
  investedAmount: 0,
  freeMargin: 0,
  totalValue: 0,
  dailyChange: 0,
  dailyChangePercent: 0
};

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioData>(defaultPortfolio);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPortfolio = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setPortfolio(defaultPortfolio);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('portfolio_balances')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching portfolio:', error);
        toast({
          title: "Error loading portfolio",
          description: "Could not load your portfolio data.",
          variant: "destructive",
        });
        setPortfolio(defaultPortfolio);
      } else if (data) {
        setPortfolio({
          cashBalance: Number(data.cash_balance) || 0,
          investedAmount: Number(data.invested_amount) || 0,
          freeMargin: Number(data.free_margin) || 0,
          totalValue: Number(data.total_value) || 0,
          dailyChange: Number(data.daily_change) || 0,
          dailyChangePercent: Number(data.daily_change_percent) || 0,
        });
      } else {
        // No portfolio data exists, use defaults
        setPortfolio(defaultPortfolio);
      }
    } catch (error) {
      console.error('Error in fetchPortfolio:', error);
      setPortfolio(defaultPortfolio);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();

    const getUserAndSubscribe = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Set up real-time subscription for this specific user
      const channel = supabase
        .channel(`portfolio_changes:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'portfolio_balances',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Portfolio updated by admin:', payload.new);
            setPortfolio({
              cashBalance: Number(payload.new.cash_balance) || 0,
              investedAmount: Number(payload.new.invested_amount) || 0,
              freeMargin: Number(payload.new.free_margin) || 0,
              totalValue: Number(payload.new.total_value) || 0,
              dailyChange: Number(payload.new.daily_change) || 0,
              dailyChangePercent: Number(payload.new.daily_change_percent) || 0,
            });
            
            // Show toast notification
            toast({
              title: 'Balance Updated',
              description: 'Your account balance has been updated by an administrator',
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanup = getUserAndSubscribe();

    return () => {
      cleanup.then(fn => fn?.());
    };
  }, [toast]);

  return { portfolio, loading, refetch: fetchPortfolio };
};