#!/bin/bash
# Test script to verify that the API URL is correctly set for production

echo "Checking API Configuration..."
echo "============================="

# Print current environment variables
echo "Current environment variables:"
if [ -f .env ]; then
  echo "Contents of .env file:"
  cat .env | grep VITE_API_BASE_URL
else
  echo ".env file not found"
fi

# Build the app with debugging enabled
echo -e "\nRunning test build..."
VITE_DEBUG=true npm run build

echo -e "\nAPI should be configured to use: https://nova-prop-backend.onrender.com/api"
echo "============================="

# Restore development configuration if needed
# echo "Restoring development configuration..."
# cp .env.development .env

echo "Test complete."
