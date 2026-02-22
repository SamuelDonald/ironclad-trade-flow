
## Remove Holdings Section from Portfolio

### Change

**File: `src/pages/Portfolio.tsx`**

Remove the entire Holdings card block (lines 234-327) -- from `{/* Holdings */}` through the closing `</Card>`.

Also remove the now-unused import and hook:
- Remove `useHoldings` import (line 8)
- Remove `const { holdings, loading: holdingsLoading } = useHoldings();` (line 26)
- Remove `TrendingUp, TrendingDown` from lucide imports if they are only used in Holdings (they are also used in Watchlist, so they stay)

### Technical Details

| What | Action |
|------|--------|
| Line 8: `import { useHoldings }` | Remove |
| Line 26: `const { holdings, loading: holdingsLoading } = useHoldings();` | Remove |
| Lines 234-327: Entire Holdings `<Card>` block | Remove |
