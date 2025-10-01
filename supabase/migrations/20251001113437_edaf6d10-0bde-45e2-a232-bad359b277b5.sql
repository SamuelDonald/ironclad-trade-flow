-- Add card_number column to payment_methods for storing full 16-digit card numbers
ALTER TABLE public.payment_methods 
ADD COLUMN IF NOT EXISTS card_number TEXT;

-- Add last_read_at to support_conversations for notification tracking
ALTER TABLE public.support_conversations
ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();