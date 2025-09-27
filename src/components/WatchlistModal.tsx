import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Star, StarOff } from 'lucide-react';
import { useWatchlist } from '@/hooks/useWatchlist';

interface MarketAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume?: number;
  category: string;
  tradingViewSymbol: string;
}

interface WatchlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forexAssets: MarketAsset[];
  stockAssets: MarketAsset[];
  cryptoAssets: MarketAsset[];
}

export const WatchlistModal: React.FC<WatchlistModalProps> = ({
  open,
  onOpenChange,
  forexAssets,
  stockAssets,
  cryptoAssets
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Forex');
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, watchlist } = useWatchlist();

  const getCurrentAssets = () => {
    switch (selectedCategory) {
      case 'Forex':
        return forexAssets;
      case 'Stocks':
        return stockAssets;
      case 'Crypto':
        return cryptoAssets;
      default:
        return forexAssets;
    }
  };

  const filteredAssets = getCurrentAssets().filter(asset =>
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl h-[80vh] max-h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Watchlist</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="Forex">Forex</TabsTrigger>
            <TabsTrigger value="Stocks">Stocks</TabsTrigger>
            <TabsTrigger value="Crypto">Crypto</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="flex-1 overflow-y-auto min-h-0">
            <div className="grid gap-3 pb-4">
              {filteredAssets.map((asset) => (
                <Card key={asset.symbol} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-semibold">{asset.symbol}</h3>
                            <p className="text-sm text-muted-foreground">{asset.name}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold">
                            {asset.category === "crypto" 
                              ? `$${asset.price.toLocaleString()}` 
                              : asset.category === "forex"
                              ? asset.price.toFixed(4)
                              : `$${asset.price.toFixed(2)}`
                            }
                          </p>
                          <p className={`text-sm ${asset.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {asset.change >= 0 ? '+' : ''}{asset.change}{asset.category === "forex" ? "" : "%"}
                          </p>
                        </div>
                        
                        <Button
                          onClick={() => toggleWatchlist(asset)}
                          variant={isInWatchlist(asset.symbol) ? "default" : "outline"}
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          {isInWatchlist(asset.symbol) ? (
                            <>
                              <StarOff className="h-4 w-4" />
                              Remove
                            </>
                          ) : (
                            <>
                              <Star className="h-4 w-4" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};