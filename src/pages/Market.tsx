import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, TrendingUp, TrendingDown, Search, BarChart3, X, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TradingViewWidget } from "@/components/TradingViewWidget";
import { TradingViewMiniChart } from "@/components/TradingViewMiniChart";
import { WatchlistModal } from "@/components/WatchlistModal";
import { useWatchlist } from "@/hooks/useWatchlist";

// Define the MarketAsset interface
interface MarketAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume?: number;
  category: string;
  tradingViewSymbol: string;
}

const MarketPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("forex");
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);
  const [watchlistModalOpen, setWatchlistModalOpen] = useState(false);
  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  
  // Market assets organized by category with TradingView symbols
  const forexAssets: MarketAsset[] = [
    {
      symbol: "EUR/USD",
      name: "Euro/US Dollar",
      price: 1.0847,
      change: 0.0023,
      category: "forex",
      tradingViewSymbol: "FX:EURUSD",
    },
    {
      symbol: "GBP/USD", 
      name: "British Pound/US Dollar",
      price: 1.2756,
      change: -0.0045,
      category: "forex",
      tradingViewSymbol: "FX:GBPUSD",
    },
    {
      symbol: "USD/JPY",
      name: "US Dollar/Japanese Yen", 
      price: 149.85,
      change: 0.34,
      category: "forex",
      tradingViewSymbol: "FX:USDJPY",
    },
    {
      symbol: "AUD/USD",
      name: "Australian Dollar/US Dollar",
      price: 0.6678,
      change: -0.0012,
      category: "forex", 
      tradingViewSymbol: "FX:AUDUSD",
    },
    {
      symbol: "USD/CHF",
      name: "US Dollar/Swiss Franc",
      price: 0.8934,
      change: 0.0089,
      category: "forex",
      tradingViewSymbol: "FX:USDCHF",
    },
  ];

  const stockAssets: MarketAsset[] = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 185.64,
      change: 2.34,
      volume: 45623000,
      category: "stocks",
      tradingViewSymbol: "NASDAQ:AAPL",
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      price: 378.85,
      change: 4.12,
      volume: 23456000,
      category: "stocks",
      tradingViewSymbol: "NASDAQ:MSFT",
    },
    {
      symbol: "TSLA",
      name: "Tesla, Inc.",
      price: 238.45,
      change: -1.23,
      volume: 98234000,
      category: "stocks",
      tradingViewSymbol: "NASDAQ:TSLA",
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      price: 142.87,
      change: 1.65,
      volume: 34567000,
      category: "stocks",
      tradingViewSymbol: "NASDAQ:AMZN",
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      price: 139.37,
      change: 0.87,
      volume: 23456000,
      category: "stocks",
      tradingViewSymbol: "NASDAQ:GOOGL",
    },
  ];

  const cryptoAssets: MarketAsset[] = [
    {
      symbol: "BTC/USDT",
      name: "Bitcoin",
      price: 63245.78,
      change: 1245.32,
      volume: 2345600000,
      category: "crypto",
      tradingViewSymbol: "BINANCE:BTCUSDT",
    },
    {
      symbol: "ETH/USDT",
      name: "Ethereum",
      price: 3456.89,
      change: -123.45,
      volume: 1234500000,
      category: "crypto",
      tradingViewSymbol: "BINANCE:ETHUSDT",
    },
    {
      symbol: "SOL/USDT",
      name: "Solana",
      price: 145.67,
      change: 8.23,
      volume: 567800000,
      category: "crypto",
      tradingViewSymbol: "BINANCE:SOLUSDT",
    },
    {
      symbol: "BNB/USDT",
      name: "Binance Coin",
      price: 315.42,
      change: -5.67,
      volume: 234500000,
      category: "crypto",
      tradingViewSymbol: "BINANCE:BNBUSDT",
    },
    {
      symbol: "XRP/USDT", 
      name: "Ripple",
      price: 0.5234,
      change: 0.0123,
      volume: 890123000,
      category: "crypto",
      tradingViewSymbol: "BINANCE:XRPUSDT",
    },
  ];

  // Get current assets based on selected category
  const getCurrentAssets = () => {
    switch (selectedCategory) {
      case "forex":
        return forexAssets;
      case "stocks":
        return stockAssets;
      case "crypto":
        return cryptoAssets;
      case "watchlist":
        return [];
      default:
        return forexAssets;
    }
  };

  // Filter assets based on search term
  const filteredAssets = getCurrentAssets().filter((asset) => {
    const matchesSearch = 
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Toggle watchlist for an asset
  const toggleWatchlist = async (asset: MarketAsset) => {
    if (isInWatchlist(asset.symbol)) {
      const watchlistItem = watchlist.find(item => item.symbol === asset.symbol);
      if (watchlistItem) {
        await removeFromWatchlist(watchlistItem.id, asset.symbol);
      }
    } else {
      await addToWatchlist(asset.symbol, asset.name, asset.category);
    }
  };

  // Price formatting helper
  const formatPrice = (price: number, category: string) => {
    if (category === "crypto") {
      return `$${price.toLocaleString()}`;
    } else if (category === "forex") {
      return price.toFixed(4);
    }
    return `$${price.toFixed(2)}`;
  };

  // Market cap formatting helper
  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return "N/A";
    if (marketCap >= 1_000_000_000) {
      return `$${(marketCap / 1_000_000_000).toFixed(1)}B`;
    } else if (marketCap >= 1_000_000) {
      return `$${(marketCap / 1_000_000).toFixed(1)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  };

  const handleBuyTrade = (asset: MarketAsset) => {
    toast({
      title: "Buy Order Placed",
      description: `Buy order for ${asset.symbol} has been placed successfully.`,
    });
  };

  const handleSellTrade = (asset: MarketAsset) => {
    toast({
      title: "Sell Order Placed", 
      description: `Sell order for ${asset.symbol} has been placed successfully.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">Market</h1>
        <div className="flex gap-2">
          <Button className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:opacity-90">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Charts
          </Button>
          <Button 
            onClick={() => setWatchlistModalOpen(true)}
            variant="outline"
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Manage Watchlist
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search assets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-xl shadow-md"
        />
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forex">Forex</TabsTrigger>
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
        </TabsList>

        {/* Forex Tab */}
        <TabsContent value="forex" className="space-y-4">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No forex pairs found matching your search criteria.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAssets.map((asset) => (
                <Dialog key={asset.symbol}>
                  <DialogTrigger asChild>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                          <CardTitle className="text-lg font-bold text-indigo-700">
                            {asset.symbol}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">{asset.name}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(asset);
                          }}
                          className="text-yellow-500 hover:text-yellow-600"
                        >
                          <Star className={`h-4 w-4 ${isInWatchlist(asset.symbol) ? 'fill-current' : ''}`} />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <p className="text-2xl font-bold">
                              {asset.price}
                            </p>
                            <div className="flex items-center space-x-1">
                              {asset.change >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                              )}
                              <span className={`text-sm font-medium ${
                                asset.change >= 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {asset.change >= 0 ? '+' : ''}{asset.change}
                              </span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {asset.category}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl h-[80vh] max-h-[600px] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-indigo-700">
                        {asset.symbol} - {asset.name}
                      </DialogTitle>
                      <p className="text-lg font-semibold text-green-600">
                        Current Price: {formatPrice(asset.price, asset.category)}
                      </p>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="w-full">
                        <TradingViewWidget
                          symbol={asset.tradingViewSymbol}
                          width="100%"
                          height={window.innerWidth < 640 ? 300 : window.innerWidth < 1024 ? 400 : 500}
                          theme="light"
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Button 
                          onClick={() => handleBuyTrade(asset)}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-2"
                        >
                          Buy {asset.symbol}
                        </Button>
                        <Button 
                          onClick={() => handleSellTrade(asset)}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-2"
                        >
                          Sell {asset.symbol}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Stocks Tab */}
        <TabsContent value="stocks" className="space-y-4">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No stocks found matching your search criteria.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAssets.map((asset) => (
                <Dialog key={asset.symbol}>
                  <DialogTrigger asChild>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                          <CardTitle className="text-lg font-bold text-indigo-700">
                            {asset.symbol}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">{asset.name}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(asset);
                          }}
                          className="text-yellow-500 hover:text-yellow-600"
                        >
                          <Star className={`h-4 w-4 ${isInWatchlist(asset.symbol) ? 'fill-current' : ''}`} />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <p className="text-2xl font-bold">
                              ${asset.price}
                            </p>
                            <div className="flex items-center space-x-1">
                              {asset.change >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                              )}
                              <span className={`text-sm font-medium ${
                                asset.change >= 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {asset.change >= 0 ? '+' : ''}${asset.change}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              {asset.category}
                            </Badge>
                            {asset.volume && (
                              <p className="text-xs text-muted-foreground">
                                Vol: {formatMarketCap(asset.volume)}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl h-[80vh] max-h-[600px] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-indigo-700">
                        {asset.symbol} - {asset.name}
                      </DialogTitle>
                      <p className="text-lg font-semibold text-green-600">
                        Current Price: {formatPrice(asset.price, asset.category)}
                      </p>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="w-full">
                        <TradingViewWidget
                          symbol={asset.tradingViewSymbol}
                          width="100%"
                          height={window.innerWidth < 640 ? 300 : window.innerWidth < 1024 ? 400 : 500}
                          theme="light"
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Button 
                          onClick={() => handleBuyTrade(asset)}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-2"
                        >
                          Buy {asset.symbol}
                        </Button>
                        <Button 
                          onClick={() => handleSellTrade(asset)}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-2"
                        >
                          Sell {asset.symbol}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Crypto Tab */}
        <TabsContent value="crypto" className="space-y-4">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No cryptocurrencies found matching your search criteria.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAssets.map((asset) => (
                <Dialog key={asset.symbol}>
                  <DialogTrigger asChild>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                          <CardTitle className="text-lg font-bold text-indigo-700">
                            {asset.symbol}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">{asset.name}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(asset);
                          }}
                          className="text-yellow-500 hover:text-yellow-600"
                        >
                          <Star className={`h-4 w-4 ${isInWatchlist(asset.symbol) ? 'fill-current' : ''}`} />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <p className="text-2xl font-bold">
                              ${asset.price}
                            </p>
                            <div className="flex items-center space-x-1">
                              {asset.change >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                              )}
                              <span className={`text-sm font-medium ${
                                asset.change >= 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {asset.change >= 0 ? '+' : ''}${asset.change}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                              {asset.category}
                            </Badge>
                            {asset.volume && (
                              <p className="text-xs text-muted-foreground">
                                Vol: {formatMarketCap(asset.volume)}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl h-[80vh] max-h-[600px] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-indigo-700">
                        {asset.symbol} - {asset.name}
                      </DialogTitle>
                      <p className="text-lg font-semibold text-green-600">
                        Current Price: {formatPrice(asset.price, asset.category)}
                      </p>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="w-full">
                        <TradingViewWidget
                          symbol={asset.tradingViewSymbol}
                          width="100%"
                          height={window.innerWidth < 640 ? 300 : window.innerWidth < 1024 ? 400 : 500}
                          theme="light"
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Button 
                          onClick={() => handleBuyTrade(asset)}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-2"
                        >
                          Buy {asset.symbol}
                        </Button>
                        <Button 
                          onClick={() => handleSellTrade(asset)}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-2"
                        >
                          Sell {asset.symbol}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Watchlist Tab */}
        <TabsContent value="watchlist" className="space-y-4">
          {watchlist.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Your watchlist is empty</h3>
              <p>Add assets from other tabs to keep track of them here.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {watchlist.map((item) => {
                // Find the matching asset from our static data to get TradingView symbol
                const allAssets = [...forexAssets, ...stockAssets, ...cryptoAssets];
                const matchingAsset = allAssets.find(asset => asset.symbol === item.symbol);
                
                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div>
                        <CardTitle className="text-lg font-bold text-indigo-700">
                          {item.symbol}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{item.name}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromWatchlist(item.id, item.symbol)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                            {item.category}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            Added {new Date(item.added_at).toLocaleDateString()}
                          </p>
                        </div>
                        {matchingAsset && (
                          <div className="h-16">
                            <TradingViewMiniChart
                              symbol={matchingAsset.tradingViewSymbol}
                              height={60}
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <WatchlistModal
        open={watchlistModalOpen}
        onOpenChange={setWatchlistModalOpen}
        forexAssets={forexAssets}
        stockAssets={stockAssets}
        cryptoAssets={cryptoAssets}
      />
    </div>
  );
};

export default MarketPage;