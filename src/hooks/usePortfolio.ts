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

    // Set up real-time subscription
    const channel = supabase
      .channel('portfolio_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolio_balances'
        },
        () => {
          fetchPortfolio();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { portfolio, loading, refetch: fetchPortfolio };
};