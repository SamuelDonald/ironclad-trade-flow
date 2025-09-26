import { useState, useEffect } from "react";
import { Wallet, TrendingUp, TrendingDown, Plus, Minus, Eye, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Portfolio = () => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState({
    cashBalance: 50000,
    investedAmount: 25000,
    freeMargin: 75000,
    totalValue: 75000,
    dailyChange: 1250,
    dailyChangePercent: 1.69
  });

  const [watchlist, setWatchlist] = useState([
    { symbol: "AAPL", name: "Apple Inc.", price: 182.52, change: 2.45, changePercent: 1.36 },
    { symbol: "TSLA", name: "Tesla Inc.", price: 248.87, change: -5.23, changePercent: -2.06 },
    { symbol: "BTC", name: "Bitcoin", price: 43250, change: 1250, changePercent: 2.98 },
  ]);

  const [recentActivity, setRecentActivity] = useState([
    { type: "trade", action: "BUY", symbol: "AAPL", amount: 100, price: 182.52, timestamp: "2024-01-15 14:30" },
    { type: "deposit", amount: 5000, timestamp: "2024-01-15 10:15" },
    { type: "trade", action: "SELL", symbol: "TSLA", amount: 50, price: 254.10, timestamp: "2024-01-14 16:45" },
  ]);

  const [holdings, setHoldings] = useState([
    { symbol: "AAPL", name: "Apple Inc.", shares: 100, avgPrice: 180.25, currentPrice: 182.52, value: 18252 },
    { symbol: "MSFT", name: "Microsoft", shares: 50, avgPrice: 420.50, currentPrice: 423.75, value: 21187 },
    { symbol: "BTC", name: "Bitcoin", shares: 0.25, avgPrice: 42000, currentPrice: 43250, value: 10812 },
  ]);

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </div>

      {/* Account Balance Card */}
      <Card className="gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Account Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold">${portfolio.totalValue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <div className="flex items-center justify-center mt-1">
                {portfolio.dailyChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-profit mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-loss mr-1" />
                )}
                <span className={portfolio.dailyChange >= 0 ? "text-profit" : "text-loss"}>
                  ${Math.abs(portfolio.dailyChange).toLocaleString()} ({portfolio.dailyChangePercent}%)
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold">${portfolio.cashBalance.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Cash Balance</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold">${portfolio.investedAmount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Invested Amount</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold">${portfolio.freeMargin.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Free Margin</p>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <Button 
              className="flex-1 transition-spring" 
              onClick={() => navigate("/wallet?tab=deposits")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Deposit
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 transition-spring"
              onClick={() => navigate("/wallet?tab=withdrawals")}
            >
              <Minus className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Watchlist */}
        <Card>
          <CardHeader>
            <CardTitle>Watchlist</CardTitle>
            <CardDescription>Your tracked assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {watchlist.map((asset) => (
                <div key={asset.symbol} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-smooth cursor-pointer">
                  <div>
                    <p className="font-semibold">{asset.symbol}</p>
                    <p className="text-sm text-muted-foreground">{asset.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${asset.price.toLocaleString()}</p>
                    <p className={`text-sm flex items-center ${asset.change >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {asset.change >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {asset.changePercent}%
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={() => navigate("/market")}>
                Add More Assets
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest trades and transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {activity.type === "trade" ? (
                      <Badge variant={activity.action === "BUY" ? "default" : "secondary"}>
                        {activity.action}
                      </Badge>
                    ) : (
                      <Badge variant="outline">DEPOSIT</Badge>
                    )}
                    <div>
                      {activity.type === "trade" ? (
                        <>
                          <p className="font-semibold">{activity.symbol}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.amount} shares @ ${activity.price}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold">Deposit</p>
                          <p className="text-sm text-muted-foreground">${activity.amount?.toLocaleString()}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
          <CardDescription>Your current positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Asset</th>
                  <th className="text-right py-3">Shares</th>
                  <th className="text-right py-3">Avg Price</th>
                  <th className="text-right py-3">Current Price</th>
                  <th className="text-right py-3">Value</th>
                  <th className="text-right py-3">P&L</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => {
                  const pnl = (holding.currentPrice - holding.avgPrice) * holding.shares;
                  const pnlPercent = ((holding.currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
                  
                  return (
                    <tr key={holding.symbol} className="border-b hover:bg-accent/50 transition-smooth">
                      <td className="py-4">
                        <div>
                          <p className="font-semibold">{holding.symbol}</p>
                          <p className="text-sm text-muted-foreground">{holding.name}</p>
                        </div>
                      </td>
                      <td className="text-right py-4">{holding.shares}</td>
                      <td className="text-right py-4">${holding.avgPrice.toFixed(2)}</td>
                      <td className="text-right py-4">${holding.currentPrice.toFixed(2)}</td>
                      <td className="text-right py-4">${holding.value.toLocaleString()}</td>
                      <td className="text-right py-4">
                        <div className={`flex items-center justify-end ${pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                          {pnl >= 0 ? (
                            <TrendingUp className="w-4 h-4 mr-1" />
                          ) : (
                            <TrendingDown className="w-4 h-4 mr-1" />
                          )}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Portfolio;