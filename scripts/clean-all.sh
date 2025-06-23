#!/bin/bash

echo "Cleaning all package manager files..."

# Remove all lock files
rm -f package-lock.json
rm -f pnpm-lock.yaml
rm -f yarn.lock
rm -f bun.lockb

# Remove node_modules
rm -rf node_modules

# Remove .next build cache
rm -rf .next

# Clear npm cache
npm cache clean --force

echo "All package manager files cleaned!"
