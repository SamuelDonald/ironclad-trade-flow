import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BalanceAdjustmentForm } from './BalanceAdjustmentForm';
import { formatDistanceToNow } from 'date-fns';

interface UserDetailsModalProps {
  userId: string;
  open: boolean;
  onClose: () => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ userId, open, onClose }) => {
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    }
  }, [userId, open]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke(
        `admin-operations/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) throw error;
      setUserDetails(data);
    } catch (err) {
      console.error('Error fetching user details:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : userDetails ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
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
                  <div className="grid grid-cols-2 gap-4">
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
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
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
                  <div key={trade.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
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
