#!/bin/bash

echo "Starting deployment process..."

# Clean existing dependencies and lock files
echo "Cleaning existing dependencies..."
rm -rf node_modules
rm -f package-lock.json
rm -f pnpm-lock.yaml
rm -f yarn.lock
rm -rf .next

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Install dependencies with npm
echo "Installing dependencies with npm..."
npm install --legacy-peer-deps --no-package-lock

# Verify installation
echo "Verifying installation..."
npm list --depth=0

# Build the application
echo "Building application..."
npm run build

echo "Deployment preparation complete!"
