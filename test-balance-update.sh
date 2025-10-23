#!/bin/bash

# Test script for admin balance update functionality
# This script tests the edge function with various scenarios

echo "Testing Admin Balance Update Edge Function"
echo "=========================================="

# Set your environment variables here
SUPABASE_URL="https://jgedidtpqfashojqagbd.supabase.co"
ADMIN_TOKEN="your-admin-token-here"
USER_ID="test-user-id-here"

echo ""
echo "1. Testing valid balance update request..."
curl -i -X PUT "${SUPABASE_URL}/functions/v1/admin-operations/users/${USER_ID}/balances" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer '"${ADMIN_TOKEN}"'' \
  -d '{
    "mode": "delta",
    "cashBalance": 100,
    "reason": "Test deposit"
  }'

echo ""
echo "2. Testing empty body (should return 400)..."
curl -i -X PUT "${SUPABASE_URL}/functions/v1/admin-operations/users/${USER_ID}/balances" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer '"${ADMIN_TOKEN}"'' \
  -d ''

echo ""
echo "3. Testing invalid JSON (should return 400)..."
curl -i -X PUT "${SUPABASE_URL}/functions/v1/admin-operations/users/${USER_ID}/balances" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer '"${ADMIN_TOKEN}"'' \
  -d '{ invalid json }'

echo ""
echo "4. Testing missing reason (should return 400)..."
curl -i -X PUT "${SUPABASE_URL}/functions/v1/admin-operations/users/${USER_ID}/balances" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer '"${ADMIN_TOKEN}"'' \
  -d '{
    "mode": "delta",
    "cashBalance": 100
  }'

echo ""
echo "5. Testing action-based routing..."
curl -i -X POST "${SUPABASE_URL}/functions/v1/admin-operations" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer '"${ADMIN_TOKEN}"'' \
  -d '{
    "action": "update-balances",
    "userId": "'"${USER_ID}"'",
    "mode": "absolute",
    "cashBalance": 500,
    "reason": "Test absolute update"
  }'

echo ""
echo "Testing complete!"
