

## Plan: Add Entry Point Field + Show Trade Details in Recent Activity

### Problem
The trading panel only has Stop Loss and Take Profit inputs but is missing an Entry Point field. Additionally, none of these values (entry point, stop loss, take profit) are saved to the database or displayed in the Recent Activity on the Portfolio dashboard.

### Changes Required

---

### 1. Database Migration: Add 3 columns to `trades` table

Add `entry_point`, `stop_loss`, and `take_profit` (all nullable numeric) to the existing `trades` table.

```sql
ALTER TABLE public.trades
  ADD COLUMN entry_point numeric DEFAULT NULL,
  ADD COLUMN stop_loss numeric DEFAULT NULL,
  ADD COLUMN take_profit numeric DEFAULT NULL;
```

---

### 2. Update `src/pages/Market.tsx`

**Add state** for entry point:
- New state: `const [entryPoint, setEntryPoint] = useState("");`

**Add Entry Point input** in the trading panel (before the Stop Loss field, around line 561):
- A labeled input field matching the style of Stop Loss and Take Profit

**Update `handleBuyTrade` and `handleSellTrade`** to include the three new fields in the insert:
- `entry_point: entryPoint ? parseFloat(entryPoint) : null`
- `stop_loss: stopLoss ? parseFloat(stopLoss) : null`
- `take_profit: takeProfit ? parseFloat(takeProfit) : null`

---

### 3. Update `src/hooks/useTrades.ts`

Add `entry_point`, `stop_loss`, and `take_profit` to the `Trade` interface (all `number | null`).

---

### 4. Update `src/pages/Portfolio.tsx` - Recent Activity section

Update the trade display (lines 206-227) to show entry point, stop loss, and take profit when they exist. Each trade card will show these values as small detail lines beneath the existing price/shares info.

---

### Summary

| File | Change |
|------|--------|
| Database migration | Add 3 nullable columns to `trades` |
| `src/pages/Market.tsx` | Add Entry Point input + save all 3 fields on trade |
| `src/hooks/useTrades.ts` | Add 3 fields to Trade interface |
| `src/pages/Portfolio.tsx` | Display entry point, SL, TP in Recent Activity cards |

