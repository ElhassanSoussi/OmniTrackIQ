#!/bin/bash
# Smoke test script for API verification
# Usage: ./scripts/smoke_api.sh [base_url]

BASE_URL=${1:-"http://localhost:8001"}
echo "Running smoke tests against $BASE_URL..."

# 1. Health Check
echo -n "Checking /health/ready... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/health/ready")
if [ "$HTTP_CODE" == "200" ]; then
    echo "✅ OK"
else
    echo "❌ FAILED ($HTTP_CODE)"
    exit 1
fi

# 2. OpenAPI JSON
echo -n "Checking /openapi.json... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/openapi.json")
if [ "$HTTP_CODE" == "200" ]; then
    echo "✅ OK"
else
    echo "❌ FAILED ($HTTP_CODE)"
    exit 1
fi

# 3. Auth Endpoint (Protected)
# We expect 401 Unauthorized if no token, which confirms the endpoint exists and auth middleware is working.
# If 404, it's broken.
echo -n "Checking /auth/me existence... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/auth/me")
if [ "$HTTP_CODE" == "401" ]; then
    echo "✅ OK (Protected)"
elif [ "$HTTP_CODE" == "200" ]; then
    echo "⚠️  WARNING: Endpoint is public? ($HTTP_CODE)"
else
    echo "❌ FAILED ($HTTP_CODE)"
    exit 1
fi

echo "Smoke tests passed!"
exit 0
