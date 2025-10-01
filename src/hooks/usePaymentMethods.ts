import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethod {
  id: string;
  user_id: string;
  stripe_payment_method_id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
  cardholder_name?: string;
  card_number?: string;
  created_at: string;
  updated_at: string;
}

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPaymentMethods = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setPaymentMethods([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payment methods:', error);
        toast({
          title: "Error loading payment methods",
          description: "Could not load your payment methods.",
          variant: "destructive",
        });
        return;
      }

      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error in fetchPaymentMethods:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async (paymentMethodData: {
    stripe_payment_method_id: string;
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    cardholder_name?: string;
    card_number?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // If this is the first payment method, make it default
      const isFirst = paymentMethods.length === 0;

      const { data, error } = await supabase
        .from('payment_methods')
        .insert([{
          user_id: user.id,
          ...paymentMethodData,
          is_default: isFirst
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setPaymentMethods(prev => [data, ...prev]);
      toast({
        title: "Payment Method Added",
        description: "Your payment method has been saved successfully.",
      });

      return data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast({
        title: "Failed to Add Payment Method",
        description: "Could not save your payment method. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removePaymentMethod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
      toast({
        title: "Payment Method Removed",
        description: "Your payment method has been removed successfully.",
      });
    } catch (error) {
      console.error('Error removing payment method:', error);
      toast({
        title: "Failed to Remove Payment Method",
        description: "Could not remove your payment method. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const setDefaultPaymentMethod = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // First, set all payment methods to non-default
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Then set the selected one as default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      setPaymentMethods(prev => 
        prev.map(pm => ({
          ...pm,
          is_default: pm.id === id
        }))
      );

      toast({
        title: "Default Payment Method Updated",
        description: "Your default payment method has been updated.",
      });
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast({
        title: "Failed to Update Default",
        description: "Could not update your default payment method.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPaymentMethods();

    // Set up real-time subscription
    const channel = supabase
      .channel('payment_methods_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_methods'
        },
        () => {
          fetchPaymentMethods();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { 
    paymentMethods, 
    loading, 
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    refetch: fetchPaymentMethods 
  };
};