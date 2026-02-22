

## Plan: Record Trades to Database + Rename App

### Problem
When a user places a Buy or Sell trade on the Market page, only a toast notification is shown. No record is saved to the database, so the "Recent Activity" section on the Portfolio dashboard is always empty.

### Fix: Update Market.tsx Trade Handlers

**File: `src/pages/Market.tsx`**

1. Add `import { supabase } from '@/integrations/supabase/client';`

2. Replace `handleBuyTrade` (lines 93-98) to:
   - Get the authenticated user via `supabase.auth.getUser()`
   - Calculate `total_amount = price * lotSize`
   - Insert a row into the `trades` table with type `'buy'`, symbol, name, shares (lotSize), price, total_amount, category, status `'completed'`, and user_id
   - Show success toast on success, error toast on failure

3. Replace `handleSellTrade` (lines 100-105) with the same logic but type `'sell'`

No database changes are needed -- the `trades` table already has the right columns and RLS policy allows users to insert their own trades.

### Rename App: "IronClad Trade Hub" to "PrimeLink Unity Services"

Update all occurrences in:

- **`index.html`** -- title tag, meta descriptions, og/twitter tags
- **`src/pages/Auth.tsx`** -- login page heading
- **`src/pages/Settings.tsx`** -- about section, dev team, support email
- **`supabase/functions/send-confirmation-email/index.ts`** -- email branding

### Result
After these changes, every Buy/Sell trade placed from the Market page will be saved to the database and immediately appear in the Portfolio's "Recent Activity" section (the `useTrades` hook already has a real-time subscription on the `trades` table).

