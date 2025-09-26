import { useState, useEffect } from "react";
import { Search, TrendingUp, TrendingDown, Star, Plus, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface MarketAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  category: "stocks" | "forex" | "crypto";
  isWatched: boolean;
}

const Market = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "stocks" | "forex" | "crypto">("all");
  const [assets, setAssets] = useState<MarketAsset[]>([
    // Stocks
    { symbol: "AAPL", name: "Apple Inc.", price: 182.52, change: 2.45, changePercent: 1.36, volume: 45280000, marketCap: 2890000000000, category: "stocks", isWatched: true },
    { symbol: "MSFT", name: "Microsoft Corporation", price: 423.75, change: 5.12, changePercent: 1.22, volume: 28150000, marketCap: 3150000000000, category: "stocks", isWatched: false },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 141.80, change: -1.23, changePercent: -0.86, volume: 32450000, marketCap: 1780000000000, category: "stocks", isWatched: false },
    { symbol: "TSLA", name: "Tesla Inc.", price: 248.87, change: -5.23, changePercent: -2.06, volume: 95670000, marketCap: 792000000000, category: "stocks", isWatched: true },
    { symbol: "NVDA", name: "NVIDIA Corporation", price: 872.50, change: 15.30, changePercent: 1.78, volume: 41230000, marketCap: 2150000000000, category: "stocks", isWatched: false },
    
    // Forex
    { symbol: "EURUSD", name: "Euro / US Dollar", price: 1.0892, change: 0.0025, changePercent: 0.23, volume: 0, category: "forex", isWatched: false },
    { symbol: "GBPUSD", name: "British Pound / US Dollar", price: 1.2734, change: -0.0045, changePercent: -0.35, volume: 0, category: "forex", isWatched: true },
    { symbol: "USDJPY", name: "US Dollar / Japanese Yen", price: 149.65, change: 0.85, changePercent: 0.57, volume: 0, category: "forex", isWatched: false },
    { symbol: "AUDUSD", name: "Australian Dollar / US Dollar", price: 0.6589, change: -0.0012, changePercent: -0.18, volume: 0, category: "forex", isWatched: false },
    
    // Crypto
    { symbol: "BTC", name: "Bitcoin", price: 43250.50, change: 1250.30, changePercent: 2.98, volume: 28450000000, marketCap: 847000000000, category: "crypto", isWatched: true },
    { symbol: "ETH", name: "Ethereum", price: 2584.75, change: -65.25, changePercent: -2.46, volume: 12340000000, marketCap: 310000000000, category: "crypto", isWatched: false },
    { symbol: "BNB", name: "Binance Coin", price: 315.80, change: 8.45, changePercent: 2.75, volume: 1890000000, marketCap: 47200000000, category: "crypto", isWatched: false },
    { symbol: "SOL", name: "Solana", price: 98.42, change: 4.12, changePercent: 4.37, volume: 2340000000, marketCap: 42800000000, category: "crypto", isWatched: false },
  ]);

  const { toast } = useToast();

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || asset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleWatchlist = (symbol: string) => {
    setAssets(prev => prev.map(asset => 
      asset.symbol === symbol 
        ? { ...asset, isWatched: !asset.isWatched }
        : asset
    ));
    
    const asset = assets.find(a => a.symbol === symbol);
    toast({
      title: asset?.isWatched ? "Removed from Watchlist" : "Added to Watchlist",
      description: `${symbol} has been ${asset?.isWatched ? 'removed from' : 'added to'} your watchlist`,
    });
  };

  const formatPrice = (price: number, category: string) => {
    if (category === "crypto" && price > 1000) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (category === "forex") {
      return price.toFixed(4);
    }
    return `$${price.toFixed(2)}`;
  };

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return "N/A";
    if (marketCap >= 1000000000000) {
      return `$${(marketCap / 1000000000000).toFixed(1)}T`;
    } else if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(1)}B`;
    } else if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(1)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Market</h1>
        <Button variant="outline" size="sm">
          <BarChart3 className="w-4 h-4 mr-2" />
          View Charts
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="stocks">Stocks</TabsTrigger>
                <TabsTrigger value="forex">Forex</TabsTrigger>
                <TabsTrigger value="crypto">Crypto</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Market Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((asset) => (
          <Card 
            key={asset.symbol} 
            className="hover:shadow-lg-custom transition-all duration-300 cursor-pointer group"
            onClick={() => {
              toast({
                title: "Asset Details",
                description: `Opening detailed chart for ${asset.symbol}`,
              });
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{asset.symbol}</CardTitle>
                  <CardDescription className="text-sm">{asset.name}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {asset.category.toUpperCase()}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(asset.symbol);
                    }}
                    className="p-1 h-8 w-8"
                  >
                    <Star 
                      className={`w-4 h-4 ${asset.isWatched ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                    />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {formatPrice(asset.price, asset.category)}
                  </span>
                  <div className={`flex items-center ${asset.change >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {asset.change >= 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    <div className="text-right">
                      <div className="font-semibold">
                        {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}
                      </div>
                      <div className="text-sm">
                        ({asset.changePercent >= 0 ? '+' : ''}{asset.changePercent}%)
                      </div>
                    </div>
                  </div>
                </div>
                
                {asset.category !== "forex" && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    {asset.volume > 0 && (
                      <div className="flex justify-between">
                        <span>Volume:</span>
                        <span>{asset.volume.toLocaleString()}</span>
                      </div>
                    )}
                    {asset.marketCap && (
                      <div className="flex justify-between">
                        <span>Market Cap:</span>
                        <span>{formatMarketCap(asset.marketCap)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No assets found matching your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Market;