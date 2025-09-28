-- Create portfolio_balances table for user financial data
CREATE TABLE public.portfolio_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cash_balance DECIMAL(15,2) DEFAULT 0,
  invested_amount DECIMAL(15,2) DEFAULT 0,
  free_margin DECIMAL(15,2) DEFAULT 0,
  total_value DECIMAL(15,2) DEFAULT 0,
  daily_change DECIMAL(15,2) DEFAULT 0,
  daily_change_percent DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create transactions table for deposit/withdrawal history
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  amount DECIMAL(15,2) NOT NULL,
  method TEXT NOT NULL, -- 'card', 'paypal', 'crypto'
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  crypto_type TEXT, -- 'BTC', 'SOL', 'USDT' for crypto transactions
  transaction_hash TEXT, -- for crypto transactions
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create holdings table for user asset positions
CREATE TABLE public.holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  shares DECIMAL(15,6) NOT NULL,
  average_price DECIMAL(15,6) NOT NULL,
  current_price DECIMAL(15,6) DEFAULT 0,
  total_value DECIMAL(15,2) DEFAULT 0,
  profit_loss DECIMAL(15,2) DEFAULT 0,
  profit_loss_percent DECIMAL(5,2) DEFAULT 0,
  category TEXT NOT NULL, -- 'Stocks', 'Crypto', 'Forex'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- Create trades table for trading activity
CREATE TABLE public.trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  shares DECIMAL(15,6) NOT NULL,
  price DECIMAL(15,6) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  category TEXT NOT NULL, -- 'Stocks', 'Crypto', 'Forex'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.portfolio_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for portfolio_balances
CREATE POLICY "Users can view their own portfolio balances" 
ON public.portfolio_balances 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolio balances" 
ON public.portfolio_balances 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio balances" 
ON public.portfolio_balances 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for holdings
CREATE POLICY "Users can view their own holdings" 
ON public.holdings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own holdings" 
ON public.holdings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own holdings" 
ON public.holdings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own holdings" 
ON public.holdings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for trades
CREATE POLICY "Users can view their own trades" 
ON public.trades 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades" 
ON public.trades 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_portfolio_balances_updated_at
BEFORE UPDATE ON public.portfolio_balances
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_holdings_updated_at
BEFORE UPDATE ON public.holdings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();