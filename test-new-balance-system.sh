#!/bin/bash

# Test script for the new balance update system
# This script tests the dedicated balance-update edge function

echo "Testing New Balance Update System"
echo "================================="

# Set your environment variables here
SUPABASE_URL="https://jgedidtpqfashojqagbd.supabase.co"
ADMIN_TOKEN="your-admin-token-here"
USER_ID="test-user-id-here"

echo ""
echo "1. Testing valid delta balance update..."
curl -i -X POST "${SUPABASE_URL}/functions/v1/balance-update" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer '"${ADMIN_TOKEN}"'' \
  -d '{
    "userId": "'"${USER_ID}"'",
    "mode": "delta",
    "cashBalance": 100,
    "investedAmount": 50,
    "reason": "Test delta update"
  }'

echo ""
echo "2. Testing valid absolute balance update..."
curl -i -X POST "${SUPABASE_URL}/functions/v1/balance-update" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer '"${ADMIN_TOKEN}"'' \
  -d '{
    "userId": "'"${USER_ID}"'",
    "mode": "absolute",
    "cashBalance": 1000,
    "freeMargin": 500,
    "reason": "Test absolute update"
  }'

echo ""
echo "3. Testing empty body (should return 400)..."
curl -i -X POST "${SUPABASE_URL}/functions/v1/balance-update" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer '"${ADMIN_TOKEN}"'' \
  -d ''

echo ""
echo "4. Testing invalid JSON (should return 400)..."
curl -i -X POST "${SUPABASE_URL}/functions/v1/balance-update" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer '"${ADMIN_TOKEN}"'' \
  -d '{ invalid json }'

echo ""
echo "5. Testing missing userId (should return 400)..."
curl -i -X POST "${SUPABASE_URL}/functions/v1/balance-update" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer '"${ADMIN_TOKEN}"'' \
  -d '{
    "mode": "delta",
    "cashBalance": 100,
    "reason": "Test missing userId"
  }'

echo ""
echo "6. Testing missing reason (should return 400)..."
curl -i -X POST "${SUPABASE_URL}/functions/v1/balance-update" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer '"${ADMIN_TOKEN}"'' \
  -d '{
    "userId": "'"${USER_ID}"'",
    "mode": "delta",
    "cashBalance": 100
  }'

echo ""
echo "7. Testing invalid mode (should return 400)..."
curl -i -X POST "${SUPABASE_URL}/functions/v1/balance-update" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer '"${ADMIN_TOKEN}"'' \
  -d '{
    "userId": "'"${USER_ID}"'",
    "mode": "invalid",
    "cashBalance": 100,
    "reason": "Test invalid mode"
  }'

echo ""
echo "8. Testing no balance fields (should return 400)..."
curl -i -X POST "${SUPABASE_URL}/functions/v1/balance-update" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer '"${ADMIN_TOKEN}"'' \
  -d '{
    "userId": "'"${USER_ID}"'",
    "mode": "delta",
    "reason": "Test no balance fields"
  }'

echo ""
echo "9. Testing wrong HTTP method (should return 405)..."
curl -i -X GET "${SUPABASE_URL}/functions/v1/balance-update" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer '"${ADMIN_TOKEN}"''

echo ""
echo "Testing complete!"
echo ""
echo "Expected Results:"
echo "- Tests 1-2: Should return 200 with success: true"
echo "- Tests 3-8: Should return 400 with validation errors"
echo "- Test 9: Should return 405 Method Not Allowed"
