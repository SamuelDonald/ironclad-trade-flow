import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BalanceAdjustmentForm } from './BalanceAdjustmentForm';
import { formatDistanceToNow } from 'date-fns';
import { Menu } from 'lucide-react';

interface UserDetailsModalProps {
  userId: string;
  open: boolean;
  onClose: () => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ userId, open, onClose }) => {
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    }
  }, [userId, open]);

  // Real-time subscription for balance updates
  useEffect(() => {
    if (!open || !userId) return;

    const channel = supabase
      .channel(`user-details-${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'portfolio_balances',
        filter: `user_id=eq.${userId}`
      }, () => {
        fetchUserDetails();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { action: 'user-details', userId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      
      console.log('[UserDetailsModal] Fetched user details:', {
        hasPortfolio: !!data?.portfolio,
        portfolioData: data?.portfolio
      });
      
      // Ensure portfolio has default values if missing
      if (data && !data.portfolio) {
        data.portfolio = {
          cash_balance: 0,
          invested_amount: 0,
          free_margin: 0,
          total_value: 0,
          daily_change: 0,
          daily_change_percent: 0
        };
      }
      
      setUserDetails(data);
    } catch (err) {
      console.error('Error fetching user details:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {/* Floating hamburger menu - mobile only */}
        <div className="sm:hidden fixed top-20 right-4 z-50">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                size="icon"
                className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  variant={activeTab === 'overview' ? 'default' : 'ghost'}
                  className="justify-start"
                  onClick={() => {
                    setActiveTab('overview');
                    setMenuOpen(false);
                  }}
                >
                  Overview
                </Button>
                <Button
                  variant={activeTab === 'balances' ? 'default' : 'ghost'}
                  className="justify-start"
                  onClick={() => {
                    setActiveTab('balances');
                    setMenuOpen(false);
                  }}
                >
                  Balances
                </Button>
                <Button
                  variant={activeTab === 'transactions' ? 'default' : 'ghost'}
                  className="justify-start"
                  onClick={() => {
                    setActiveTab('transactions');
                    setMenuOpen(false);
                  }}
                >
                  Transactions
                </Button>
                <Button
                  variant={activeTab === 'trades' ? 'default' : 'ghost'}
                  className="justify-start"
                  onClick={() => {
                    setActiveTab('trades');
                    setMenuOpen(false);
                  }}
                >
                  Trades
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : userDetails ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden sm:grid w-full sm:grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="balances">Balances</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="trades">Trades</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{userDetails.profile.full_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{userDetails.profile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{userDetails.profile.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">KYC Status</p>
                      <Badge variant={userDetails.profile.kyc_status === 'approved' ? 'default' : 'secondary'}>
                        {userDetails.profile.kyc_status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {userDetails.paymentMethods && userDetails.paymentMethods.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {userDetails.paymentMethods.map((pm: any) => (
                        <div key={pm.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{pm.brand?.toUpperCase()} •••• {pm.last4}</p>
                            <p className="text-sm text-muted-foreground">
                              Expires {pm.exp_month}/{pm.exp_year}
                            </p>
                          </div>
                          {pm.is_default && <Badge>Default</Badge>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="balances">
              <BalanceAdjustmentForm
                userId={userId}
                currentBalances={userDetails.portfolio}
                onSuccess={fetchUserDetails}
              />
            </TabsContent>

            <TabsContent value="transactions" className="space-y-2">
              {userDetails.recentTransactions?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No transactions</p>
              ) : (
                userDetails.recentTransactions?.map((tx: any) => (
                  <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{tx.type}</p>
                      <p className="text-sm text-muted-foreground">{tx.method}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${Number(tx.amount).toFixed(2)}</p>
                      <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="trades" className="space-y-2">
              {userDetails.recentTrades?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No trades</p>
              ) : (
                userDetails.recentTrades?.map((trade: any) => (
                  <div key={trade.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{trade.symbol}</p>
                      <p className="text-sm text-muted-foreground">
                        {trade.type === 'buy' ? 'Bought' : 'Sold'} {trade.shares} shares @ ${Number(trade.price).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(trade.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${Number(trade.total_amount).toFixed(2)}</p>
                      <Badge>{trade.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
