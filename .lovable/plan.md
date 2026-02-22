

## Plan: Add Entry Point + Record SL/TP + Display in Recent Activity

### Current State
- The `trades` table has 11 columns and is **missing** `entry_point`, `stop_loss`, and `take_profit`
- Market.tsx has Stop Loss and Take Profit inputs but **no Entry Point input**
- The trade insert calls do **not** include any of these 3 fields
- There is **no `entryPoint` state** in Market.tsx

### Step-by-Step Implementation

---

### 1. Database: Add 3 columns to `trades` table

```sql
ALTER TABLE public.trades
  ADD COLUMN IF NOT EXISTS entry_point numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stop_loss numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS take_profit numeric DEFAULT NULL;

NOTIFY pgrst, 'reload schema';
```

This must be applied first before the code changes will work.

---

### 2. `src/pages/Market.tsx`

**A. Add `entryPoint` state** (line 25, after `takeProfit`):
```ts
const [entryPoint, setEntryPoint] = useState("");
```

**B. Add Entry Point input** before the Stop Loss input (insert before line 561):
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

**C. Update `handleBuyTrade`** (line 102-112) -- add 3 fields to the insert object:
```ts
entry_point: entryPoint ? parseFloat(entryPoint) : null,
stop_loss: stopLoss ? parseFloat(stopLoss) : null,
take_profit: takeProfit ? parseFloat(takeProfit) : null,
```

**D. Update `handleSellTrade`** (lines 129-139) -- same 3 fields added to the insert.

---

### 3. `src/hooks/useTrades.ts`

**A. Extend Trade interface** (add after `created_at`):
```ts
entry_point: number | null;
stop_loss: number | null;
take_profit: number | null;
```

**B. Add processing** in the `processedTrades` map:
```ts
entry_point: trade.entry_point ? Number(trade.entry_point) : null,
stop_loss: trade.stop_loss ? Number(trade.stop_loss) : null,
take_profit: trade.take_profit ? Number(trade.take_profit) : null,
```

---

### 4. `src/pages/Portfolio.tsx` -- Recent Activity cards

Update each trade card (around lines 206-220) to show entry point, SL, and TP when present. Add below the existing `shares @ price` line:

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

### Execution Order

| Order | Action | Why |
|-------|--------|-----|
| 1 | Database migration | Columns must exist before code can write to them |
| 2 | Market.tsx changes | Add Entry Point input + save all 3 fields |
| 3 | useTrades.ts changes | Interface + data processing for new fields |
| 4 | Portfolio.tsx changes | Display the new fields in Recent Activity |

