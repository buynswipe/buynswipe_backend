#!/bin/bash

echo "Starting deployment process..."

# Clean existing dependencies
echo "Cleaning existing dependencies..."
rm -rf node_modules
rm -f package-lock.json
rm -f pnpm-lock.yaml
rm -f yarn.lock

# Install dependencies with npm
echo "Installing dependencies with npm..."
npm install --legacy-peer-deps

# Build the application
echo "Building application..."
npm run build

echo "Deployment preparation complete!"
