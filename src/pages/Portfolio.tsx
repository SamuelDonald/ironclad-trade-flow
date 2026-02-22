import React, { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, Plus, Minus, Eye, EyeOff, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useHoldings } from "@/hooks/useHoldings";
import { useTrades } from "@/hooks/useTrades";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useMarketPrices } from "@/hooks/useMarketPrices";
import { supabase } from "@/integrations/supabase/client";
import { AdminButton } from "@/components/AdminButton";
import { CollapsiblePortfolio } from "@/components/CollapsiblePortfolio";
import { PortfolioSkeleton, WatchlistSkeleton } from "@/components/SkeletonLoader";
import { usePersistedState } from "@/hooks/usePersistedState";

const Portfolio = () => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = usePersistedState('portfolio-show-details', true);
  const [user, setUser] = useState<any>(null);

  // Real data hooks
  const { portfolio, loading: portfolioLoading } = usePortfolio();
  const { holdings, loading: holdingsLoading } = useHoldings();
  const { trades, loading: tradesLoading } = useTrades();
  const { watchlist, loading: watchlistLoading } = useWatchlist();
  
  // Get watchlist symbols for price fetching
  const watchlistSymbols = watchlist.map(item => item.symbol);
  const { prices, getPriceForSymbol } = useMarketPrices(watchlistSymbols);

  // Check authentication status
  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkAuth();
  }, []);

  return (
    <div className="container max-w-7xl mx-auto p-6 pb-20 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Portfolio</h1>
        <div className="flex items-center gap-2">
          <AdminButton />
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:bg-primary/10"
            onClick={() => setShowDetails(!showDetails)}
            aria-label={showDetails ? "Hide portfolio details" : "Show portfolio details"}
          >
            {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Account Balance */}
      <Card className="shadow-md border rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <Wallet className="w-5 h-5" />
            Account Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!user ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Sign in to view your portfolio</p>
              <Button onClick={() => navigate('/auth')}>Sign In</Button>
            </div>
          ) : portfolioLoading ? (
            <PortfolioSkeleton />
          ) : (
            <CollapsiblePortfolio portfolio={portfolio} showDetails={showDetails} />
          )}

          <div className="flex gap-4 mt-8">
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90 text-background transition-all"
              onClick={() => navigate("/wallet?tab=deposits")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Deposit
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-primary/30 text-primary hover:bg-primary/10 gold-border-glow transition-all"
              onClick={() => navigate("/wallet?tab=withdrawals")}
            >
              <Minus className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Watchlist + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Watchlist */}
        <Card className="rounded-xl shadow-sm border">
          <CardHeader>
            <CardTitle className="text-foreground">Watchlist</CardTitle>
            <CardDescription>Track your assets</CardDescription>
          </CardHeader>
          <CardContent>
            {!user ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Sign in to view your watchlist</p>
              </div>
            ) : watchlistLoading ? (
              <WatchlistSkeleton />
            ) : watchlist.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-2">No assets in watchlist</p>
                <Button
                  variant="ghost"
                  className="text-primary hover:bg-primary/10"
                  onClick={() => navigate("/market")}
                >
                  Add Assets to Watchlist
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {watchlist.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/10 transition cursor-pointer"
                    onClick={() => navigate(`/market?symbol=${asset.symbol}`)}
                  >
                    <div>
                      <p className="font-semibold">{asset.symbol}</p>
                      <p className="text-sm text-muted-foreground">{asset.name}</p>
                    </div>
                    <div className="text-right">
                      {(() => {
                        const livePrice = getPriceForSymbol(asset.symbol);
                        const price = livePrice?.price || asset.price || 0;
                        const change = livePrice?.change_value || asset.change_value || 0;
                        return (
                          <>
                            <p className="font-semibold">
                              {price > 0 ? `$${price.toLocaleString()}` : 'Loading...'}
                            </p>
                            <p className={`text-sm flex items-center justify-end ${change >= 0 ? 'text-profit' : 'text-loss'}`}>
                              {change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                              {change !== 0 ? `${(change > 0 ? '+' : '')}${change}` : 'N/A'}
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  className="w-full text-primary hover:bg-primary/10"
                  onClick={() => navigate("/market")}
                >
                  Add More Assets
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="rounded-xl shadow-sm border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Trades & transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {!user ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Sign in to view your activity</p>
              </div>
            ) : tradesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-12 bg-muted animate-pulse rounded"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                        <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
                      </div>
                    </div>
                    <div className="h-3 w-20 bg-muted animate-pulse rounded"></div>
                  </div>
                ))}
              </div>
            ) : trades.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No recent activity</p>
                <p className="text-sm text-muted-foreground mt-1">Your trades will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {trades.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={activity.type === "buy" ? "default" : "secondary"}>
                        {activity.type.toUpperCase()}
                      </Badge>
                      <div>
                        <p className="font-semibold">{activity.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.shares} @ ${activity.price}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Holdings */}
      <Card className="rounded-xl shadow-sm border">
        <CardHeader>
          <CardTitle className="text-foreground">Holdings</CardTitle>
          <CardDescription>Your positions</CardDescription>
        </CardHeader>
        <CardContent>
          {!user ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">Sign in to view your holdings</p>
            </div>
          ) : holdingsLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-3">Asset</th>
                    <th className="text-right py-3">Shares</th>
                    <th className="text-right py-3">Avg Price</th>
                    <th className="text-right py-3">Current Price</th>
                    <th className="text-right py-3">Value</th>
                    <th className="text-right py-3">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="border-b">
                      <td className="py-4">
                        <div className="h-4 w-16 bg-muted animate-pulse rounded mb-1"></div>
                        <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
                      </td>
                      <td className="text-right py-4"><div className="h-4 w-12 bg-muted animate-pulse rounded ml-auto"></div></td>
                      <td className="text-right py-4"><div className="h-4 w-16 bg-muted animate-pulse rounded ml-auto"></div></td>
                      <td className="text-right py-4"><div className="h-4 w-16 bg-muted animate-pulse rounded ml-auto"></div></td>
                      <td className="text-right py-4"><div className="h-4 w-20 bg-muted animate-pulse rounded ml-auto"></div></td>
                      <td className="text-right py-4"><div className="h-8 w-16 bg-muted animate-pulse rounded ml-auto"></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : holdings.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No holdings yet</p>
              <p className="text-sm text-muted-foreground mt-1">Your positions will appear here after trading</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-3">Asset</th>
                    <th className="text-right py-3">Shares</th>
                    <th className="text-right py-3">Avg Price</th>
                    <th className="text-right py-3">Current Price</th>
                    <th className="text-right py-3">Value</th>
                    <th className="text-right py-3">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => {
                    const pnl = holding.profit_loss;
                    const pnlPercent = holding.profit_loss_percent;
                    return (
                      <tr key={holding.id} className="border-b hover:bg-accent/10 transition">
                        <td className="py-4">
                          <p className="font-semibold">{holding.symbol}</p>
                          <p className="text-xs text-muted-foreground">{holding.name}</p>
                        </td>
                        <td className="text-right py-4">{holding.shares}</td>
                        <td className="text-right py-4">${holding.average_price.toFixed(2)}</td>
                        <td className="text-right py-4">${holding.current_price.toFixed(2)}</td>
                        <td className="text-right py-4">${holding.total_value.toLocaleString()}</td>
                        <td className={`text-right py-4 ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          <div className="flex items-center justify-end">
                            {pnl >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                            <div>
                              <p>${Math.abs(pnl).toFixed(2)}</p>
                              <p className="text-xs">({pnlPercent.toFixed(2)}%)</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Portfolio;