

## Plan: Update Crypto Addresses and Add New Admin User

### 1. Update Crypto Wallet Addresses

**File: `src/pages/Wallet.tsx` (lines 39-55)**

Replace the three crypto entries with updated addresses:

| Crypto | Old Address | New Address |
|--------|------------|-------------|
| BTC | `bc1qzqmxyf6uxmtgce6jn6weefre4h8h6udm9dzu6a` | `1NXrEXRnX4Czr2xUEJuvRU6NJHQ66AS3y1` |
| SOL | `AXz6WH3MTERUNfmrTSFBCKganuPf1Jg4FJGMUk5Y5PKr` | `GpG1uaU6Tzugm6vXS4JJ6bpBQN64LnM1cFX4pjSiuEsC` |
| USDT-ERC20 -> ETH | `0xb8a0BaC9FdF3ef67BDA63638310255508Db3a12A` | `0xc42E1d12cE50f258D309f75CFf3840e724c9e359` |

The USDT-ERC20 key will be renamed to `ETH` and its label/display will update accordingly. The QR code and logo URLs will stay the same for now (they still point to existing Supabase storage images -- new QR codes/logos can be uploaded later).

---

### 2. Add New Admin User

**Method:** Insert a row into the `admin_users` table via Supabase data insert.

The user with email `Christiannse04@gmail.com` needs to be added to the `admin_users` table with `role: 'superadmin'`. 

Steps:
1. First, look up the `user_id` for `Christiannse04@gmail.com` from the `profiles` table (the user must have already signed up).
2. Insert into `admin_users`: `{ user_id, email: 'Christiannse04@gmail.com', role: 'superadmin' }`.

**Important note:** The user must have already created an account (signed up) with that email before we can add them as an admin. If they haven't signed up yet, they need to do so first, then we add them.

---

### Summary of Changes

| # | What | Where |
|---|------|-------|
| 1 | Update BTC address | `src/pages/Wallet.tsx` line 41 |
| 2 | Update SOL address | `src/pages/Wallet.tsx` line 46 |
| 3 | Rename USDT-ERC20 to ETH + update address | `src/pages/Wallet.tsx` lines 50-51 |
| 4 | Insert admin user row | `admin_users` table (database insert) |

