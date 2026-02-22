import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, TrendingUp, TrendingDown, Search, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TradingViewWidget } from "@/components/TradingViewWidget";
import { WatchlistModal } from "@/components/WatchlistModal";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useCombinedAssets, type MarketAsset } from "@/hooks/useCombinedAssets";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const MarketPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("forex");
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);
  const [watchlistModalOpen, setWatchlistModalOpen] = useState(false);
  const [lotSize, setLotSize] = useState("1.0");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { forexAssets, stockAssets, cryptoAssets } = useCombinedAssets();

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
      await addToWatchlist(
        asset.symbol, 
        asset.name, 
        asset.category,
        asset.tradingViewSymbol,
        asset.price,
        asset.change,
        asset.volume,
        asset.isCustom || false
      );
    }
  };

  // Price formatting helper
  const formatPrice = (asset: MarketAsset) => {
    if (asset.category === "Crypto") {
      return `$${asset.price.toLocaleString()}`;
    } else if (asset.category === "Forex") {
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

  const handleBuyTrade = async (asset: MarketAsset) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Error", description: "You must be logged in to trade.", variant: "destructive" });
        return;
      }
      const total_amount = asset.price * parseFloat(lotSize);
      const { error } = await supabase.from('trades').insert({
        user_id: user.id,
        type: 'buy',
        symbol: asset.symbol,
        name: asset.name,
        shares: parseFloat(lotSize),
        price: asset.price,
        total_amount,
        category: asset.category,
        status: 'completed',
      });
      if (error) throw error;
      toast({ title: "Buy Order Placed", description: `Bought ${lotSize} ${asset.symbol} at ${asset.price}` });
    } catch (error) {
      console.error('Buy trade error:', error);
      toast({ title: "Trade Failed", description: "Could not place buy order.", variant: "destructive" });
    }
  };

  const handleSellTrade = async (asset: MarketAsset) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Error", description: "You must be logged in to trade.", variant: "destructive" });
        return;
      }
      const total_amount = asset.price * parseFloat(lotSize);
      const { error } = await supabase.from('trades').insert({
        user_id: user.id,
        type: 'sell',
        symbol: asset.symbol,
        name: asset.name,
        shares: parseFloat(lotSize),
        price: asset.price,
        total_amount,
        category: asset.category,
        status: 'completed',
      });
      if (error) throw error;
      toast({ title: "Sell Order Placed", description: `Sold ${lotSize} ${asset.symbol} at ${asset.price}` });
    } catch (error) {
      console.error('Sell trade error:', error);
      toast({ title: "Trade Failed", description: "Could not place sell order.", variant: "destructive" });
    }
  };

  const lotSizeOptions = ["0.01", "0.1", "0.5", "1.0", "2.0", "5.0"];

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">Market</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => setWatchlistModalOpen(true)}
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/10 gold-border-glow"
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
            <>
              {/* Desktop: Card Grid */}
              <div className="hidden md:grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAssets.map((asset) => (
                  <Card key={asset.symbol} className="card-binance">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div 
                        className="cursor-pointer flex-1"
                        onClick={() => setSelectedAsset(asset)}
                      >
                        <CardTitle className="text-lg font-bold text-foreground">
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
                              <TrendingUp className="h-4 w-4 text-profit" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-loss" />
                            )}
                            <span className={`text-sm font-medium ${
                              asset.change >= 0 ? 'text-profit' : 'text-loss'
                            }`}>
                              {asset.change >= 0 ? '+' : ''}{asset.change}
                            </span>
                          </div>
                        </div>
                        <Badge className="gradient-wallet-gold text-background">
                          {asset.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Mobile: Compact List */}
              <div className="md:hidden divide-y">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.symbol}
                    className="flex items-center justify-between py-3 px-4 hover:bg-accent/10 cursor-pointer transition-colors"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full gradient-wallet-gold flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-background">{asset.symbol.substring(0, 2)}</span>
                      </div>
                      {isInWatchlist(asset.symbol) && (
                        <Star className="w-3 h-3 fill-primary text-primary flex-shrink-0" />
                      )}
                      <div className="leading-tight min-w-0 flex-1">
                        <p className="font-bold text-sm truncate">{asset.symbol}</p>
                        <p className="text-xs text-muted-foreground truncate">{asset.name}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-bold text-sm">{asset.price}</p>
                      <p className={`text-xs ${asset.change >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {asset.change >= 0 ? '+' : ''}{asset.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Stocks Tab */}
        <TabsContent value="stocks" className="space-y-4">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No stocks found matching your search criteria.
            </div>
          ) : (
            <>
              {/* Desktop: Card Grid */}
              <div className="hidden md:grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAssets.map((asset) => (
                  <Card key={asset.symbol} className="card-binance">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div 
                        className="cursor-pointer flex-1"
                        onClick={() => setSelectedAsset(asset)}
                      >
                        <CardTitle className="text-lg font-bold text-foreground">
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
                              <TrendingUp className="h-4 w-4 text-profit" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-loss" />
                            )}
                            <span className={`text-sm font-medium ${
                              asset.change >= 0 ? 'text-profit' : 'text-loss'
                            }`}>
                              {asset.change >= 0 ? '+' : ''}${asset.change}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge className="gradient-wallet-teal text-white">
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

              {/* Mobile: Compact List */}
              <div className="md:hidden divide-y">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.symbol}
                    className="flex items-center justify-between py-3 px-4 hover:bg-accent/10 cursor-pointer transition-colors"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full gradient-wallet-teal flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">{asset.symbol.substring(0, 2)}</span>
                      </div>
                      {isInWatchlist(asset.symbol) && (
                        <Star className="w-3 h-3 fill-primary text-primary flex-shrink-0" />
                      )}
                      <div className="leading-tight min-w-0 flex-1">
                        <p className="font-bold text-sm truncate">{asset.symbol}</p>
                        <p className="text-xs text-muted-foreground truncate">{asset.name}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-bold text-sm">${asset.price}</p>
                      <p className={`text-xs ${asset.change >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {asset.change >= 0 ? '+' : ''}${asset.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Crypto Tab */}
        <TabsContent value="crypto" className="space-y-4">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No cryptocurrencies found matching your search criteria.
            </div>
          ) : (
            <>
              {/* Desktop: Card Grid */}
              <div className="hidden md:grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAssets.map((asset) => (
                  <Card key={asset.symbol} className="card-binance">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div 
                        className="cursor-pointer flex-1"
                        onClick={() => setSelectedAsset(asset)}
                      >
                        <CardTitle className="text-lg font-bold text-foreground">
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
                              <TrendingUp className="h-4 w-4 text-profit" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-loss" />
                            )}
                            <span className={`text-sm font-medium ${
                              asset.change >= 0 ? 'text-profit' : 'text-loss'
                            }`}>
                              {asset.change >= 0 ? '+' : ''}${asset.change}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge className="gradient-wallet-violet text-white">
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

              {/* Mobile: Compact List */}
              <div className="md:hidden divide-y">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.symbol}
                    className="flex items-center justify-between py-3 px-4 hover:bg-accent/10 cursor-pointer transition-colors"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full gradient-wallet-violet flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">{asset.symbol.substring(0, 2)}</span>
                      </div>
                      {isInWatchlist(asset.symbol) && (
                        <Star className="w-3 h-3 fill-primary text-primary flex-shrink-0" />
                      )}
                      <div className="leading-tight min-w-0 flex-1">
                        <p className="font-bold text-sm truncate">{asset.symbol}</p>
                        <p className="text-xs text-muted-foreground truncate">{asset.name}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-bold text-sm">${asset.price.toLocaleString()}</p>
                      <p className={`text-xs ${asset.change >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {asset.change >= 0 ? '+' : ''}${asset.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Asset Detail Dialog */}
      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] p-0 overflow-auto">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl font-bold">{selectedAsset?.symbol}</span>
              <Badge variant="secondary" className="text-xs">
                {selectedAsset?.category}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col lg:flex-row h-full min-h-[600px]">
            {/* Chart Section - Now takes more space */}
            <div className="flex-1 lg:w-4/5 p-6 pt-0 overflow-auto">
              {selectedAsset && (
                <div className="h-full min-h-[500px] overflow-auto">
                  <TradingViewWidget
                    symbol={selectedAsset.tradingViewSymbol}
                    width="100%"
                    height={window.innerWidth >= 1024 ? 650 : window.innerWidth >= 768 ? 500 : 450}
                    interval="1D"
                    theme="light"
                    style="1"
                    locale="en"
                    toolbar_bg="#f1f2f6"
                    enable_publishing={false}
                    allow_symbol_change={true}
                    container_id={`tradingview_${selectedAsset.symbol}`}
                  />
                </div>
              )}
            </div>
            
            {/* Trading Panel - Now smaller */}
            <div className="lg:w-1/5 border-t lg:border-t-0 lg:border-l bg-muted/30 p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{selectedAsset?.name}</h3>
                  <p className="text-2xl font-bold text-primary">
                    {selectedAsset && formatPrice(selectedAsset)}
                  </p>
                  <p className={`text-sm ${selectedAsset?.change && selectedAsset.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedAsset?.change && selectedAsset.change >= 0 ? '+' : ''}{selectedAsset?.change}
                    {selectedAsset?.changePercent && ` (${selectedAsset.changePercent}%)`}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="lot-size" className="text-sm font-medium">
                      Lot Size
                    </Label>
                    <Select value={lotSize} onValueChange={setLotSize}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {lotSizeOptions.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="stop-loss" className="text-sm font-medium">
                      Stop Loss
                    </Label>
                    <Input
                      id="stop-loss"
                      placeholder="Optional"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="take-profit" className="text-sm font-medium">
                      Take Profit
                    </Label>
                    <Input
                      id="take-profit"
                      placeholder="Optional"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button 
                      onClick={() => selectedAsset && handleBuyTrade(selectedAsset)}
                      className="bg-profit hover:bg-profit/90 text-white"
                      size="sm"
                    >
                      Buy
                    </Button>
                    <Button 
                      onClick={() => selectedAsset && handleSellTrade(selectedAsset)}
                      variant="destructive"
                      size="sm"
                    >
                      Sell
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
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