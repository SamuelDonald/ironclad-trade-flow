import { useState, useEffect } from "react";
import { ArrowLeft, Filter, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useTransactions } from "@/hooks/useTransactions";
import { useTrades } from "@/hooks/useTrades";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const History = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { trades, loading: tradesLoading } = useTrades();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkAuth();
  }, []);

  if (!user) {
    return (
      <div className="container max-w-6xl mx-auto p-6 pb-20 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-indigo-700">History</h1>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Sign in to view your transaction history</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 pb-20 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-indigo-700">History</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs for different history types */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Activity</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
        </TabsList>

        {/* All Activity */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Activity</CardTitle>
              <CardDescription>Complete history of transactions and trades</CardDescription>
            </CardHeader>
            <CardContent>
              {(transactionsLoading || tradesLoading) ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-muted animate-pulse rounded"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                          <div className="h-3 w-32 bg-muted animate-pulse rounded"></div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                        <div className="h-5 w-16 bg-muted animate-pulse rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Combine and sort all activities */}
                  {(() => {
                    const allActivities = [
                      ...transactions.map(t => ({ ...t, activity_type: 'transaction' })),
                      ...trades.map(t => ({ ...t, activity_type: 'trade' }))
                    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                    if (allActivities.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No activity yet</p>
                          <p className="text-sm text-muted-foreground mt-1">Your transactions and trades will appear here</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {allActivities.map((activity, index) => (
                          <div key={`${activity.activity_type}-${activity.id}-${index}`} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                            <div className="flex items-center space-x-4">
                              <div className={`w-3 h-3 rounded-full ${
                                activity.activity_type === 'transaction' 
                                  ? (activity.type === 'deposit' ? 'bg-green-500' : 'bg-red-500')
                                  : (activity.type === 'buy' ? 'bg-blue-500' : 'bg-orange-500')
                              }`}></div>
                              <div>
                                <p className="font-medium">
                                  {activity.activity_type === 'transaction' 
                                    ? `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}`
                                    : `${activity.type.toUpperCase()} ${(activity as any).symbol}`
                                  }
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {activity.activity_type === 'transaction' 
                                    ? `${(activity as any).method} • ${new Date(activity.created_at).toLocaleString()}`
                                    : `${(activity as any).shares} shares @ $${(activity as any).price} • ${new Date(activity.created_at).toLocaleString()}`
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${
                                activity.activity_type === 'transaction' 
                                  ? (activity.type === 'deposit' ? 'text-green-600' : 'text-red-600')
                                  : (activity.type === 'buy' ? 'text-red-600' : 'text-green-600')
                              }`}>
                                {activity.activity_type === 'transaction' 
                                  ? `${activity.type === 'deposit' ? '+' : '-'}$${(activity as any).amount.toLocaleString()}`
                                  : `${activity.type === 'sell' ? '+' : '-'}$${(activity as any).total_amount.toLocaleString()}`
                                }
                              </p>
                              <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                                {activity.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Only */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>Deposits and withdrawals</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-muted animate-pulse rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                          <div className="h-3 w-32 bg-muted animate-pulse rounded"></div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                        <div className="h-5 w-20 bg-muted animate-pulse rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No transactions yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Your deposits and withdrawals will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          transaction.type === 'deposit' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium capitalize">{transaction.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.method} • {new Date(transaction.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                        </p>
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trades Only */}
        <TabsContent value="trades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trades</CardTitle>
              <CardDescription>Buy and sell orders</CardDescription>
            </CardHeader>
            <CardContent>
              {tradesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-6 bg-muted animate-pulse rounded"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                          <div className="h-3 w-32 bg-muted animate-pulse rounded"></div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                        <div className="h-5 w-16 bg-muted animate-pulse rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : trades.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No trades yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Your buy and sell orders will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trades.map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                      <div className="flex items-center space-x-4">
                        <Badge variant={trade.type === 'buy' ? 'default' : 'secondary'}>
                          {trade.type.toUpperCase()}
                        </Badge>
                        <div>
                          <p className="font-medium">{trade.symbol}</p>
                          <p className="text-sm text-muted-foreground">
                            {trade.shares} shares @ ${trade.price} • {new Date(trade.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          trade.type === 'sell' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trade.type === 'sell' ? '+' : '-'}${trade.total_amount.toLocaleString()}
                        </p>
                        <Badge variant={trade.status === 'completed' ? 'default' : 'secondary'}>
                          {trade.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default History;