-- Add new columns to watchlist table for custom asset support
ALTER TABLE public.watchlist 
ADD COLUMN trading_view_symbol TEXT,
ADD COLUMN price NUMERIC,
ADD COLUMN change_value NUMERIC,
ADD COLUMN volume BIGINT,
ADD COLUMN is_custom BOOLEAN DEFAULT FALSE;

-- Update existing records to mark them as predefined assets
UPDATE public.watchlist SET is_custom = FALSE WHERE is_custom IS NULL;