#!/bin/bash

echo "Updating pnpm lockfile..."

# Remove existing lockfile and node_modules
rm -rf node_modules
rm -f pnpm-lock.yaml

# Clear pnpm cache
pnpm cache clean --force

# Install dependencies to generate new lockfile
pnpm install

# Verify the build works
echo "Testing build..."
pnpm run build

echo "Lockfile updated successfully!"
echo "Please commit the new pnpm-lock.yaml file to your repository."
