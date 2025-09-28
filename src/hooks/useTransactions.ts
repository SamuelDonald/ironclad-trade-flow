import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'failed';
  crypto_type?: string;
  transaction_hash?: string;
  created_at: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching transactions:', error);
        toast({
          title: "Error loading transactions",
          description: "Could not load your transaction history.",
          variant: "destructive",
        });
        setTransactions([]);
      } else {
        const processedTransactions = (data || []).map(transaction => ({
          ...transaction,
          amount: Number(transaction.amount) || 0,
          type: transaction.type as 'deposit' | 'withdrawal',
          status: transaction.status as 'pending' | 'completed' | 'failed',
        }));
        setTransactions(processedTransactions);
      }
    } catch (error) {
      console.error('Error in fetchTransactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    // Set up real-time subscription
    const channel = supabase
      .channel('transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { transactions, loading, refetch: fetchTransactions };
};