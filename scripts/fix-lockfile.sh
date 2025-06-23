#!/bin/bash

echo "🔧 Fixing pnpm lockfile configuration mismatch..."

# Remove existing lockfile and node_modules
echo "📁 Cleaning existing files..."
rm -rf node_modules
rm -f pnpm-lock.yaml

# Clear pnpm cache
echo "🧹 Clearing pnpm cache..."
pnpm cache clean --force

# Install dependencies with new lockfile
echo "📦 Installing dependencies..."
pnpm install

# Verify build works
echo "🏗️ Testing build..."
pnpm run build

echo "✅ Lockfile fix completed!"
echo "📝 Please commit the new pnpm-lock.yaml file:"
echo "   git add pnpm-lock.yaml package.json"
echo "   git commit -m 'fix: update pnpm lockfile configuration'"
echo "   git push"
