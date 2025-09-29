import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MarketPrice {
  symbol: string;
  price: number;
  change_value: number;
  change_percent: number;
  volume?: number;
  updated_at: string;
}

export const useMarketPrices = (symbols: string[] = []) => {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPrices = async () => {
    if (symbols.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .in('symbol', symbols);

      if (error) {
        console.error('Error fetching market prices:', error);
        toast({
          title: "Error loading prices",
          description: "Could not load market price data.",
          variant: "destructive",
        });
        return;
      }

      setPrices(data || []);
    } catch (error) {
      console.error('Error in fetchPrices:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch prices when symbols change
  useEffect(() => {
    fetchPrices();
  }, [symbols.join(',')]);

  // Set up real-time subscription
  useEffect(() => {
    if (symbols.length === 0) return;

    const channel = supabase
      .channel('market_prices_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_prices',
          filter: `symbol=in.(${symbols.join(',')})`
        },
        (payload) => {
          console.log('Market price update:', payload);
          fetchPrices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [symbols.join(',')]);

  const getPriceForSymbol = (symbol: string): MarketPrice | null => {
    return prices.find(p => p.symbol === symbol) || null;
  };

  return { 
    prices, 
    loading, 
    refetch: fetchPrices,
    getPriceForSymbol
  };
};