import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, TrendingUp, TrendingDown, Search, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TradingViewWidget } from "@/components/TradingViewWidget";
import { WatchlistModal } from "@/components/WatchlistModal";
import { useWatchlist } from "@/hooks/useWatchlist";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  const [lotSize, setLotSize] = useState("1.0");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
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
  const formatPrice = (asset: MarketAsset) => {
    if (asset.category === "crypto") {
      return `$${asset.price.toLocaleString()}`;
    } else if (asset.category === "forex") {
      return asset.price.toFixed(4);
    }
    return `$${asset.price.toFixed(2)}`;
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
      description: `Buying ${asset.symbol} - Lot: ${lotSize}, SL: ${stopLoss || 'None'}, TP: ${takeProfit || 'None'}`,
    });
  };

  const handleSellTrade = (asset: MarketAsset) => {
    toast({
      title: "Sell Order Placed", 
      description: `Selling ${asset.symbol} - Lot: ${lotSize}, SL: ${stopLoss || 'None'}, TP: ${takeProfit || 'None'}`,
    });
  };

  const lotSizeOptions = ["0.01", "0.1", "0.5", "1.0", "2.0", "5.0"];

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">Market</h1>
        <div className="flex gap-2">
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forex">Forex</TabsTrigger>
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
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
                <Card key={asset.symbol} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div 
                      className="cursor-pointer flex-1"
                      onClick={() => setSelectedAsset(asset)}
                    >
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
                  <CardContent 
                    className="cursor-pointer"
                    onClick={() => setSelectedAsset(asset)}
                  >
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
                <Card key={asset.symbol} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div 
                      className="cursor-pointer flex-1"
                      onClick={() => setSelectedAsset(asset)}
                    >
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
                  <CardContent 
                    className="cursor-pointer"
                    onClick={() => setSelectedAsset(asset)}
                  >
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
                <Card key={asset.symbol} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div 
                      className="cursor-pointer flex-1"
                      onClick={() => setSelectedAsset(asset)}
                    >
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
                  <CardContent 
                    className="cursor-pointer"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-2xl font-bold">
                          ${asset.price.toLocaleString()}
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
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
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
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Chart Dialog */}
      <Dialog open={!!selectedAsset} onOpenChange={(open) => !open && setSelectedAsset(null)}>
        {selectedAsset && (
          <DialogContent className="max-w-[95vw] md:max-w-7xl h-[85vh] max-h-[800px] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-xl font-bold">
                {selectedAsset.symbol} - {selectedAsset.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 p-6 pt-4 overflow-hidden">
              <div className="flex flex-col lg:flex-row gap-4 h-full">
                {/* Chart Container */}
                <div className="flex-1 lg:w-3/5 bg-white rounded-lg overflow-hidden">
                  <TradingViewWidget
                    symbol={selectedAsset.tradingViewSymbol}
                    width="100%"
                    height="100%"
                    interval="D"
                    theme="light"
                    style="1"
                    locale="en"
                    toolbar_bg="#f1f3f6"
                    enable_publishing={false}
                    allow_symbol_change={true}
                    container_id="tradingview_chart"
                  />
                </div>
                
                {/* Trading Panel */}
                <div className="lg:w-2/5 bg-gray-50 p-4 rounded-lg border space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Trade Panel</h3>
                    
                    {/* Trade Inputs */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="lotSize" className="text-sm font-medium text-gray-700">
                          Lot Size
                        </Label>
                        <Select value={lotSize} onValueChange={setLotSize}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select lot size" />
                          </SelectTrigger>
                          <SelectContent>
                            {lotSizeOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="stopLoss" className="text-sm font-medium text-gray-700">
                            Stop Loss
                          </Label>
                          <Input
                            id="stopLoss"
                            type="number"
                            step="0.0001"
                            placeholder="0.0000"
                            value={stopLoss}
                            onChange={(e) => setStopLoss(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="takeProfit" className="text-sm font-medium text-gray-700">
                            Take Profit
                          </Label>
                          <Input
                            id="takeProfit"
                            type="number"
                            step="0.0001"
                            placeholder="0.0000"
                            value={takeProfit}
                            onChange={(e) => setTakeProfit(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Trade Buttons */}
                    <div className="flex flex-col gap-2 mt-6">
                      <Button
                        onClick={() => handleBuyTrade(selectedAsset)}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                      >
                        Buy {selectedAsset.symbol}
                      </Button>
                      <Button
                        onClick={() => handleSellTrade(selectedAsset)}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                      >
                        Sell {selectedAsset.symbol}
                      </Button>
                    </div>
                    
                    {/* Asset Details */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Price:</span>
                          <span className="font-medium">{formatPrice(selectedAsset)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Change:</span>
                          <span className={`font-medium ${selectedAsset.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedAsset.change >= 0 ? '+' : ''}{selectedAsset.change}{selectedAsset.category === "forex" ? "" : "%"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium capitalize">{selectedAsset.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Watchlist Modal */}
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