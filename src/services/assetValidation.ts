import { toast } from "@/hooks/use-toast";

export interface AssetValidationResult {
  isValid: boolean;
  tradingViewSymbol?: string;
  suggestedName?: string;
  error?: string;
}

export interface CustomAsset {
  symbol: string;
  name: string;
  category: 'Forex' | 'Stocks' | 'Crypto';
  tradingViewSymbol: string;
  price?: number;
  change?: number;
  volume?: number;
}

// TradingView symbol prefixes by category
const SYMBOL_PREFIXES = {
  Forex: ['FX:', 'OANDA:', 'FXCM:'],
  Stocks: ['NASDAQ:', 'NYSE:', 'LSE:', 'TSE:', 'ASX:'],
  Crypto: ['BINANCE:', 'COINBASE:', 'KRAKEN:', 'BITSTAMP:']
};

export const validateAssetSymbol = (
  symbol: string, 
  category: 'Forex' | 'Stocks' | 'Crypto'
): AssetValidationResult => {
  if (!symbol || symbol.trim().length === 0) {
    return { isValid: false, error: 'Symbol cannot be empty' };
  }

  const cleanSymbol = symbol.trim().toUpperCase();

  switch (category) {
    case 'Forex':
      return validateForexSymbol(cleanSymbol);
    case 'Stocks':
      return validateStockSymbol(cleanSymbol);
    case 'Crypto':
      return validateCryptoSymbol(cleanSymbol);
    default:
      return { isValid: false, error: 'Invalid category' };
  }
};

const validateForexSymbol = (symbol: string): AssetValidationResult => {
  // Check if already has a prefix
  const hasPrefix = SYMBOL_PREFIXES.Forex.some(prefix => symbol.startsWith(prefix));
  
  if (hasPrefix) {
    return { 
      isValid: true, 
      tradingViewSymbol: symbol,
      suggestedName: symbol.split(':')[1] || symbol
    };
  }

  // Basic forex pair validation (6 characters, common pairs)
  if (symbol.length === 6 && /^[A-Z]{6}$/.test(symbol)) {
    const base = symbol.substring(0, 3);
    const quote = symbol.substring(3, 6);
    return {
      isValid: true,
      tradingViewSymbol: `FX:${symbol}`,
      suggestedName: `${base}/${quote}`
    };
  }

  // Try with common separators
  const withSlash = symbol.replace('/', '');
  if (withSlash.length === 6 && /^[A-Z]{6}$/.test(withSlash)) {
    const base = withSlash.substring(0, 3);
    const quote = withSlash.substring(3, 6);
    return {
      isValid: true,
      tradingViewSymbol: `FX:${withSlash}`,
      suggestedName: `${base}/${quote}`
    };
  }

  return { 
    isValid: false, 
    error: 'Invalid forex symbol. Use format like EURUSD or EUR/USD' 
  };
};

const validateStockSymbol = (symbol: string): AssetValidationResult => {
  // Check if already has an exchange prefix
  const hasPrefix = SYMBOL_PREFIXES.Stocks.some(prefix => symbol.startsWith(prefix));
  
  if (hasPrefix) {
    return { 
      isValid: true, 
      tradingViewSymbol: symbol,
      suggestedName: symbol.split(':')[1] || symbol
    };
  }

  // Basic stock symbol validation (1-5 characters, letters only for most markets)
  if (/^[A-Z]{1,5}$/.test(symbol)) {
    return {
      isValid: true,
      tradingViewSymbol: `NASDAQ:${symbol}`,
      suggestedName: symbol
    };
  }

  return { 
    isValid: false, 
    error: 'Invalid stock symbol. Use 1-5 letter ticker (e.g., AAPL, TSLA)' 
  };
};

const validateCryptoSymbol = (symbol: string): AssetValidationResult => {
  // Check if already has an exchange prefix
  const hasPrefix = SYMBOL_PREFIXES.Crypto.some(prefix => symbol.startsWith(prefix));
  
  if (hasPrefix) {
    return { 
      isValid: true, 
      tradingViewSymbol: symbol,
      suggestedName: symbol.split(':')[1] || symbol
    };
  }

  // Basic crypto pair validation
  const cryptoPattern = /^[A-Z]{3,10}(USD|USDT|BTC|ETH)?$/;
  if (cryptoPattern.test(symbol)) {
    // If no quote currency, default to USD
    const fullSymbol = symbol.endsWith('USD') || symbol.endsWith('USDT') || 
                       symbol.endsWith('BTC') || symbol.endsWith('ETH') 
                       ? symbol : `${symbol}USD`;
    
    return {
      isValid: true,
      tradingViewSymbol: `BINANCE:${fullSymbol}`,
      suggestedName: fullSymbol
    };
  }

  return { 
    isValid: false, 
    error: 'Invalid crypto symbol. Use format like BTC, BTCUSD, or ETHUSDT' 
  };
};

export const generateAssetFromSymbol = (
  symbol: string, 
  category: 'Forex' | 'Stocks' | 'Crypto',
  customName?: string
): CustomAsset | null => {
  const validation = validateAssetSymbol(symbol, category);
  
  if (!validation.isValid || !validation.tradingViewSymbol) {
    return null;
  }

  return {
    symbol: symbol.toUpperCase(),
    name: customName || validation.suggestedName || symbol,
    category,
    tradingViewSymbol: validation.tradingViewSymbol,
    price: 0, // Will be fetched later
    change: 0,
    volume: undefined
  };
};