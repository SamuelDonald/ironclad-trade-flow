import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { symbol, category } = await req.json();

    if (!symbol || !category) {
      return new Response(
        JSON.stringify({ error: 'Symbol and category are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Validating and fetching price for:', symbol, category);

    // Validate symbol format based on category
    let isValid = false;
    let tradingViewSymbol = '';

    switch (category.toLowerCase()) {
      case 'forex':
        // Forex should be like EURUSD, GBPJPY, etc.
        isValid = /^[A-Z]{6}$/.test(symbol);
        tradingViewSymbol = `FX:${symbol}`;
        break;
      case 'stocks':
        // Stocks should be like AAPL, TSLA, etc.
        isValid = /^[A-Z]{1,5}$/.test(symbol);
        tradingViewSymbol = `NASDAQ:${symbol}`;
        break;
      case 'crypto':
        // Crypto should be like BTCUSDT, ETHUSDT, etc.
        isValid = /^[A-Z]{3,}USDT?$/.test(symbol) || ['BTC', 'ETH', 'SOL'].includes(symbol);
        tradingViewSymbol = `BINANCE:${symbol}USDT`;
        if (['BTC', 'ETH', 'SOL'].includes(symbol)) {
          tradingViewSymbol = `BINANCE:${symbol}USDT`;
        }
        break;
      default:
        isValid = false;
    }

    if (!isValid) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid symbol format for category',
          valid: false,
          suggested_format: (category.toLowerCase() === 'forex') ? 'EURUSD, GBPJPY, etc.' :
                           (category.toLowerCase() === 'stocks') ? 'AAPL, TSLA, etc.' :
                           (category.toLowerCase() === 'crypto') ? 'BTCUSDT, ETHUSDT, etc.' : 'Unknown'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate mock price data
    let price, change_value, change_percent;
    
    if (category.toLowerCase() === 'forex') {
      price = parseFloat((Math.random() * 2 + 0.5).toFixed(4));
      change_value = parseFloat((Math.random() * 0.02 - 0.01).toFixed(4));
      change_percent = parseFloat(((change_value / price) * 100).toFixed(2));
    } else if (category.toLowerCase() === 'crypto') {
      const basePrice = symbol.startsWith('BTC') ? 45000 : symbol.startsWith('ETH') ? 2500 : symbol.startsWith('SOL') ? 100 : 50;
      price = parseFloat((basePrice + (Math.random() * basePrice * 0.1 - basePrice * 0.05)).toFixed(2));
      change_value = parseFloat((Math.random() * 1000 - 500).toFixed(2));
      change_percent = parseFloat(((change_value / price) * 100).toFixed(2));
    } else {
      // Stock
      price = parseFloat((Math.random() * 500 + 50).toFixed(2));
      change_value = parseFloat((Math.random() * 20 - 10).toFixed(2));
      change_percent = parseFloat(((change_value / price) * 100).toFixed(2));
    }

    const priceData = {
      symbol,
      price,
      change_value,
      change_percent,
      volume: Math.floor(Math.random() * 1000000),
      updated_at: new Date().toISOString()
    };

    // Store in market_prices table
    const { error: upsertError } = await supabaseClient
      .from('market_prices')
      .upsert([priceData], { onConflict: 'symbol' });

    if (upsertError) {
      console.error('Error storing market price:', upsertError);
    }

    // Also ensure it exists in market_assets table
    const { error: assetError } = await supabaseClient
      .from('market_assets')
      .upsert([{
        symbol,
        name: symbol, // Use symbol as name for now
        category: category.charAt(0).toUpperCase() + category.slice(1),
        active: true,
        meta: { trading_view_symbol: tradingViewSymbol }
      }], { onConflict: 'symbol' });

    if (assetError) {
      console.error('Error storing market asset:', assetError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        valid: true,
        data: {
          ...priceData,
          trading_view_symbol: tradingViewSymbol
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in market-price-validation:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});