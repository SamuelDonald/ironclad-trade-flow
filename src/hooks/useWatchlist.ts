import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  category: string;
  added_at: string;
  trading_view_symbol?: string;
  price?: number;
  change_value?: number;
  volume?: number;
  is_custom?: boolean;
}

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWatchlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching watchlist:', error);
        toast({
          title: "Error",
          description: "Failed to load watchlist",
          variant: "destructive",
        });
        return;
      }

      setWatchlist(data || []);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (
    symbol: string, 
    name: string, 
    category: string,
    tradingViewSymbol?: string,
    price?: number,
    changeValue?: number,
    volume?: number,
    isCustom: boolean = false
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to add items to your watchlist",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          symbol,
          name,
          category,
          trading_view_symbol: tradingViewSymbol,
          price,
          change_value: changeValue,
          volume,
          is_custom: isCustom,
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already in Watchlist",
            description: `${symbol} is already in your watchlist`,
            variant: "destructive",
          });
        } else {
          console.error('Error adding to watchlist:', error);
          toast({
            title: "Error",
            description: "Failed to add to watchlist",
            variant: "destructive",
          });
        }
        return false;
      }

      toast({
        title: "Added to Watchlist",
        description: `${symbol} has been added to your watchlist`,
      });

      fetchWatchlist();
      return true;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return false;
    }
  };

  const removeFromWatchlist = async (id: string, symbol: string) => {
    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error removing from watchlist:', error);
        toast({
          title: "Error",
          description: "Failed to remove from watchlist",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Removed from Watchlist",
        description: `${symbol} has been removed from your watchlist`,
      });

      fetchWatchlist();
      return true;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return false;
    }
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(item => item.symbol === symbol);
  };

  useEffect(() => {
    fetchWatchlist();

    // Set up real-time subscription for watchlist changes
    const channel = supabase
      .channel('watchlist-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'watchlist'
        },
        (payload) => {
          console.log('Watchlist changed:', payload);
          fetchWatchlist(); // Refetch watchlist on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    watchlist,
    loading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    refetch: fetchWatchlist,
  };
};