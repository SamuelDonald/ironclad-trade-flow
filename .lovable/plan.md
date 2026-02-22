

## Fix: Trade Cards Theme Mismatch

### Problem
The Recent Activity trade cards in `src/pages/Portfolio.tsx` use `bg-gray-50` (line 210), which is a light white/gray background that clashes with the dark Binance-style theme used throughout the app.

### Change

**File: `src/pages/Portfolio.tsx` (line 210)**

Replace:
```
className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
```

With:
```
className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border"
```

This uses `bg-secondary/50` (dark neutral from the theme) with a subtle border, matching the existing card and UI styling throughout the app.

