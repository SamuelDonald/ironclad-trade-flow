<!-- 8e14d2ce-90ed-44ff-a337-5488972fae73 05b076b1-1254-433b-96a9-4dc951267b62 -->
# Debug Balance Update "Non-2xx Status Code" Error

## Investigation Strategy

### Phase 1: Map the Complete Request Flow

1. Identify all files involved in balance updates:

   - Frontend form component
   - Hook that makes the API call
   - Edge function that handles the request
   - Any middleware or auth layers

2. Trace the request path:

   - Which endpoint is being called
   - Which edge function is deployed and active
   - Whether old/new functions are conflicting

### Phase 2: Frontend Investigation

1. **BalanceAdjustmentForm Component**

   - Verify form submission handler
   - Check data validation before sending
   - Confirm JSON.stringify is used correctly

2. **useBalanceUpdate Hook**

   - Check which edge function it's calling (`admin-operations` vs `balance-update`)
   - Verify request body structure
   - Check header configuration
   - Add detailed logging of outgoing request

3. **Supabase Client Configuration**

   - Verify supabase.functions.invoke usage
   - Check if proper authentication token is included

### Phase 3: Edge Function Investigation

1. **Check Deployed Functions**

   - Identify which functions are actually deployed
   - Verify `balance-update` function exists and is active
   - Check if old `admin-operations` endpoints are interfering

2. **Request Parsing**

   - Verify JSON parsing logic
   - Check for empty body handling
   - Confirm CORS headers

3. **Admin Authentication**

   - Verify admin_users table check
   - Check authorization token validation
   - Confirm service role key is configured

4. **Database Operations**

   - Check portfolio_balances table access
   - Verify RLS policies allow admin updates
   - Check for DB connection errors

### Phase 4: Response Analysis

1. **Success Path Verification**

   - Confirm all success paths return status 200
   - Verify response body structure
   - Check that `success: true` is returned

2. **Error Path Verification**

   - Check all error handlers return proper status codes
   - Verify error messages are JSON formatted
   - Confirm CORS headers on error responses

### Phase 5: Add Comprehensive Logging

1. **Frontend Logging**

   - Log exact request URL
   - Log request method and headers
   - Log stringified request body
   - Log raw response status and body

2. **Edge Function Logging**

   - Log incoming request details
   - Log parsed body
   - Log each processing step
   - Log success/error responses

### Phase 6: Root Cause Analysis

Based on logs, determine if failure is:

- **Frontend Issue**: Malformed request, wrong endpoint, missing auth
- **Edge Function Issue**: Parsing error, auth failure, DB error
- **Deployment Issue**: Wrong function deployed, environment variables missing
- **Conflict Issue**: Old and new functions interfering

### Phase 7: Implement Fix

Based on root cause, fix the specific issue:

- Update endpoint URLs
- Fix request body formatting
- Deploy correct edge function
- Fix parsing logic
- Update auth handling
- Fix response status codes

## Key Files to Inspect

```
src/components/admin/BalanceAdjustmentForm.tsx
src/hooks/useBalanceUpdate.ts
src/integrations/supabase/client.ts
supabase/functions/balance-update/index.ts
supabase/functions/admin-operations/index.ts
```

## Critical Questions to Answer

1. Which edge function is useBalanceUpdate actually calling?
2. Is the balance-update function deployed to Supabase?
3. Is the request body valid JSON?
4. Is the admin token being passed correctly?
5. What is the actual HTTP status code returned?
6. What is the actual error message in the response?
7. Are there any console errors in the edge function logs?

## Expected Outcomes

- Identify the exact line/function where the error occurs
- Understand why a non-2xx status is returned
- Implement targeted fix
- Add permanent logging for future debugging
- Verify fix works end-to-end

### To-dos

- [ ] Map complete request flow and identify all involved files
- [ ] Inspect frontend form and hook for request construction issues
- [ ] Verify which edge functions are actually deployed
- [ ] Inspect edge function parsing and response logic
- [ ] Add comprehensive logging to trace request/response
- [ ] Run test and analyze logs to identify root cause
- [ ] Implement targeted fix based on findings
- [ ] Test balance update end-to-end to confirm fix works