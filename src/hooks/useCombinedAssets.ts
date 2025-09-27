import { useState, useEffect, useMemo } from 'react';
import { useWatchlist } from './useWatchlist';

export interface MarketAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent?: number;
  category: 'Forex' | 'Stocks' | 'Crypto';
  tradingViewSymbol: string;
  volume?: number;
  marketCap?: number;
  isCustom?: boolean;
}

// Default/demo assets for each category
const defaultForexAssets: MarketAsset[] = [
  {
    symbol: "EURUSD",
    name: "EUR/USD",
    price: 1.0847,
    change: 0.0023,
    changePercent: 0.21,
    category: "Forex",
    tradingViewSymbol: "FX:EURUSD"
  },
  {
    symbol: "GBPUSD",
    name: "GBP/USD",
    price: 1.2634,
    change: -0.0045,
    changePercent: -0.35,
    category: "Forex",
    tradingViewSymbol: "FX:GBPUSD"
  },
  {
    symbol: "USDJPY",
    name: "USD/JPY",
    price: 156.42,
    change: 0.87,
    changePercent: 0.56,
    category: "Forex",
    tradingViewSymbol: "FX:USDJPY"
  }
];

const defaultStockAssets: MarketAsset[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 224.63,
    change: 2.47,
    changePercent: 1.11,
    category: "Stocks",
    tradingViewSymbol: "NASDAQ:AAPL",
    volume: 45234567,
    marketCap: 3400000000000
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 248.98,
    change: -5.12,
    changePercent: -2.02,
    category: "Stocks",
    tradingViewSymbol: "NASDAQ:TSLA",
    volume: 89234567,
    marketCap: 792000000000
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 173.25,
    change: 1.85,
    changePercent: 1.08,
    category: "Stocks",
    tradingViewSymbol: "NASDAQ:GOOGL",
    volume: 23456789,
    marketCap: 2100000000000
  }
];

const defaultCryptoAssets: MarketAsset[] = [
  {
    symbol: "BTCUSD",
    name: "Bitcoin",
    price: 67845.32,
    change: 1234.56,
    changePercent: 1.85,
    category: "Crypto",
    tradingViewSymbol: "BINANCE:BTCUSDT",
    volume: 987654321,
    marketCap: 1340000000000
  },
  {
    symbol: "ETHUSD",
    name: "Ethereum",
    price: 3456.78,
    change: -89.34,
    changePercent: -2.52,
    category: "Crypto",
    tradingViewSymbol: "BINANCE:ETHUSDT",
    volume: 456789123,
    marketCap: 415000000000
  },
  {
    symbol: "ADAUSD",
    name: "Cardano",
    price: 0.8923,
    change: 0.0345,
    changePercent: 4.02,
    category: "Crypto",
    tradingViewSymbol: "BINANCE:ADAUSDT",
    volume: 234567890,
    marketCap: 31500000000
  }
];

export const useCombinedAssets = () => {
  const { watchlist, loading: watchlistLoading } = useWatchlist();
  const [customAssetPrices, setCustomAssetPrices] = useState<Record<string, MarketAsset>>({});

  // Convert watchlist items to MarketAsset format
  const customAssets: MarketAsset[] = useMemo(() => {
    return watchlist
      .filter(item => item.is_custom)
      .map(item => ({
        symbol: item.symbol,
        name: item.name,
        price: item.price || 0,
        change: item.change_value || 0,
        changePercent: item.price && item.change_value ? 
          (item.change_value / (item.price - item.change_value)) * 100 : 0,
        category: item.category as 'Forex' | 'Stocks' | 'Crypto',
        tradingViewSymbol: item.trading_view_symbol || item.symbol,
        volume: item.volume || undefined,
        isCustom: true
      }));
  }, [watchlist]);

  // Get all assets by category
  const getAssetsByCategory = (category: 'Forex' | 'Stocks' | 'Crypto'): MarketAsset[] => {
    let defaultAssets: MarketAsset[] = [];
    
    switch (category) {
      case 'Forex':
        defaultAssets = defaultForexAssets;
        break;
      case 'Stocks':
        defaultAssets = defaultStockAssets;
        break;
      case 'Crypto':
        defaultAssets = defaultCryptoAssets;
        break;
    }

    const categoryCustomAssets = customAssets.filter(asset => asset.category === category);
    
    // Combine default and custom assets, removing duplicates (custom takes precedence)
    const combined = [...defaultAssets];
    
    categoryCustomAssets.forEach(customAsset => {
      const existingIndex = combined.findIndex(asset => asset.symbol === customAsset.symbol);
      if (existingIndex >= 0) {
        combined[existingIndex] = customAsset; // Replace with custom version
      } else {
        combined.push(customAsset); // Add new custom asset
      }
    });

    return combined;
  };

  // Get all assets combined
  const getAllAssets = (): MarketAsset[] => {
    return [
      ...getAssetsByCategory('Forex'),
      ...getAssetsByCategory('Stocks'),
      ...getAssetsByCategory('Crypto')
    ];
  };

  // Check if an asset is in watchlist (including custom assets)
  const isInWatchlist = (symbol: string): boolean => {
    return watchlist.some(item => item.symbol === symbol);
  };

  // Get asset by symbol from combined list
  const getAssetBySymbol = (symbol: string): MarketAsset | undefined => {
    return getAllAssets().find(asset => asset.symbol === symbol);
  };

  return {
    forexAssets: getAssetsByCategory('Forex'),
    stockAssets: getAssetsByCategory('Stocks'),
    cryptoAssets: getAssetsByCategory('Crypto'),
    allAssets: getAllAssets(),
    customAssets,
    isInWatchlist,
    getAssetBySymbol,
    loading: watchlistLoading
  };
};