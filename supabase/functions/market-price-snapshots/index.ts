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

    const url = new URL(req.url);
    const symbols = url.searchParams.get('symbols')?.split(',') || [];

    if (symbols.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No symbols provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Fetching price snapshots for symbols:', symbols);

    // First, try to get cached prices from database
    const { data: cachedPrices, error: dbError } = await supabaseClient
      .from('market_prices')
      .select('*')
      .in('symbol', symbols);

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // For symbols not in cache or stale data (>5 minutes old), generate mock data
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    const results: any[] = [];
    const symbolsToUpdate: string[] = [];

    for (const symbol of symbols) {
      const cached = cachedPrices?.find(p => p.symbol === symbol);
      
      if (!cached || new Date(cached.updated_at) < fiveMinutesAgo) {
        symbolsToUpdate.push(symbol);
        
        // Generate mock price data based on symbol type
        let price, change_value, change_percent;
        
        if (symbol.includes('USD') || symbol.includes('EUR') || symbol.includes('GBP')) {
          // Forex pair
          price = parseFloat((Math.random() * 2 + 0.5).toFixed(4));
          change_value = parseFloat((Math.random() * 0.02 - 0.01).toFixed(4));
          change_percent = parseFloat(((change_value / price) * 100).toFixed(2));
        } else if (['BTC', 'ETH', 'SOL', 'USDT'].includes(symbol)) {
          // Crypto
          const basePrice = symbol === 'BTC' ? 45000 : symbol === 'ETH' ? 2500 : symbol === 'SOL' ? 100 : 1;
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
          updated_at: now.toISOString()
        };

        results.push(priceData);
      } else {
        results.push(cached);
      }
    }

    // Update database with new prices
    if (symbolsToUpdate.length > 0) {
      const updateData = results.filter(r => symbolsToUpdate.includes(r.symbol));
      
      const { error: upsertError } = await supabaseClient
        .from('market_prices')
        .upsert(updateData, { onConflict: 'symbol' });

      if (upsertError) {
        console.error('Error updating market prices:', upsertError);
      } else {
        console.log('Updated prices for symbols:', symbolsToUpdate);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: results,
        updated_symbols: symbolsToUpdate 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in market-price-snapshots:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});