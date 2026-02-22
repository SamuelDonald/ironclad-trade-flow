

## Plan: Add Entry Point Field + Record SL/TP + Show in Recent Activity

### Root Cause
The database migration to add `entry_point`, `stop_loss`, and `take_profit` columns was never applied. The trades table only has: id, user_id, symbol, name, type, shares, price, total_amount, status, category, created_at.

### Step-by-Step Fix

---

### 1. Database Migration (required first)

Add 3 new nullable numeric columns to the `trades` table:

```sql
ALTER TABLE public.trades
  ADD COLUMN IF NOT EXISTS entry_point numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stop_loss numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS take_profit numeric DEFAULT NULL;

NOTIFY pgrst, 'reload schema';
```

The `NOTIFY pgrst` ensures Supabase's API layer recognizes the new columns immediately.

---

### 2. Update `src/pages/Market.tsx`

**Add `entryPoint` state** (around line 25, alongside existing `stopLoss` and `takeProfit`):
```ts
const [entryPoint, setEntryPoint] = useState("");
```

**Add Entry Point input field** before the Stop Loss input (insert before line 561):
```tsx
<div>
  <Label htmlFor="entry-point" className="text-sm font-medium">Entry Point</Label>
  <Input
    id="entry-point"
    placeholder="Optional"
    value={entryPoint}
    onChange={(e) => setEntryPoint(e.target.value)}
    className="w-full"
  />
</div>
```

**Update `handleBuyTrade`** (lines 102-112) to include the 3 new fields in the insert object:
```ts
entry_point: entryPoint ? parseFloat(entryPoint) : null,
stop_loss: stopLoss ? parseFloat(stopLoss) : null,
take_profit: takeProfit ? parseFloat(takeProfit) : null,
```

**Update `handleSellTrade`** (lines 129-139) with the same 3 fields.

---

### 3. Update `src/hooks/useTrades.ts`

Add to the `Trade` interface (after `created_at`):
```ts
entry_point: number | null;
stop_loss: number | null;
take_profit: number | null;
```

Add processing in `processedTrades` map:
```ts
entry_point: trade.entry_point ? Number(trade.entry_point) : null,
stop_loss: trade.stop_loss ? Number(trade.stop_loss) : null,
take_profit: trade.take_profit ? Number(trade.take_profit) : null,
```

---

### 4. Update `src/pages/Portfolio.tsx` - Recent Activity cards

Update each trade card (around lines 206-227) to show the new fields when they exist. Below the existing `shares @ price` line, add:
```tsx
{activity.entry_point && (
  <p className="text-xs text-muted-foreground">Entry: ${activity.entry_point}</p>
)}
{activity.stop_loss && (
  <p className="text-xs text-muted-foreground">SL: ${activity.stop_loss}</p>
)}
{activity.take_profit && (
  <p className="text-xs text-muted-foreground">TP: ${activity.take_profit}</p>
)}
```

---

### Summary

| Step | File/Action | What |
|------|------------|------|
| 1 | Database migration | Add 3 columns + reload schema cache |
| 2 | `src/pages/Market.tsx` | Add Entry Point input + save all 3 fields on trade |
| 3 | `src/hooks/useTrades.ts` | Add 3 fields to interface + processing |
| 4 | `src/pages/Portfolio.tsx` | Display EP, SL, TP in Recent Activity |

