#!/bin/bash

echo "🔍 Admin Panel Debug Script"
echo "=========================="

# Test server connectivity
echo "Testing server connectivity..."
curl -s -X GET "http://localhost:18562/api/admin/test" | jq '.'

echo ""
echo "Testing admin authentication..."
curl -s -X GET "http://localhost:18562/api/admin/dashboard/stats" \
  -H "Authorization: Bearer admin-token" | jq '.'

echo ""
echo "Testing products endpoint..."
curl -s -X GET "http://localhost:18562/api/products?limit=5" | jq '.success'

echo ""
echo "Testing contacts endpoint..."
curl -s -X GET "http://localhost:18562/api/contact" \
  -H "Authorization: Bearer admin-token" | jq '.success'

echo ""
echo "Testing testimonials endpoint..."
curl -s -X GET "http://localhost:18562/api/testimonials/admin?status=all" \
  -H "Authorization: Bearer admin-token" | jq '.success'

echo ""
echo "✅ Debug script completed"
