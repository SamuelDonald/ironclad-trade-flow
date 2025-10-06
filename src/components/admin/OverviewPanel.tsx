import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Clock, FileCheck, DollarSign, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useAdminOverview } from '@/hooks/useAdminOverview';

import { formatDistanceToNow } from 'date-fns';

export const OverviewPanel: React.FC = () => {
  const { stats, loading, error } = useAdminOverview();

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-32 w-full animate-pulse bg-muted rounded" />
      ))}
    </div>
  );
  if (error) return <div className="text-destructive p-4">Error: {error}</div>;
  if (!stats) return null;

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary' },
    { title: 'Active Trades', value: stats.totalTrades, icon: TrendingUp, color: 'text-chart-2' },
    { title: 'Transactions', value: stats.totalTransactions, icon: DollarSign, color: 'text-chart-3' },
    { title: 'Pending KYC', value: stats.pendingKYC, icon: FileCheck, color: 'text-chart-4' },
    { title: 'Pending Deposits', value: stats.pendingDeposits, icon: ArrowDownCircle, color: 'text-chart-5' },
    { title: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: ArrowUpCircle, color: 'text-chart-1' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentTrades.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No recent trades</p>
          ) : (
            <div className="space-y-3">
              {stats.recentTrades.map((trade: any) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{trade.user_email}</p>
                    <p className="text-sm text-muted-foreground">
                      {trade.type === 'buy' ? 'Bought' : 'Sold'} {trade.shares} shares of {trade.symbol}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${Number(trade.total_amount).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(trade.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
