#!/bin/bash
echo "=== Fixing pnpm lockfile issue ==="

# Step 1: Clean everything
echo "1. Cleaning existing files..."
rm -rf node_modules
rm -f pnpm-lock.yaml

# Step 2: Clear pnpm cache
echo "2. Clearing pnpm cache..."
pnpm cache clean --force

# Step 3: Install dependencies (this will create a new lockfile)
echo "3. Installing dependencies..."
pnpm install

# Step 4: Verify build works
echo "4. Testing build..."
pnpm run build

echo "=== Fix completed! ==="
echo "Next steps:"
echo "1. Commit the new pnpm-lock.yaml file"
echo "2. Push to your repository"
echo "3. Redeploy"
